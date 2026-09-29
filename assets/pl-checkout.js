/* ============================================================
   pl-checkout.js — PureLeven checkout

   One page: mobile, name, pincode, address, then pick how to pay.

   The browser collects who and where and shows the price. It never decides
   money. The amount, the shipping and the coupon are recomputed by the server
   from the cart before an order exists, and the Razorpay key SECRET never
   appears in a theme file.

   Contract with the order endpoint (Theme settings > Create-order endpoint):

     POST  { phone, address: { name, line1, line2, city, state, pincode, email },
             coupon, method: 'upi' | 'card' | 'cod',
             items: [{ variant_id, quantity }], cart_token, attributes, note,
             client_amount }                      <- reference only, never trusted
     ->    cash on delivery : { order_number }
           prepaid          : { razorpay_order_id, amount, order_number }

   Optional verify endpoint, called after Razorpay confirms a payment:
     POST  { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_number }

   Until an endpoint is set, Pay and Place order explain that plainly and
   charge nothing. The one exception is a TEST key (rzp_test_...): with no
   endpoint it opens Razorpay's test window straight from the browser so the
   button can be tried. That path creates no order, and a live key never uses it.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.PL_CHECKOUT;
  var root = document.querySelector('.plck');
  var payBtn = document.getElementById('plck-pay');
  var payInline = document.getElementById('plck-pay-inline');
  if (!CFG || !root || !payBtn || !payInline) return;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // Two decimals everywhere: a checkout that rounds is a checkout the shopper
  // has to re-check against their bank statement.
  function money(paise) {
    return '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(paise / 100);
  }

  var el = {
    phone: $('#plck-phone'), name: $('#plck-name'), pin: $('#plck-pin'), addr: $('#plck-addr'),
    lm: $('#plck-lm'), email: $('#plck-email'), city: $('#plck-city'), state: $('#plck-state'),
  };
  var state = { method: 'upi', coupon: null, place: null, busy: false, lookup: null };
  var KEY = 'pl_checkout_v1';

  /* ---------- this browser only ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        phone: normPhone(el.phone.value), name: el.name.value.trim(), pin: digits(el.pin.value).slice(0, 6),
        addr: el.addr.value.trim(), lm: el.lm.value.trim(), email: el.email.value.trim(),
      }));
    } catch (e) {}
  }

  /* ---------- fields ---------- */
  function digits(v) { return String(v || '').replace(/\D/g, ''); }

  // People type their number every way there is: +91, 0091, a leading 0,
  // spaces, dashes. Strip it to the ten digits rather than say they got it wrong.
  function normPhone(v) {
    var d = digits(v);
    if (d.indexOf('0091') === 0) d = d.slice(4);
    while (d.charAt(0) === '0') d = d.slice(1);
    if (d.length > 10 && d.indexOf('91') === 0) d = d.slice(2);
    return d.slice(0, 10);
  }
  function validPhone(v) { return /^[6-9]\d{9}$/.test(v); }

  function setErr(name, msg) {
    var p = $('#plck-' + name + '-err');
    var box = $('#plck-' + name + '-box');
    if (p) p.textContent = msg || '';
    if (box) box.classList.toggle('is-err', !!msg);
  }

  function onPhone() {
    var raw = normPhone(el.phone.value);
    if (el.phone.value !== raw) el.phone.value = raw;
    $('#plck-phone-ok').hidden = !validPhone(raw);
    setErr('phone', raw.length === 10 && !validPhone(raw) ? 'Enter a valid Indian mobile number' : '');
    save();
  }

  /* ---------- pincode -> city and state (India Post) ----------
     If the lookup is slow, down or does not know the pincode, the shopper is
     not stopped: city and state open up as two plain fields. */
  function showPlace(text) {
    var s = $('#plck-place');
    if (!text) { s.hidden = true; s.innerHTML = ''; return; }
    s.hidden = false;
    s.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>' + esc(text);
  }
  function openManual(hint) {
    $('#plck-manual').hidden = false;
    setErr('pin', '');
    var p = $('#plck-pin-err');
    if (p) p.textContent = hint || '';
  }

  function lookup(pin) {
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
    var mine = fetch('https://api.postalpincode.in/pincode/' + pin, ctl ? { signal: ctl.signal } : undefined)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        clearTimeout(timer);
        if (digits(el.pin.value) !== pin) return;
        var ok = d && d[0] && d[0].Status === 'Success' && d[0].PostOffice && d[0].PostOffice.length;
        if (!ok) { openManual('We could not find that pincode. Check it, or enter your city and state below.'); return; }
        var po = d[0].PostOffice[0];
        state.place = { city: po.District || po.Block || po.Name, state: po.State };
        showPlace(state.place.city + ', ' + state.place.state);
      })
      .catch(function () {
        clearTimeout(timer);
        if (digits(el.pin.value) !== pin) return;
        openManual('Could not fill in your city and state. Please add them below.');
      })
      .then(function () { if (state.lookup === mine) state.lookup = null; });
    state.lookup = mine;
  }

  function onPin() {
    var v = digits(el.pin.value).slice(0, 6);
    if (el.pin.value !== v) el.pin.value = v;
    state.place = null;
    showPlace(null);
    $('#plck-manual').hidden = true;
    setErr('pin', '');
    if (v.length === 6) lookup(v);
    save();
  }

  function place() {
    if (state.place) return state.place;
    var c = el.city.value.trim();
    var s = el.state.value.trim();
    return c && s ? { city: c, state: s } : null;
  }

  /* ---------- prices ---------- */
  function computed() {
    var coupon = state.coupon ? state.coupon.value : 0;
    var order = Math.max(0, CFG.subtotal + CFG.shipping - coupon);
    var off = Math.round((order * (CFG.prepaidPct || 0)) / 100);
    return { coupon: coupon, order: order, off: off, prepaid: order - off, cod: order + (CFG.codFee || 0) };
  }
  function row(label, val, cls) {
    return '<div class="plck-r' + (cls ? ' ' + cls : '') + '"><span>' + label + '</span><span>' + val + '</span></div>';
  }

  function render() {
    var c = computed();
    var n = CFG.itemCount;
    var pdisc = CFG.mrp - CFG.subtotal;

    $('#plck-sum-total').textContent = money(c.order);

    var rows = row('MRP (' + n + ' item' + (n === 1 ? '' : 's') + ')', money(CFG.mrp));
    if (pdisc > 0) rows += row('Product discount', '&minus;' + money(pdisc), 'plck-r--off');
    if (state.coupon) {
      rows += row('Coupon ' + esc(state.coupon.code) + '<button type="button" class="plck-link" data-plck-rmcpn>Remove</button>',
        '&minus;' + money(c.coupon), 'plck-r--off');
    }
    rows += row('Shipping', CFG.shipping ? money(CFG.shipping) : 'FREE', CFG.shipping ? '' : 'plck-r--free');
    rows += '<div class="plck-r plck-r--t"><span>Order total</span><span>' + money(c.order) + '</span></div>';
    $('#plck-totals').innerHTML = rows;

    $$('.plck-opt').forEach(function (opt) {
      var m = opt.getAttribute('data-method');
      opt.classList.toggle('is-on', m === state.method);
      var price = $('[data-plck-price]', opt);
      if (price) price.textContent = money(m === 'cod' ? c.cod : c.prepaid);
      var save = $('[data-plck-save]', opt);
      if (save) save.textContent = c.off > 0 ? 'Save ' + money(c.off) + ' when you pay online' : '';
      var cod = $('[data-plck-cod]', opt);
      if (cod) cod.textContent = (CFG.codFee > 0 ? money(CFG.codFee).replace('.00', '') + ' handling fee · ' : '') + 'pay when it arrives';
    });

    var isCod = state.method === 'cod';
    $('#plck-amt').textContent = money(isCod ? c.cod : c.prepaid);
    if (!state.busy) {
      $('#plck-pay-label').textContent = isCod ? 'Place order' : 'Pay with Razorpay';
      $('#plck-pay-inline-label').textContent = isCod ? 'Place order \u00B7 ' + money(c.cod) : 'Pay ' + money(c.prepaid) + ' with Razorpay';
    }
    $('#plck-pay-lock').style.display = isCod ? 'none' : '';
    $('#plck-pay-inline-lock').style.display = isCod ? 'none' : '';

    $$('[data-plck-p]').forEach(function (node) {
      node.textContent = money(Number(node.getAttribute('data-plck-p')));
    });
  }

  /* ---------- delivery date: same rule as the cart ---------- */
  function etaDate() {
    var now = new Date();
    var ist = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 3600000);
    var base = Number(CFG.etaDays);
    if (isNaN(base)) base = 3;
    return new Date(now.getTime() + (base + (ist.getHours() >= 14 ? 1 : 0)) * 86400000);
  }
  function setEta() {
    var d = etaDate();
    var label;
    try { label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { label = d.toDateString(); }
    $$('[data-plck-eta]').forEach(function (n) { n.textContent = label; });
  }

  /* ---------- coupon ---------- */
  function couponErr(msg) { var p = $('#plck-cpn-err'); if (p) p.textContent = msg || ''; }
  function applyCoupon(e) {
    e.preventDefault();
    var code = $('#plck-cpn-in').value.trim().toUpperCase();
    if (!code) return;
    var hit = null;
    (CFG.coupons || []).forEach(function (c) { if (String(c.code).toUpperCase() === code) hit = c; });
    if (!hit) return couponErr('That code is not valid.');
    if (CFG.subtotal < hit.min) return couponErr('Add ' + money(hit.min - CFG.subtotal) + ' more to use ' + hit.code + '.');
    state.coupon = { code: hit.code, value: hit.value };
    couponErr('');
    $('#plck-cpn-in').value = '';
    $('#plck-cpn-form').hidden = true;
    $('#plck-cpn-open').hidden = true;
    render();
  }

  /* ---------- Razorpay: fetched once the shopper has had time to settle ---------- */
  var rzpLoad = null;
  function loadRzp() {
    if (window.Razorpay) return Promise.resolve();
    if (rzpLoad) return rzpLoad;
    rzpLoad = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { rzpLoad = null; reject(new Error('The payment window could not load. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
    return rzpLoad;
  }
  function idle(fn) {
    if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 4000 });
    else setTimeout(fn, 2000);
  }

  /* ---------- placing the order ---------- */
  function showNote(html) { var n = $('#plck-note'); n.innerHTML = html; n.hidden = false; n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  function hideNote() { $('#plck-note').hidden = true; }
  function setBusy(b) {
    state.busy = b;
    [payBtn, payInline].forEach(function (btn) {
      btn.disabled = b;
      btn.setAttribute('aria-busy', b ? 'true' : 'false');
    });
    if (b) {
      $('#plck-pay-label').textContent = 'Please wait\u2026';
      $('#plck-pay-inline-label').textContent = 'Please wait\u2026';
    } else render();
  }

  function validate() {
    var errs = [];
    if (!validPhone(normPhone(el.phone.value))) errs.push(['phone', el.phone, 'Enter a 10-digit mobile number']);
    if (el.name.value.trim().length < 2) errs.push(['name', el.name, 'Enter your full name']);
    var pin = digits(el.pin.value);
    if (pin.length !== 6) errs.push(['pin', el.pin, 'Enter a 6-digit pincode']);
    else if (!place()) errs.push(['pin', $('#plck-manual').hidden ? el.pin : el.city, 'Enter your city and state']);
    if (el.addr.value.trim().length < 4) errs.push(['addr', el.addr, 'Enter your house or street']);
    ['phone', 'name', 'pin', 'addr'].forEach(function (k) { setErr(k, ''); });
    errs.forEach(function (e) { setErr(e[0], e[2]); });
    return errs;
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || d.error) throw new Error(d.error || 'Something went wrong. Please try again.');
        return d;
      });
    });
  }
  function freshCart() {
    return fetch('/cart.js', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  function finish(d, amount) {
    var ref = d.order_number || d.order_ref || '';
    try {
      sessionStorage.setItem('basil_last_order_id', ref);
      sessionStorage.setItem('basil_last_order_total', money(amount));
      var e = etaDate();
      sessionStorage.setItem('basil_estimated_delivery_date', e.getFullYear() + '-' + pad(e.getMonth() + 1) + '-' + pad(e.getDate()));
      if (el.email.value.trim()) localStorage.setItem('customer_email', el.email.value.trim());
    } catch (err) {}
    var url = CFG.successUrl || '/';
    if (ref) url += (url.indexOf('?') > -1 ? '&' : '?') + 'order=' + encodeURIComponent(ref);
    // The order now lives on the server; empty the cart so it is not bought twice.
    return fetch('/cart/clear.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' })
      .catch(function () {})
      .then(function () { window.location.href = url; });
  }

  function openRzp(d, payload, amount) {
    var rzp = new window.Razorpay({
      key: CFG.rzpKey,
      order_id: d.razorpay_order_id,
      amount: d.amount,
      currency: 'INR',
      name: 'PureLeven',
      description: d.order_number ? 'Order ' + d.order_number : 'Order payment',
      prefill: { contact: '91' + payload.phone, name: payload.address.name, email: payload.address.email, method: state.method === 'card' ? 'card' : 'upi' },
      theme: { color: '#19453C' },
      modal: { ondismiss: function () { setBusy(false); } },
      handler: function (resp) {
        // The shopper has paid. If verification hiccups, the Razorpay webhook is
        // the source of truth, so never strand them on an error screen.
        var go = function () { finish(d, amount); };
        if (!CFG.verifyUrl) return go();
        post(CFG.verifyUrl, {
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_signature: resp.razorpay_signature,
          order_number: d.order_number,
        }).then(go, go);
      },
    });
    if (rzp.on) {
      rzp.on('payment.failed', function (r) {
        setBusy(false);
        showNote(esc((r && r.error && r.error.description) || 'The payment did not go through. Please try again or pick another way to pay.'));
      });
    }
    rzp.open();
  }

  /* A rzp_test_ key with no endpoint: open Razorpay's test window from the
     browser so the button can be tried end to end. No order is created and no
     real money can move; a live key never takes this path. */
  function isTestKey() { return /^rzp_test_/.test(CFG.rzpKey || ''); }
  function openTest(payload, amount) {
    loadRzp().then(function () {
      var rzp = new window.Razorpay({
        key: CFG.rzpKey,
        amount: amount,
        currency: 'INR',
        name: 'PureLeven',
        description: 'Test payment. No order is created.',
        prefill: { contact: '91' + payload.phone, name: payload.address.name, email: payload.address.email, method: state.method === 'card' ? 'card' : 'upi' },
        theme: { color: '#19453C' },
        modal: { ondismiss: function () { setBusy(false); } },
        handler: function (resp) {
          setBusy(false);
          showNote('<b>Test payment went through.</b> Razorpay payment id ' + esc(resp.razorpay_payment_id) + '. No order was created and nothing real was charged.');
        },
      });
      if (rzp.on) {
        rzp.on('payment.failed', function (r) {
          setBusy(false);
          showNote(esc((r && r.error && r.error.description) || 'The test payment did not go through.'));
        });
      }
      rzp.open();
    }).catch(function (e) {
      setBusy(false);
      showNote(esc(e && e.message ? e.message : 'The payment window could not open.'));
    });
  }

  function submit() {
    if (state.busy) return;
    if (state.lookup) { state.lookup.then(submit); return; }
    hideNote();

    var errs = validate();
    if (errs.length) {
      var t = errs[0][1];
      t.scrollIntoView({ block: 'center', behavior: 'smooth' });
      t.focus({ preventScroll: true });
      return;
    }
    save();

    var c = computed();
    var isCod = state.method === 'cod';
    var pl = place();
    var payload = {
      phone: normPhone(el.phone.value),
      address: {
        name: el.name.value.trim(), line1: el.addr.value.trim(), line2: el.lm.value.trim(),
        city: pl.city, state: pl.state, pincode: digits(el.pin.value), email: el.email.value.trim(),
      },
      coupon: state.coupon ? state.coupon.code : null,
      method: state.method,
      client_amount: isCod ? c.cod : c.prepaid,
    };

    if (!CFG.orderUrl) {
      if (isTestKey() && !isCod) { setBusy(true); openTest(payload, c.prepaid); return; }
      showNote('<b>Ordering is not switched on in this preview yet.</b> Nothing was charged. Your details are kept in this browser. Set the create-order endpoint in Theme settings to connect it.');
      if (window.console) console.log('[pl-checkout] ready for the order endpoint:', payload);
      return;
    }

    setBusy(true);
    freshCart()
      .then(function (cart) {
        payload.items = cart && cart.items ? cart.items.map(function (i) { return { variant_id: i.variant_id, quantity: i.quantity }; }) : [];
        payload.cart_token = (cart && cart.token) || CFG.cartToken;
        payload.attributes = (cart && cart.attributes) || {};
        payload.note = (cart && cart.note) || '';
        return post(CFG.orderUrl, payload);
      })
      .then(function (d) {
        if (isCod) return finish(d, c.cod);
        if (!d.razorpay_order_id) throw new Error('The payment could not be started. Please try again.');
        return loadRzp().then(function () { openRzp(d, payload, c.prepaid); });
      })
      .catch(function (e) {
        setBusy(false);
        showNote(esc(e && e.message ? e.message : 'Something went wrong. Please try again.'));
      });
  }

  /* ---------- boot ---------- */
  function init() {
    var saved = load();
    if (saved.phone) el.phone.value = saved.phone;
    if (saved.name) el.name.value = saved.name;
    if (saved.pin) el.pin.value = saved.pin;
    if (saved.addr) el.addr.value = saved.addr;
    if (saved.lm) { el.lm.value = saved.lm; $('#plck-lm-f').hidden = false; $('#plck-lm-open').hidden = true; }
    if (saved.email) { el.email.value = saved.email; $('#plck-email-f').hidden = false; $('#plck-email-open').hidden = true; }

    el.phone.addEventListener('input', onPhone);
    el.pin.addEventListener('input', onPin);
    [el.name, el.addr].forEach(function (i) {
      i.addEventListener('input', function () { setErr(i === el.name ? 'name' : 'addr', ''); save(); });
    });
    [el.lm, el.email].forEach(function (i) { i.addEventListener('input', save); });

    $('#plck-lm-open').addEventListener('click', function () { $('#plck-lm-f').hidden = false; this.hidden = true; el.lm.focus(); });
    $('#plck-email-open').addEventListener('click', function () { $('#plck-email-f').hidden = false; this.hidden = true; el.email.focus(); });

    $$('input[name="plck-method"]').forEach(function (r) {
      r.addEventListener('change', function () { state.method = r.value; render(); });
    });

    var cpnOpen = $('#plck-cpn-open');
    if (cpnOpen) {
      cpnOpen.addEventListener('click', function () {
        var f = $('#plck-cpn-form');
        f.hidden = !f.hidden;
        cpnOpen.setAttribute('aria-expanded', f.hidden ? 'false' : 'true');
        if (!f.hidden) $('#plck-cpn-in').focus();
      });
      $('#plck-cpn-form').addEventListener('submit', applyCoupon);
    }
    $('#plck-totals').addEventListener('click', function (e) {
      if (!e.target.closest('[data-plck-rmcpn]')) return;
      state.coupon = null;
      var open = $('#plck-cpn-open');
      if (open) open.hidden = false;
      render();
    });

    payBtn.addEventListener('click', submit);
    payInline.addEventListener('click', submit);

    // The bar at the bottom of the screen steps aside while the button in the
    // Payment section is on screen, so the page never shows two pay buttons.
    var dock = $('.plck-dock');
    if ('IntersectionObserver' in window && dock) {
      new IntersectionObserver(function (entries) {
        dock.classList.toggle('is-off', entries[0].isIntersecting);
      }, { threshold: 0.6 }).observe(payInline);
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) setBusy(false); });

    onPhone();
    if (digits(el.pin.value).length === 6) onPin();
    render();
    setEta();
    if (CFG.rzpKey && (CFG.orderUrl || isTestKey())) idle(function () { loadRzp().catch(function () {}); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
