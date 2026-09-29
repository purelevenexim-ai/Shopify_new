(function () {
  if (window.__tcCardInit) return;
  window.__tcCardInit = true;

  var FREE_THRESHOLD = 64900;

  function inr(paise) {
    return '₹' + Math.round(paise / 100).toLocaleString('en-IN');
  }

  function setDelivery(el, priceRaw) {
    var text, free;
    if (el.dataset.tcRule === 'two') {
      var count = window.tcCartCount != null ? window.tcCartCount : parseInt(el.dataset.cartCount, 10) || 0;
      var total = window.tcCartTotal != null ? window.tcCartTotal : parseInt(el.dataset.cartTotal, 10) || 0;
      if (count >= 2 || total >= FREE_THRESHOLD) { free = true; text = 'Free delivery unlocked'; }
      else if (priceRaw >= FREE_THRESHOLD) { free = true; text = 'Free delivery on this'; }
      else if (count === 1) { free = false; text = 'Add 1 more · free delivery'; }
      else { free = false; text = 'Any 2 · free delivery'; }
    } else {
      free = priceRaw >= FREE_THRESHOLD;
      text = free ? 'Free delivery on this' : 'Free delivery ₹649+';
    }
    el.textContent = text;
    el.classList.toggle('is-free', free);
  }

  function readVariants(card) {
    var el = card.querySelector('.tc-variant-data');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (_) { return null; }
  }

  function selectedVariant(card, variants) {
    var input = card.querySelector('.tc-variant-radio:checked') || card.querySelector('input[name="id"][type="hidden"]');
    return input && variants.find(function (v) { return String(v.id) === input.value; });
  }

  function render(card, variant) {
    var price = card.querySelector('[data-tc-price]');
    var compare = card.querySelector('[data-tc-compare]');
    var save = card.querySelector('[data-tc-save]');
    var onSale = variant.compare_raw > variant.price_raw;

    if (price) price.textContent = inr(variant.price_raw);
    if (compare) {
      compare.hidden = !onSale;
      if (onSale) compare.textContent = inr(variant.compare_raw);
    }
    if (save) {
      save.hidden = !onSale;
      if (onSale) save.textContent = 'Save ' + Math.round((variant.compare_raw - variant.price_raw) * 100 / variant.compare_raw) + '%';
    }

    var delivery = card.querySelector('[data-tc-delivery]');
    if (delivery) setDelivery(delivery, variant.price_raw);

    var btn = card.querySelector('[data-tc-atc]');
    if (btn && btn.getAttribute('aria-busy') !== 'true') {
      btn.disabled = !variant.available;
      btn.textContent = variant.available ? 'Add to cart' : 'Sold out';
    }
  }

  function syncAll() {
    document.querySelectorAll('.tc-product-card').forEach(function (card) {
      var variants = readVariants(card);
      var v = variants && selectedVariant(card, variants);
      if (v) render(card, v);
    });
  }

  window.tcRefreshDelivery = function (count, total) {
    window.tcCartCount = count;
    window.tcCartTotal = total;
    syncAll();
  };

  // Safari restores radio state after load, so sync on load and on bfcache restores.
  if (document.readyState === 'complete') syncAll();
  else window.addEventListener('load', syncAll);
  window.addEventListener('pageshow', syncAll);

  document.addEventListener('change', function (e) {
    var radio = e.target;
    if (!radio.classList || !radio.classList.contains('tc-variant-radio')) return;
    var card = radio.closest('.tc-product-card');
    var variants = card && readVariants(card);
    var v = variants && variants.find(function (x) { return String(x.id) === radio.value; });
    if (v) render(card, v);
  });
})();
