(function () {
  if (window.__tcAjaxCart) return;
  window.__tcAjaxCart = true;

  var FORM_SEL = '.tc-product-form, .tc-coffee-form, .tc-trial-pack-form';
  var FREE_THRESHOLD = 64900;
  var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
  var cartUrl = (window.routes && window.routes.cart_url) || root + 'cart';
  var lastSubmitter = null;
  var toast, hideTimer;
  var ui = {};

  var CSS = '' +
    '.tc-toast{position:fixed;z-index:2147483000;top:12px;right:20px;width:360px;max-width:calc(100vw - 24px);background:#F9F9F6;color:#0B0B0F;border:1px solid #17191A;border-radius:3px;padding:16px;font-family:Manrope,"Segoe UI",Helvetica,Arial,sans-serif;transform:translateY(-120%);opacity:0;transition:transform .28s cubic-bezier(.2,.65,.2,1),opacity .28s cubic-bezier(.2,.65,.2,1)}' +
    '.tc-toast.is-open{transform:none;opacity:1}' +
    '.tc-toast[hidden],.tc-toast.tc-toast [hidden]{display:none!important}' +
    '.tc-toast__head{display:flex;align-items:center;gap:10px;margin-bottom:14px}' +
    '.tc-toast__tick{width:22px;height:22px;border-radius:2px;background:#1F6B5C;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}' +
    '.tc-toast.is-error{border-color:#C8102E}' +
    '.tc-toast.is-error .tc-toast__tick{background:#C8102E}' +
    '.tc-toast__title{flex:1;font-size:15px;font-weight:600;letter-spacing:-.01em}' +
    '.tc-toast .tc-toast__close{background:none!important;border:0!important;padding:0 4px!important;margin:0!important;min-height:0!important;width:auto!important;font-size:22px!important;line-height:1!important;color:#5F6470!important;cursor:pointer;box-shadow:none!important}' +
    '.tc-toast__item{display:flex;align-items:center;gap:12px;margin-bottom:14px}' +
    '.tc-toast__img{width:56px;height:56px;border-radius:2px;border:1px solid #DEDEDB;object-fit:cover;background:#F1F1ED;flex-shrink:0}' +
    '.tc-toast__name{font-size:14px;font-weight:600;line-height:1.35;letter-spacing:-.01em}' +
    '.tc-toast__variant{font:400 11px/1.5 ui-monospace,"SF Mono",Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:#5F6470;margin-top:2px}' +
    '.tc-toast__msg{font-size:13px;color:#3D4250;line-height:1.55;margin-bottom:14px}' +
    '.tc-toast__ship{font:400 11px/1.5 ui-monospace,"SF Mono",Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;border:1px solid #DEDEDB;border-radius:2px;padding:10px 12px;margin-bottom:14px;background:#F1F1ED;color:#3D4250}' +
    '.tc-toast__ship.is-free{background:#EAF2EE;border-color:#EAF2EE;color:#1F6B5C}' +
    '.tc-toast__bar{height:4px;border-radius:2px;background:#DEDEDB;margin-top:8px;overflow:hidden}' +
    '.tc-toast__bar span{display:block;height:100%;width:50%;background:#17191A;border-radius:2px}' +
    '.tc-toast__actions{display:flex;gap:8px}' +
    '.tc-toast .tc-toast__btn{flex:1;display:inline-flex!important;align-items:center;justify-content:center;min-height:48px!important;padding:0 14px!important;margin:0!important;border-radius:2px!important;font-family:Manrope,"Segoe UI",Helvetica,Arial,sans-serif!important;font-size:13px!important;font-weight:600!important;letter-spacing:-.01em!important;text-transform:none!important;line-height:1.2!important;text-decoration:none!important;white-space:nowrap!important;cursor:pointer;box-shadow:none!important;transition:background-color .2s,border-color .2s,color .2s}' +
    '.tc-toast .tc-toast__btn--primary{background:#17191A!important;color:#fff!important;border:1px solid #17191A!important}' +
    '.tc-toast .tc-toast__btn--primary:hover{background:#004438!important;border-color:#004438!important}' +
    '.tc-toast .tc-toast__btn--ghost{background:#fff!important;color:#0B0B0F!important;border:1px solid #D9DBE1!important}' +
    '.tc-toast .tc-toast__btn--ghost:hover{border-color:#17191A!important}' +
    '@media (max-width:749px){.tc-toast{left:10px;right:10px;top:10px;width:auto;max-width:none}}';

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function buildToast() {
    var style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    toast = el('div', 'tc-toast');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.hidden = true;

    var head = el('div', 'tc-toast__head');
    ui.tick = el('span', 'tc-toast__tick', '✓');
    ui.title = el('strong', 'tc-toast__title');
    var close = el('button', 'tc-toast__close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', hideToast);
    head.append(ui.tick, ui.title, close);

    ui.item = el('div', 'tc-toast__item');
    ui.img = el('img', 'tc-toast__img');
    ui.img.alt = '';
    var info = el('div');
    ui.name = el('div', 'tc-toast__name');
    ui.variant = el('div', 'tc-toast__variant');
    info.append(ui.name, ui.variant);
    ui.item.append(ui.img, info);

    ui.msg = el('div', 'tc-toast__msg');
    ui.ship = el('div', 'tc-toast__ship');

    var actions = el('div', 'tc-toast__actions');
    ui.view = el('a', 'tc-toast__btn tc-toast__btn--primary', 'View cart');
    ui.view.href = cartUrl;
    ui.cont = el('button', 'tc-toast__btn tc-toast__btn--ghost', 'Keep shopping');
    ui.cont.type = 'button';
    ui.cont.addEventListener('click', hideToast);
    actions.append(ui.view, ui.cont);

    toast.append(head, ui.item, ui.msg, ui.ship, actions);
    toast.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    toast.addEventListener('mouseleave', scheduleHide);
    toast.addEventListener('focusin', function () { clearTimeout(hideTimer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideToast(); });
    document.body.appendChild(toast);
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideToast, 6000);
  }

  function hideToast() {
    if (!toast) return;
    clearTimeout(hideTimer);
    toast.classList.remove('is-open');
    setTimeout(function () { if (!toast.classList.contains('is-open')) toast.hidden = true; }, 300);
  }

  function openToast() {
    toast.hidden = false;
    void toast.offsetWidth;
    toast.classList.add('is-open');
    scheduleHide();
  }

  function showAdded(item, cart) {
    if (!toast) buildToast();
    toast.classList.remove('is-error');
    ui.tick.textContent = '✓';
    ui.title.textContent = 'Added to cart';
    ui.item.hidden = false;
    ui.msg.hidden = true;
    ui.name.textContent = item.product_title || '';
    var variant = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
    ui.variant.textContent = variant;
    if (item.image) {
      ui.img.src = item.image + (item.image.indexOf('?') > -1 ? '&' : '?') + 'width=120';
      ui.img.hidden = false;
    } else {
      ui.img.hidden = true;
    }

    var free = cart.item_count >= 2 || cart.total_price >= FREE_THRESHOLD;
    ui.ship.hidden = false;
    ui.ship.classList.toggle('is-free', free);
    ui.ship.textContent = free ? '🎉 FREE delivery unlocked' : 'Add 1 more item for FREE delivery';
    if (!free) {
      var bar = el('div', 'tc-toast__bar');
      bar.appendChild(el('span'));
      ui.ship.appendChild(bar);
    }

    ui.view.hidden = false;
    ui.view.textContent = 'View cart (' + cart.item_count + ')';
    ui.cont.textContent = 'Keep shopping';
    openToast();
  }

  function showError(message) {
    if (!toast) buildToast();
    toast.classList.add('is-error');
    ui.tick.textContent = '!';
    ui.title.textContent = "Couldn't add to cart";
    ui.item.hidden = true;
    ui.ship.hidden = true;
    ui.msg.hidden = false;
    ui.msg.textContent = message || 'Please try again.';
    ui.view.hidden = true;
    ui.cont.textContent = 'Close';
    openToast();
  }

  function sectionInner(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var wrap = doc.querySelector('.shopify-section');
    return wrap ? wrap.innerHTML : html;
  }

  function syncCart(cart) {
    if (window.tcRefreshDelivery) window.tcRefreshDelivery(cart.item_count, cart.total_price);
  }

  function track(item, qty) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'INR',
        value: (item.price * qty) / 100,
        items: [{
          item_id: item.sku || String(item.variant_id),
          item_name: item.product_title,
          item_variant: item.variant_title,
          price: item.price / 100,
          quantity: qty
        }]
      }
    });
  }

  function setBusy(btn, busy, label) {
    btn.disabled = busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (label) btn.textContent = label;
  }

  function addToCart(form, btn) {
    var data = new FormData(form);
    var id = data.get('id');
    var qty = parseInt(data.get('quantity'), 10) || 1;
    if (!id) return form.submit();

    var original = btn.textContent.trim();
    setBusy(btn, true, 'Adding…');

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        items: [{ id: Number(id), quantity: qty }],
        sections: 'cart-icon-bubble',
        sections_url: window.location.pathname
      })
    })
      .then(function (res) {
        return res.json().then(function (body) {
          if (!res.ok || body.status) throw new Error(body.description || body.message || 'Please try again.');
          return body;
        });
      })
      .then(function (body) {
        var item = (body.items && body.items[0]) || body;
        var bubble = document.getElementById('cart-icon-bubble');
        if (bubble && body.sections && body.sections['cart-icon-bubble']) {
          bubble.innerHTML = sectionInner(body.sections['cart-icon-bubble']);
        }
        track(item, qty);
        return fetch(root + 'cart.js', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (cart) {
            syncCart(cart);
            showAdded(item, cart);
            if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
              publish(PUB_SUB_EVENTS.cartUpdate, { source: 'tc-ajax-cart', productVariantId: id, cartData: cart });
            }
            document.dispatchEvent(new CustomEvent('tc:cart:added', { detail: { item: item, cart: cart } }));
          });
      })
      .then(function () {
        setBusy(btn, false, '✓ Added');
        setTimeout(function () { if (btn.textContent === '✓ Added') btn.textContent = original; }, 1600);
      })
      .catch(function (err) {
        setBusy(btn, false, original);
        showError(err && err.message);
      });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[type="submit"]');
    if (b) lastSubmitter = b;
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement) || !form.matches(FORM_SEL)) return;
    var btn = e.submitter || (lastSubmitter && lastSubmitter.form === form ? lastSubmitter : null);
    if (!btn || btn.name !== 'add') return;
    e.preventDefault();
    addToCart(form, btn);
  });

  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    fetch(root + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(syncCart)
      .catch(function () {});
  });
})();
