/* dayliiIQ landing — interactions
   - audience toggle (Retailer <-> Manufacturer)
   - scroll reveal (IntersectionObserver)
   - proof stat count-up
   - nav scroll state
   - footer year
   Honors prefers-reduced-motion.
*/
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- audience toggle ---- */
  var body = document.body;
  var btns = document.querySelectorAll('.seg button');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var aud = b.getAttribute('data-aud');
      body.className = 'aud-' + aud;
      btns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-selected', on);
      });
      document.querySelectorAll('.aud-line').forEach(function (l) {
        l.style.display = l.classList.contains(aud === 'retailer' ? 'ret' : 'mfr') ? 'block' : 'none';
      });
    });
  });

  /* ---- nav scroll state + scroll progress ---- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- nav scroll-spy (active section) ---- */
  var spyLinks = {};
  document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (id) spyLinks[id] = a;
  });
  var spyTargets = Object.keys(spyLinks).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(spyLinks).forEach(function (id) { spyLinks[id].classList.toggle('active', id === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---- count-up for proof stats ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var dur = 1400, start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString('en-US') + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.big[data-count]').forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute('data-count')).toLocaleString('en-US') + (el.getAttribute('data-suffix') || '');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        if (el.querySelectorAll) {
          el.querySelectorAll('.big[data-count]').forEach(function (n) { countUp(n); });
        }
        io.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- continuous float for product cards (paused offscreen) ---- */
  var floatEls = document.querySelectorAll('.float');
  floatEls.forEach(function (el) { el.classList.add('in'); }); // unlock card state (e.g. confidence bars)
  if (!reduce && 'IntersectionObserver' in window) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('float-on', e.isIntersecting); });
    }, { threshold: 0 });
    floatEls.forEach(function (el) { fio.observe(el); });
  }

  /* ---- typewriter (hero command card) ---- */
  var tw = document.getElementById('tw');
  if (tw) {
    var phrases = [
      'Determining eligibility for Flonase Allergy Relief 24HR…',
      'Flonase — Eligible · 0.98 confidence · cited to IRS §213(d).',
      'Vitamin B12 — LMN required · cited to IRS §213(d).',
      'Sensodyne Pronamel — Ineligible · not medically necessary.'
    ];
    if (reduce) {
      tw.textContent = phrases[1];
    } else {
      var pi = 0, ci = 0, deleting = false;
      var TYPE = 50, DELETE = 26, HOLD = 1600, GAP = 320;
      (function tick() {
        var full = phrases[pi];
        if (!deleting) {
          ci++;
          tw.textContent = full.slice(0, ci);
          if (ci >= full.length) { deleting = true; return setTimeout(tick, HOLD); }
          setTimeout(tick, TYPE);
        } else {
          ci--;
          tw.textContent = full.slice(0, ci);
          if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, GAP); }
          setTimeout(tick, DELETE);
        }
      })();
    }
  }

  /* ---- footer year ---- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- load more articles ----
     Initial HTML only ever contains the first 10 cards (server-rendered).
     Everything past that lives in /articles/manifest.json (lean JSON, not
     HTML) and gets fetched once + rendered into the DOM a batch at a time —
     keeps the page's initial weight flat regardless of how many articles
     exist. buildCardEl() below must stay in sync with the markup produced
     by renderCard() in scripts/templates/article-card.js. */
  function buildCardEl(article, index) {
    var li = document.createElement('li');
    li.className = 'article-card reveal';
    li.style.setProperty('--ty', '120px');
    li.style.setProperty('--d', (index % 3) * 0.08 + 's');

    var a = document.createElement('a');
    a.className = 'article-card__link';
    a.href = '/articles/' + article.slug + '/';

    var frame = document.createElement('div');
    frame.className = 'article-card__frame';
    var thumb = document.createElement('div');
    thumb.className = 'article-card__thumb';
    if (article.featuredImage) {
      var img = document.createElement('img');
      img.src = article.featuredImage;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      thumb.appendChild(img);
    }
    frame.appendChild(thumb);

    var body = document.createElement('div');
    body.className = 'article-card__body';

    var meta = document.createElement('div');
    meta.className = 'article-card__meta';
    if (article.category) {
      var tag = document.createElement('span');
      tag.className = 'article-card__tag';
      tag.textContent = article.category;
      meta.appendChild(tag);
    }
    var time = document.createElement('time');
    time.setAttribute('datetime', article.publishedDate);
    time.textContent = new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    meta.appendChild(time);

    var h2 = document.createElement('h2');
    h2.className = 'article-card__title';
    h2.textContent = article.title;

    var footer = document.createElement('div');
    footer.className = 'article-card__footer';
    var read = document.createElement('span');
    read.className = 'article-card__read';
    read.textContent = 'Read article';
    var arrow = document.createElement('span');
    arrow.className = 'article-card__arrow';
    arrow.innerHTML = '<svg class="ic"><use href="#i-arrow"></use></svg>';
    footer.appendChild(read);
    footer.appendChild(arrow);

    body.appendChild(meta);
    body.appendChild(h2);
    body.appendChild(footer);
    a.appendChild(frame);
    a.appendChild(body);
    li.appendChild(a);
    return li;
  }

  var loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    var manifestUrl = loadMoreBtn.getAttribute('data-manifest');
    var listEl = document.getElementById(loadMoreBtn.getAttribute('data-list'));
    var batchSize = parseInt(loadMoreBtn.getAttribute('data-batch'), 10) || 3;
    var shown = parseInt(loadMoreBtn.getAttribute('data-shown'), 10) || 0;
    var statusEl = document.getElementById('load-more-status');
    var manifest = null; // fetched once, cached for subsequent clicks

    function announce(msg) { if (statusEl) statusEl.textContent = msg; }

    function loadBatch() {
      var batch = manifest.slice(shown, shown + batchSize);
      var frag = document.createDocumentFragment();
      batch.forEach(function (article, i) { frag.appendChild(buildCardEl(article, shown + i)); });
      listEl.appendChild(frag);
      // two rAFs so the browser paints the .reveal starting state before
      // switching to .in — otherwise the transition has nothing to animate from.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          listEl.querySelectorAll('.article-card.reveal:not(.in)').forEach(function (c) { c.classList.add('in'); });
        });
      });
      shown += batch.length;
      var remaining = manifest.length - shown;
      if (remaining <= 0) {
        loadMoreBtn.hidden = true;
        announce('All ' + manifest.length + ' articles loaded.');
      } else {
        announce(batch.length + ' more article' + (batch.length === 1 ? '' : 's') + ' loaded, ' + remaining + ' remaining.');
      }
    }

    loadMoreBtn.addEventListener('click', function () {
      if (manifest) { loadBatch(); return; }
      loadMoreBtn.disabled = true;
      announce('Loading more articles…');
      fetch(manifestUrl)
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function (data) {
          manifest = data;
          loadMoreBtn.disabled = false;
          loadBatch();
        })
        .catch(function () {
          loadMoreBtn.disabled = false;
          announce('Could not load more articles — please try again.');
        });
    });
  }
})();
