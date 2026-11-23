/* Cardamom price + wholesale page: daily and monthly price graphs, pack ordering, booking dialog. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var GREEN = '#1F6B5C', UP = '#137A3A', INK = '#0B0B0F', GRID = '#E6E5E0';
  var nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  var nf2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function rupees(paise) { var v = Math.round(paise) / 100; return '₹' + (v % 1 ? nf2.format(v) : nf.format(v)); }
  function rupeesWhole(paise) { return '₹' + nf.format(Math.round(paise / 100)); }
  function root() { return (window.Shopify && Shopify.routes && Shopify.routes.root) || '/'; }
  function el(name, attrs, parent, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function niceStep(span, target) {
    var steps = [10, 20, 25, 50, 100, 200, 250, 500, 1000];
    var raw = span / target;
    for (var i = 0; i < steps.length; i++) if (steps[i] >= raw) return steps[i];
    return 1000;
  }
  function frame(box) {
    var old = box.querySelector('svg'); if (old) old.remove();
    var W = box.clientWidth, H = box.clientHeight;
    return W && H ? { W: W, H: H, svg: el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'aria-hidden': 'true', focusable: 'false' }) } : null;
  }

  /* Last 6 auction days: line with every value labelled; dot green when the average rose. */
  function drawDaily(box, recent) {
    var f = frame(box); if (!f) return;
    var pts = recent.slice(0, 6).reverse();
    var W = f.W, H = f.H, svg = f.svg, narrow = W < 420;
    var m = { t: 30, r: narrow ? 26 : 34, b: 34, l: narrow ? 26 : 34 };
    var vals = pts.map(function (p) { return p.v; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var step = niceStep(Math.max(hi - lo, 40), 3);
    var y0 = Math.floor((lo - step * 0.6) / step) * step, y1 = Math.ceil((hi + step * 0.6) / step) * step;
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var X = function (i) { return m.l + (pts.length === 1 ? iw / 2 : i * iw / (pts.length - 1)); };
    var Y = function (v) { return m.t + (1 - (v - y0) / (y1 - y0)) * ih; };
    for (var g = y0; g <= y1 + 0.1; g += step) {
      el('line', { x1: 0, x2: W, y1: Y(g), y2: Y(g), stroke: GRID, 'stroke-width': 1, 'shape-rendering': 'crispEdges' }, svg);
    }
    el('text', { x: 0, y: m.t - 14, class: 'ax' }, svg, '₹/kg, gridlines every ₹' + nf.format(step));
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join(' ');
    el('path', { d: d, fill: 'none', stroke: GREEN, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    pts.forEach(function (p, i) {
      var up = p.dir === 'up';
      var c = el('circle', { cx: X(i), cy: Y(p.v), r: 6, fill: up ? UP : INK, stroke: '#fff', 'stroke-width': 2 }, svg);
      el('title', {}, c, p.long + ': ₹' + p.avg + ' per kg' + (up ? ', up ₹' + p.chg : p.dir === 'down' ? ', down ₹' + p.chg : ''));
      el('text', { x: X(i), y: Y(p.v) - 12, 'text-anchor': 'middle', class: 'val' + (up ? ' up' : '') }, svg, '₹' + p.avg);
      el('text', { x: X(i), y: H - 16, 'text-anchor': 'middle', class: 'ax' }, svg, p.day);
      el('text', { x: X(i), y: H - 3, 'text-anchor': 'middle', class: 'ax' }, svg, p.short);
    });
    box.appendChild(svg);
  }

  /* Last 6 months: columns from zero, value on each cap; the running month is lighter. */
  function drawMonthly(box, rows) {
    var f = frame(box); if (!f) return;
    var W = f.W, H = f.H, svg = f.svg;
    var m = { t: 24, r: 4, b: 22, l: 4 };
    var vals = rows.map(function (r) { return r[9]; });
    var hi = Math.max.apply(null, vals);
    var step = niceStep(hi, 3), y1 = Math.ceil(hi * 1.12 / step) * step;
    var iw = W - m.l - m.r, ih = H - m.t - m.b, slot = iw / rows.length;
    var bw = Math.min(30, slot * 0.56);
    var Y = function (v) { return m.t + (1 - v / y1) * ih; };
    el('line', { x1: 0, x2: W, y1: Y(0), y2: Y(0), stroke: '#C9C8C2', 'stroke-width': 1 }, svg);
    rows.forEach(function (r, i) {
      var cx = m.l + slot * (i + 0.5), x = cx - bw / 2, y = Y(r[9]), h = Y(0) - y, rad = Math.min(4, h);
      var last = i === rows.length - 1;
      var path = 'M' + x + ' ' + Y(0) + ' V' + (y + rad) + ' Q' + x + ' ' + y + ' ' + (x + rad) + ' ' + y +
        ' H' + (x + bw - rad) + ' Q' + (x + bw) + ' ' + y + ' ' + (x + bw) + ' ' + (y + rad) + ' V' + Y(0) + ' Z';
      var bar = el('path', { d: path, fill: GREEN, 'fill-opacity': last ? 0.45 : 1 }, svg);
      el('title', {}, bar, r[1] + ': average ₹' + r[2] + ' per kg' + (last ? ' (month so far)' : ''));
      el('text', { x: cx, y: y - 6, 'text-anchor': 'middle', class: 'val' }, svg, '₹' + r[2]);
      el('text', { x: cx, y: H - 5, 'text-anchor': 'middle', class: 'ax' }, svg, r[1].split(' ')[0]);
    });
    box.appendChild(svg);
  }

  function initGraphs(scope) {
    var raw = scope.querySelector('[data-plcm-data]');
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw.textContent); } catch (e) { return; }
    var daily = scope.querySelector('[data-plcm-daily]'), monthly = scope.querySelector('[data-plcm-monthly]');
    function draw() {
      if (daily && data.recent && data.recent.length) drawDaily(daily, data.recent);
      if (monthly && data.m && data.m.length) drawMonthly(monthly, data.m);
    }
    draw();
    var w = scope.clientWidth;
    if ('ResizeObserver' in window) new ResizeObserver(function () { if (scope.clientWidth !== w) { w = scope.clientWidth; draw(); } }).observe(scope);
  }

  /* ---------------- grades and packs ---------------- */
  function initGrades(scope) {
    var cfg = {
      onlineMax: +scope.dataset.onlineMax || 5, codMax: +scope.dataset.codMax || 10, postMax: +scope.dataset.postMax || 19,
      gst: +scope.dataset.gst || 5, wa: scope.dataset.wa, advId: scope.dataset.advId,
      advPrice: +scope.dataset.advPrice || 50000, rateDate: scope.dataset.rateDate
    };
    var gstin = scope.querySelector('[data-plcm-gstin]');
    var dialog = scope.querySelector('[data-plcm-dialog]');
    var pending = null;

    function gstinVal() {
      var v = gstin ? gstin.value.trim().toUpperCase() : '';
      return /^[0-9]{2}[A-Z0-9]{13}$/.test(v) ? v : '';
    }

    scope.querySelectorAll('.plcm-grade').forEach(function (card) {
      var input = card.querySelector('.plcm-qty__input');
      var unit = card.querySelector('.plcm-qty__unit');
      var total = card.querySelector('.plcm-grade__total');
      var mode = card.querySelector('.plcm-grade__mode');
      var cta = card.querySelector('.plcm-grade__cta');
      var book = card.querySelector('.plcm-grade__book');
      var msg = card.querySelector('.plcm-grade__msg');
      var waLink = card.querySelector('[data-plcm-wa]');
      var fine = card.querySelector('[data-plcm-fine]');
      var phone = fine ? fine.dataset.phone : '';
      var grade = card.dataset.grade, ex = +card.dataset.ex;

      function pack() {
        var r = card.querySelector('.plcm-pack input:checked') || card.querySelector('.plcm-pack input');
        return { id: +r.value, kg: +r.dataset.kg, price: +r.dataset.price };
      }
      function count() { var v = parseInt(input.value, 10); return isNaN(v) || v < 1 ? 1 : Math.min(v, 99); }
      function state() { var p = pack(), n = count(); return { p: p, n: n, kg: p.kg * n, price: p.price * n }; }
      function update() {
        var s = state();
        msg.textContent = ''; msg.classList.remove('is-error');
        unit.textContent = s.n === 1 ? 'pack' : 'packs';
        total.textContent = s.n + ' × ' + s.p.kg + ' kg = ' + s.kg + ' kg · ' + rupees(s.price) + ' with GST';
        if (s.kg > cfg.postMax) {
          mode.textContent = 'Above ' + cfg.postMax + ' kg we send by parcel service, so we confirm delivery first. Book with ' +
            rupeesWhole(cfg.advPrice) + ' and pay the rest after our call.';
          cta.textContent = 'Book for ' + rupeesWhole(cfg.advPrice);
          cta.setAttribute('data-mode', 'book');
          book.hidden = true;
        } else {
          mode.textContent = 'Pay online. India Post delivery is added at checkout.';
          cta.textContent = 'Add to cart';
          cta.setAttribute('data-mode', 'buy');
          book.hidden = s.kg <= cfg.onlineMax;
        }
        var big = s.kg > cfg.onlineMax, adv = rupeesWhole(cfg.advPrice);
        if (fine) fine.textContent = big
          ? 'Book with ' + adv + ' and we call or WhatsApp you from ' + phone + ' to accept the order. Cancel within 1 day and we refund the ' + adv + '.'
          : 'Call or WhatsApp ' + phone + ' to order or ask.';
        if (waLink && cfg.wa) waLink.href = 'https://wa.me/' + cfg.wa + '?text=' + encodeURIComponent(
          'Hi Pure Leven, I would like to order ' + grade + ' cardamom: ' + s.n + ' × ' + s.p.kg + ' kg = ' + s.kg + ' kg, ' +
          rupees(s.price) + ' with GST (' + rupees(ex) + '/kg + ' + cfg.gst + '% GST, ' + cfg.rateDate + '). Please confirm.');
      }
      card.querySelectorAll('.plcm-pack input').forEach(function (r) { r.addEventListener('change', update); });
      card.querySelectorAll('.plcm-qty__btn').forEach(function (b) {
        b.addEventListener('click', function () { input.value = Math.max(1, Math.min(99, count() + (+b.dataset.step))); update(); });
      });
      input.addEventListener('input', update);
      input.addEventListener('blur', function () { input.value = count(); update(); });

      book.addEventListener('click', function () { openBooking({ grade: grade, ex: ex, s: state(), card: card }); });
      cta.addEventListener('click', function () {
        var s = state();
        if (cta.getAttribute('data-mode') === 'book') { openBooking({ grade: grade, ex: ex, s: s, card: card }); return; }
        var props = { 'Rate': rupees(ex) + ' per kg + ' + cfg.gst + '% GST', 'Rate date': cfg.rateDate };
        var g = gstinVal(); if (g) props['GSTIN'] = g;
        cta.disabled = true; cta.textContent = 'Adding…';
        fetch(root() + 'cart/add.js', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: [{ id: s.p.id, quantity: s.n, properties: props }] })
        }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not add'); return j; }); })
          .then(function () { window.location.href = root() + 'cart'; })
          .catch(function (err) {
            cta.disabled = false; update();
            msg.classList.add('is-error');
            msg.textContent = err.message + '. Please try again or WhatsApp us.';
          });
      });
      update();
    });

    if (!dialog) return;
    var form = dialog.querySelector('form');
    var sum = dialog.querySelector('[data-plcm-sum]');
    var err = dialog.querySelector('[data-plcm-err]');
    var codLabel = dialog.querySelector('[data-plcm-cod]');
    var codInput = codLabel && codLabel.querySelector('input');
    var submit = dialog.querySelector('[data-plcm-submit]');

    function openBooking(o) {
      pending = o;
      sum.textContent = o.grade + ' · ' + o.s.n + ' × ' + o.s.p.kg + ' kg = ' + o.s.kg + ' kg · ' + rupees(o.ex) + '/kg + ' + cfg.gst + '% GST ≈ ' + rupees(o.s.price);
      err.textContent = '';
      var codOk = o.s.kg <= cfg.codMax;
      if (codInput) {
        codInput.disabled = !codOk;
        codLabel.setAttribute('aria-disabled', codOk ? 'false' : 'true');
        if (!codOk && codInput.checked) form.querySelector('input[name="pay"]').checked = true;
      }
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      var first = form.elements.namedItem('name'); if (first) first.focus();
    }
    function close() {
      if (dialog.open) { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
      if (pending && pending.card) pending.card.querySelector('.plcm-grade__cta').focus();
    }
    dialog.querySelectorAll('[data-plcm-close]').forEach(function (b) { b.addEventListener('click', close); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!pending) return;
      var fName = form.elements.namedItem('name'), fPhone = form.elements.namedItem('phone'), fPin = form.elements.namedItem('pin');
      var name = fName.value.trim();
      var phone = fPhone.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      var pin = fPin.value.replace(/\D/g, '');
      var pay = (form.querySelector('input[name="pay"]:checked') || {}).value || '';
      if (name.length < 2) { err.textContent = 'Please add your name.'; fName.focus(); return; }
      if (!/^[6-9]\d{9}$/.test(phone)) { err.textContent = 'Please add a 10-digit Indian mobile number.'; fPhone.focus(); return; }
      if (!/^[1-9]\d{5}$/.test(pin)) { err.textContent = 'Please add a 6-digit pincode.'; fPin.focus(); return; }
      if (!cfg.advId) { err.textContent = 'Booking is not switched on yet. Please WhatsApp us.'; return; }
      var s = pending.s;
      var props = {
        'Grade': pending.grade, 'Packs': s.n + ' × ' + s.p.kg + ' kg', 'Quantity': s.kg + ' kg',
        'Rate at booking': rupees(pending.ex) + ' per kg + ' + cfg.gst + '% GST (' + cfg.rateDate + ')',
        'Estimated total': rupees(s.price) + ' with GST',
        'Balance payment': pay, 'Name': name, 'Mobile': phone, 'Pincode': pin
      };
      var g = gstinVal(); if (g) props['GSTIN'] = g;
      err.textContent = ''; submit.disabled = true; submit.textContent = 'Opening checkout…';
      fetch(root() + 'cart/add.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: [{ id: +cfg.advId, quantity: 1, properties: props }] })
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not book'); return j; }); })
        .then(function () { window.location.href = root() + 'checkout'; })
        .catch(function (x) {
          submit.disabled = false; submit.textContent = 'Pay ' + rupeesWhole(cfg.advPrice) + ' to book';
          err.textContent = x.message + '. Please try again or WhatsApp us.';
        });
    });
  }

  function init() {
    document.querySelectorAll('.plcm').forEach(function (scope) {
      if (scope.dataset.ready) return;
      scope.dataset.ready = '1';
      initGraphs(scope);
      initGrades(scope);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load', init);
})();
