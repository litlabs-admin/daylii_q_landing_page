/* dayliiIQ landing — audience toggle (Retailer <-> Manufacturer) + footer year */
(function () {
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

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
