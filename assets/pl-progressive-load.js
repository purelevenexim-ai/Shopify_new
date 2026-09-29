/* PureLeven progressive image loader.
   Below-the-fold lazy images are released in batches (default 20), nearest to the visitor first,
   one batch at a time. Config: window.PL_SPEED = { batch, gap, settle } (set in snippets/lazy-load-images). */
(function () {
  'use strict';

  var cfg = window.PL_SPEED || {};
  var conn = navigator.connection || {};
  if (conn.saveData) return;

  var size = Math.max(1, parseInt(cfg.batch, 10) || 20);
  if (/(^|-)[23]g$/.test(conn.effectiveType || '')) size = Math.max(5, Math.ceil(size / 2));
  var gap = cfg.gap == null ? 250 : cfg.gap;
  var settleMs = cfg.settle || 10000;

  var pending = [];
  var stats = (window.plProgressive = { size: size, batches: [], remaining: 0, done: false });

  function loaded(img) {
    return img.complete && img.naturalWidth > 0;
  }

  function idle(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 1000 });
    else setTimeout(fn, 0);
  }

  function collect() {
    var list = document.querySelectorAll('img[loading="lazy"]');
    for (var i = 0; i < list.length; i++) {
      var img = list[i];
      if (loaded(img)) continue;
      if (!img.hasAttribute('data-pl-prefetch') && !img.getClientRects().length) continue;
      pending.push({ img: img, order: i, key: 0 });
    }
  }

  function rank() {
    var vh = window.innerHeight || 800;
    for (var i = 0; i < pending.length; i++) {
      var p = pending[i];
      if (p.img.hasAttribute('data-pl-prefetch')) { p.key = 1e9; continue; }
      var r = p.img.getBoundingClientRect();
      if (r.bottom < 0) p.key = -r.bottom * 2 + 1;
      else if (r.top > vh) p.key = r.top - vh;
      else p.key = 0;
    }
    pending.sort(function (a, b) { return a.key - b.key || a.order - b.order; });
  }

  function release(batch, done) {
    var left = 0;
    var over = false;
    var timer;

    function finish() {
      if (over) return;
      over = true;
      clearTimeout(timer);
      done();
    }
    function one() {
      if (--left <= 0) finish();
    }

    for (var i = 0; i < batch.length; i++) {
      var img = batch[i].img;
      if (loaded(img)) continue;
      left++;
      img.addEventListener('load', one, { once: true });
      img.addEventListener('error', one, { once: true });
      img.setAttribute('data-pl-lz', '');
      img.loading = 'eager';
    }
    if (left <= 0) return finish();
    timer = setTimeout(finish, settleMs);
  }

  function next() {
    pending = pending.filter(function (p) {
      return p.img.loading === 'lazy' && !loaded(p.img);
    });
    stats.remaining = pending.length;
    if (!pending.length) {
      stats.done = true;
      return;
    }
    rank();
    var batch = pending.splice(0, size);
    var t0 = performance.now();
    release(batch, function () {
      stats.batches.push({ n: batch.length, ms: Math.round(performance.now() - t0) });
      stats.remaining = pending.length;
      setTimeout(function () { idle(next); }, gap);
    });
  }

  var started = false;
  function begin() {
    if (started) return;
    started = true;
    collect();
    next();
  }

  if (document.readyState === 'complete') {
    setTimeout(begin, 200);
  } else {
    window.addEventListener('load', function () { setTimeout(begin, 200); }, { once: true });
    setTimeout(begin, cfg.maxWait || 20000);
  }
})();
