(function () {
  if (window.__tcxInit) return;
  window.__tcxInit = true;

  var hero = document.querySelector('[data-tcx-hero]');

  function inr(paise) { return '₹' + Math.round(paise / 100).toLocaleString('en-IN'); }
  function readJSON(el) { try { return JSON.parse(el.textContent); } catch (_) { return null; } }

  if (hero) {
    var FREE_TOTAL = parseInt(hero.dataset.freeTotal, 10) || 64900;
    var FREE_ITEMS = parseInt(hero.dataset.freeItems, 10) || 2;
    var form = hero.querySelector('[data-tcx-form]');
    var variants = readJSON(hero.querySelector('[data-tcx-variants]')) || [];
    var qtyInput = hero.querySelector('[data-tcx-qty-input]');
    var atc = hero.querySelector('[data-tcx-atc]');
    var stock = hero.querySelector('[data-tcx-stock]');
    var stockText = hero.querySelector('[data-tcx-stock-text]');
    var nudge = hero.querySelector('[data-tcx-nudge]');
    var sticky = hero.querySelector('[data-tcx-sticky]');
    var stickyTitle = hero.querySelector('[data-tcx-sticky-title]');
    var stickySel = hero.querySelector('[data-tcx-sticky-sel]');
    var stickyBar = hero.querySelector('[data-tcx-sticky-bar]');
    var stickyAdd = hero.querySelector('[data-tcx-sticky-add]');
    var stickyCart = hero.querySelector('[data-tcx-sticky-cart]');
    var unit = hero.querySelector('[data-tcx-unit]');
    var ship = hero.querySelector('[data-tcx-ship]');
    var CUPS = parseInt(hero.dataset.cups, 10) || 0;
    var baseTitle = stickyTitle ? stickyTitle.textContent : '';
    var cartCount = parseInt(hero.dataset.cartCount, 10) || 0;
    var cartTotal = parseInt(hero.dataset.cartTotal, 10) || 0;
    var rowOut = false;
    var mobile = function () { return window.innerWidth < 990; };

    var current = function () {
      var input = form && (form.querySelector('input[name="id"]:checked') || form.querySelector('input[name="id"][type="hidden"]'));
      return input && variants.find(function (v) { return String(v.id) === input.value; });
    };
    var qty = function () { return Math.min(20, Math.max(1, parseInt(qtyInput && qtyInput.value, 10) || 1)); };
    var isFree = function (count, total) { return count >= FREE_ITEMS || total >= FREE_TOTAL; };

    /* sticky bar: product + Add until something is in the cart, then the free-delivery goal */
    var renderSticky = function () {
      if (!sticky) return;
      var v = current();
      var free = isFree(cartCount, cartTotal);
      var started = cartCount > 0;
      sticky.classList.toggle('is-free', started && free);
      if (stickyBar) {
        stickyBar.hidden = !started;
        var pct = free ? 100 : Math.max(Math.min(cartCount / FREE_ITEMS, 1), Math.min(cartTotal / FREE_TOTAL, 1)) * 100;
        stickyBar.firstElementChild.style.width = pct + '%';
      }
      if (!started) {
        stickyTitle.textContent = baseTitle;
        if (v) stickySel.textContent = (qty() > 1 ? qty() + ' × ' : '') + v.title + ' · ' + inr(v.price * qty());
        if (stickyAdd) { stickyAdd.hidden = false; stickyAdd.textContent = 'Add to cart'; }
        if (stickyCart) stickyCart.hidden = true;
      } else if (!free) {
        var more = FREE_ITEMS - cartCount;
        stickyTitle.textContent = more + ' more ' + (more === 1 ? 'pack' : 'packs') + ' = free delivery';
        if (v) stickySel.textContent = '+ ' + baseTitle + ' ' + v.title + ' · ' + inr(v.price);
        if (stickyAdd) { stickyAdd.hidden = false; stickyAdd.textContent = '+ Add'; }
        if (stickyCart) stickyCart.hidden = true;
      } else {
        stickyTitle.textContent = 'Free delivery unlocked ✓';
        stickySel.textContent = cartCount + ' items · ' + inr(cartTotal);
        if (stickyAdd) stickyAdd.hidden = true;
        if (stickyCart) stickyCart.hidden = false;
      }
      var on = rowOut || (started && !free);
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      [stickyAdd, stickyCart].forEach(function (el) { if (el) el.tabIndex = on ? 0 : -1; });
      document.body.classList.toggle('tcx-has-sticky', on);
      document.documentElement.style.setProperty('--tcx-sticky-h', on && mobile() ? sticky.offsetHeight + 'px' : '0px');
    };

    var render = function () {
      var v = current();
      if (!v) return;
      var q = qty();
      if (atc && atc.getAttribute('aria-busy') !== 'true') {
        atc.disabled = !v.available;
        atc.innerHTML = v.available ? 'Add to cart · <span data-tcx-total>' + inr(v.price * q) + '</span>' : 'Sold out';
      }
      if (stickyAdd) stickyAdd.disabled = !v.available;
      if (stock) {
        stock.hidden = !(v.low > 0);
        if (v.low > 0) stockText.textContent = 'Only ' + v.low + ' packs of ' + v.title + ' left';
      }
      var grams = parseInt(String(v.title).replace(/[^0-9]/g, ''), 10) || 0;
      if (unit && grams) unit.textContent = inr(v.price * 100 / grams) + ' per 100 g' + (CUPS ? ' · about ' + Math.floor(grams * CUPS / 100) + ' cups' : '');
      var free = isFree(cartCount + q, cartTotal + v.price * q);
      if (ship) ship.classList.toggle('is-free', free);
      if (nudge) {
        nudge.classList.toggle('is-free', free);
        nudge.hidden = !free && cartCount === 0;
        nudge.textContent = free
          ? (cartCount > 0 ? 'Free delivery on this order' : 'Free delivery with ' + q + ' packs')
          : 'Add this and your delivery is free.';
      }
      renderSticky();
    };

    if (form) {
      form.addEventListener('change', render);
      form.addEventListener('click', function (e) {
        var b = e.target.closest('[data-tcx-qty]');
        if (!b) return;
        qtyInput.value = Math.min(20, Math.max(1, qty() + parseInt(b.dataset.tcxQty, 10)));
        render();
      });
      if (qtyInput) qtyInput.addEventListener('input', render);
    }

    document.addEventListener('tc:cart:added', function (e) {
      var cart = e.detail && e.detail.cart;
      if (cart) { cartCount = cart.item_count; cartTotal = cart.total_price; }
      if (qtyInput) qtyInput.value = 1;
      render();
    });

    /* Back/forward cache can restore a stale page: re-read the real cart. */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) { render(); return; }
      fetch(((window.Shopify && Shopify.routes && Shopify.routes.root) || '/') + 'cart.js', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (cart) { cartCount = cart.item_count; cartTotal = cart.total_price; render(); })
        .catch(render);
    });
    render();

    var row = hero.querySelector('.tcx-buy__row');
    if (row && sticky && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var en = entries[0];
        rowOut = !en.isIntersecting && en.boundingClientRect.top < 0;
        renderSticky();
      }).observe(row);
    }
    window.addEventListener('resize', renderSticky);
  }

  /* ---------- product page size ladder: drives the theme's own size inputs ---------- */
  var themeSizeInput = function (title) {
    var inputs = document.querySelectorAll('variant-selects input[type="radio"], variant-radios input[type="radio"]');
    for (var i = 0; i < inputs.length; i++) { if (inputs[i].value === title) return inputs[i]; }
    return null;
  };
  var firstOpt = document.querySelector('[data-tcx-ladder-opt]');
  if (firstOpt && themeSizeInput(firstOpt.dataset.tcxLadderOpt)) {
    document.body.classList.add('tcx-ladder-on');
    document.addEventListener('click', function (e) {
      var opt = e.target.closest && e.target.closest('[data-tcx-ladder-opt]');
      if (!opt || opt.disabled) return;
      var input = themeSizeInput(opt.dataset.tcxLadderOpt);
      if (!input) return;
      document.querySelectorAll('[data-tcx-ladder-opt]').forEach(function (o) {
        var on = o.dataset.tcxLadderOpt === opt.dataset.tcxLadderOpt;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      if (!input.checked) input.click();
      var barPrice = document.querySelector('.product-mobile-buy-bar__price span');
      var optPrice = opt.querySelector('[data-price]');
      if (barPrice && optPrice) barPrice.textContent = optPrice.dataset.price;
    });
  }

  /* ---------- same-day dispatch timer: counts down to the real daily cut-off (India time) ---------- */
  document.querySelectorAll('[data-tcx-cutoff]').forEach(function (el) {
    var hour = parseInt(el.dataset.hour, 10) || 13;
    var days = (el.dataset.days || '1,2,3,4,5,6').split(',').map(function (d) { return parseInt(d, 10); });
    var label = el.dataset.label || '1 pm';
    var text = el.querySelector('[data-tcx-cutoff-text]');
    var tickCut = function () {
      var now = new Date();
      var ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
      var mins = ist.getHours() * 60 + ist.getMinutes();
      var left = hour * 60 - mins;
      var live = days.indexOf(ist.getDay()) > -1 && left > 0;
      el.classList.toggle('is-live', live);
      if (live) {
        var h = Math.floor(left / 60), m = left % 60;
        text.innerHTML = 'Order in <b>' + (h ? h + 'h ' : '') + m + 'm</b> for same-day dispatch';
      } else {
        text.textContent = 'Orders before ' + label + ' are dispatched the same day';
      }
    };
    tickCut();
    setInterval(tickCut, 30000);
  });

  /* ---------- countdown to a real offer end ---------- */
  var offer = document.querySelector('[data-tcx-offer]');
  if (offer) {
    var end = parseInt(offer.dataset.end, 10) * 1000;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var timer;
    var tick = function () {
      var s = Math.floor((end - Date.now()) / 1000);
      if (!(s > 0)) { offer.hidden = true; clearInterval(timer); return; }
      offer.querySelector('[data-d]').textContent = Math.floor(s / 86400);
      offer.querySelector('[data-h]').textContent = pad(Math.floor(s % 86400 / 3600));
      offer.querySelector('[data-m]').textContent = pad(Math.floor(s % 3600 / 60));
      offer.querySelector('[data-s]').textContent = pad(s % 60);
    };
    timer = setInterval(tick, 1000);
    tick();
  }
})();
