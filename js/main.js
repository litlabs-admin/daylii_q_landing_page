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
      'Benefiber Fiber Powder — LMN required · cited to IRS §213(d).',
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
})();
