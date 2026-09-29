/* pl-cart-b.js — PureLeven cart.
   Three jobs, all re-run after cart.js swaps <cart-items> on a change:
     1. Indian-grouped rupee figures (money_format is "Rs. {{amount}}", so the
        Liquid money filter cannot be used; Liquid prints a plain number first).
     2. The estimated delivery date.
     3. The one-tap add-on in the free-delivery card. */
(function () {
  var INR = null;
  try {
    INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  } catch (e) {
    INR = null;
  }

  function formatMoney(root) {
    if (!INR) return;
    (root || document).querySelectorAll('[data-plb-inr]').forEach(function (node) {
      var paise = parseInt(node.getAttribute('data-plb-inr'), 10);
      if (isNaN(paise)) return;
      node.textContent = '₹' + INR.format(Math.round(paise / 100));
    });
  }

  /* Orders placed after 2 pm IST lose a day of dispatch. The base number of
     days comes from Theme settings and is carried on the <cart-items> element. */
  function deliveryDate(root) {
    var nodes = (root || document).querySelectorAll('[data-plb-eta]');
    if (!nodes.length) return;
    var host = document.querySelector('.plb');
    var base = host ? parseInt(host.getAttribute('data-eta'), 10) : NaN;
    if (isNaN(base)) base = 3;
    var now = new Date();
    var istNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 3600000);
    var d = new Date(now.getTime() + (base + (istNow.getHours() >= 14 ? 1 : 0)) * 86400000);
    var label;
    try {
      label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) {
      label = d.toDateString();
    }
    nodes.forEach(function (node) { node.textContent = label; });
  }

  /* Add-on "Add". /cart/add.js returns the cart section rendered from Liquid,
     so the totals, the goal card and the bill all redraw from one source. */
  function bindAdd() {
    if (document.body.dataset.plbAddBound === '1') return;
    document.body.dataset.plbAddBound = '1';

    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-plb-add]');
      if (!btn) return;
      event.preventDefault();

      var host = document.querySelector('cart-items');
      var holder = document.getElementById('main-cart-items') || document.getElementById('main-cart-footer');
      var sectionId = holder && holder.getAttribute('data-id');
      var original = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'Adding…';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: [{ id: Number(btn.getAttribute('data-plb-add')), quantity: 1 }],
          sections: sectionId ? [sectionId, 'cart-icon-bubble'] : [],
          sections_url: '/cart',
        }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('add failed');
          return r.json();
        })
        .then(function (state) {
          var html = state.sections && sectionId && state.sections[sectionId];
          var next = html && new DOMParser().parseFromString(html, 'text/html').querySelector('cart-items');
          if (!host || !next) {
            window.location.reload();
            return;
          }
          host.innerHTML = next.innerHTML;
          var bubble = document.getElementById('cart-icon-bubble');
          var bubbleHtml = state.sections['cart-icon-bubble'];
          if (bubble && bubbleHtml) {
            var wrap = new DOMParser().parseFromString(bubbleHtml, 'text/html').querySelector('.shopify-section');
            if (wrap) bubble.innerHTML = wrap.innerHTML;
          }
          refresh(document);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = original || 'Add';
        });
    });
  }

  function refresh(root) {
    formatMoney(root);
    deliveryDate(root);
  }

  function boot() {
    bindAdd();
    refresh(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* cart.js calls this after it swaps <cart-items>. */
  window.plRefreshCartUI = function () { refresh(document); };
  document.addEventListener('cart:refresh', function () { refresh(document); });
})();
