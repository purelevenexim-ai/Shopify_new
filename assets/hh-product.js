/* Product pages: size cards (snippets/hh-buy-box.liquid) drive the theme's own size inputs. */
(function () {
  function themeInput(title) {
    var ins = document.querySelectorAll('variant-selects input[type="radio"], variant-radios input[type="radio"]');
    for (var i = 0; i < ins.length; i++) { if (ins[i].value === title) return ins[i]; }
    return null;
  }
  function init() {
    var first = document.querySelector('[data-hh-size]');
    if (first && themeInput(first.getAttribute('data-hh-size'))) document.body.classList.add('hh-sizes-on');
  }
  document.addEventListener('click', function (e) {
    var opt = e.target.closest && e.target.closest('[data-hh-size]');
    if (!opt || opt.disabled) return;
    var input = themeInput(opt.getAttribute('data-hh-size'));
    if (!input) return;
    var group = opt.closest('[data-hh-sizes]');
    Array.prototype.forEach.call(group.querySelectorAll('[data-hh-size]'), function (b) {
      var on = b === opt;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (!input.checked) input.click();
    var bar = document.querySelector('.product-mobile-buy-bar__price span');
    var p = opt.querySelector('[data-price]');
    if (bar && p) bar.textContent = p.getAttribute('data-price');
  });
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
