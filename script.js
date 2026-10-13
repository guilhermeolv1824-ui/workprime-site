(function () {
  // ---- mobile menu
  var nav = document.getElementById('site-nav');
  var toggle = document.getElementById('nav-toggle');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); }
  });

  // ---- carousel (3 / 2 / 1 per view)
  var track = document.getElementById('carousel-track');
  var prev = document.getElementById('carousel-prev');
  var next = document.getElementById('carousel-next');
  var slides = track.children;
  var index = 0;
  function perView() {
    if (window.matchMedia('(min-width:64rem)').matches) return 3;
    if (window.matchMedia('(min-width:40rem)').matches) return 2;
    return 1;
  }
  function render() {
    var max = Math.max(0, slides.length - perView());
    index = Math.min(Math.max(index, 0), max);
    track.style.transform = 'translateX(' + (-index * 100 / perView()) + '%)';
    prev.disabled = index === 0;
    next.disabled = index === max;
  }
  prev.addEventListener('click', function () { index--; render(); });
  next.addEventListener('click', function () { index++; render(); });
  window.addEventListener('resize', render);
  render();

  // ---- lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var items = Array.prototype.map.call(slides, function (s) {
    var img = s.querySelector('img');
    return { src: img.currentSrc || img.src, alt: img.alt, title: s.querySelector('h4').textContent, town: s.querySelector('figcaption p').textContent };
  });
  var cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + items.length) % items.length;
    var it = items[cur];
    lbImg.src = it.src; lbImg.alt = it.alt;
    lbCap.textContent = it.title + ' · ' + it.town + ' — ' + (cur + 1) + ' / ' + items.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i); lb.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }
  function close() {
    lb.hidden = true; document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  track.addEventListener('click', function (e) {
    var b = e.target.closest('.gallery-open');
    if (b) open(parseInt(b.dataset.index, 10));
  });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function () { show(cur - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });

  // ---- form: character counter (submission handler goes here once the backend is chosen)
  var msg = document.getElementById('message');
  var count = document.getElementById('message-count');
  msg.addEventListener('input', function () { count.textContent = msg.value.length; });
  var form = document.getElementById('estimate-form');
  var status = document.getElementById('form-status');
  var ENDPOINT = 'https://formsubmit.co/ajax/workprimerp@gmail.com'; // delivers submissions to this inbox
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    status.className = 'mt-4 text-center text-sm text-muted-foreground';
    if (form.website.value) { status.textContent = 'Thanks! We got your request.'; form.reset(); return; } // spam trap
    var data = {};
    new FormData(form).forEach(function (v, k) { if (k !== 'website') data[k] = v; });
    data._subject = 'New estimate request: ' + data.project_type + ' in ' + data.project_town;
    data._template = 'table';
    data._captcha = 'false';
    btn.disabled = true; status.textContent = 'Sending…';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (b) { if (!r.ok || b.success === 'false') throw new Error(); }); })
      .then(function () { status.className = 'mt-4 text-center text-sm text-gold'; status.textContent = "Thanks! We got your request and will reach out soon."; form.reset(); count.textContent = '0'; })
      .catch(function () { status.className = 'mt-4 text-center text-sm text-red-400'; status.innerHTML = 'Something went wrong. Please call <a class="text-gold underline" href="tel:+18562208261">(856) 220-8261</a> or email <a class="text-gold underline" href="mailto:workprimerp@gmail.com">workprimerp@gmail.com</a>.'; })
      .finally(function () { btn.disabled = false; });
  });
})();
