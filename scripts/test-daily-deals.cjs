const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, resolve = require) {
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function('require', 'module', 'exports', code)(resolve, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { selectMobileDeals } = load('src/lib/storefront/dailyDeals.ts');
const mapper = load('src/lib/storefront/products.ts');
const now = Date.parse('2026-11-19T20:00:00Z');
const product = {
  id: 1, name: 'Synthetic discount', shortTitle: 'Synthetic discount', slug: 'synthetic-discount',
  effectivePrice: 80, compareAtPrice: 100, thumbnailUrl: '/icons/Logo.svg',
  category: { slug: 'computer-parts' }, isAvailable: true, stockStatus: 'InStock', isDealOfDay: false,
};
const daily = {
  ...product, id: 2, name: 'Synthetic daily', shortTitle: 'Synthetic daily', slug: 'synthetic-daily',
  isDealOfDay: true, compareAtPrice: undefined, dealOfDayEndsAt: '2026-11-20T01:01:01+04:00',
};

let model = selectMobileDeals([product], [daily], now);
assert.equal(model.featured.id, daily.id, 'home daily works without a discount or presence in deals');
assert.equal(model.remaining, 3661, 'deadline uses its +04:00 offset');
assert.equal(model.discounts.length, 1);
assert.equal(selectMobileDeals([], [{ ...daily, dealOfDayEndsAt: '2026-11-19T21:01:01Z' }], now).remaining, 3661);

const conflict = { ...daily, activePromotion: { endsAt: '2026-11-18T00:00:00Z' } };
assert.equal(selectMobileDeals([], [conflict], now).remaining, 3661, 'promotion clock does not override daily clock');
assert.equal(selectMobileDeals([product, { ...daily, isDealOfDay: false }], [daily], now).featured.isDealOfDay, true,
  'home selection wins over an older duplicate in the deals cache');
assert.equal(selectMobileDeals([product, daily], [daily], now).discounts.length, 1, 'no duplicate hero below');

for (const deadline of [undefined, null, 'invalid']) {
  const result = selectMobileDeals([], [{ ...daily, dealOfDayEndsAt: deadline }], now);
  assert.equal(result.featured.id, daily.id);
  assert.equal(result.remaining, null, 'no invented deadline or promotion fallback');
}
assert.equal(selectMobileDeals([], [daily], null).remaining, null, 'SSR and first client render agree');
const expires = Date.parse(daily.dealOfDayEndsAt);
assert.equal(selectMobileDeals([], [daily], expires - 1).remaining, 1, 'does not display zero before expiry');
for (const time of [expires, expires + 1, expires + 180000]) {
  const result = selectMobileDeals([product, { ...daily, compareAtPrice: 100 }], [daily], time);
  assert.equal(result.featured, undefined, 'cached expired daily hero disappears, including at zero');
  assert.deepEqual(result.discounts.map(p => p.id), [1], 'other discounts remain after expiry');
}
assert.equal(selectMobileDeals([], [{ ...daily, isAvailable: false }], now).featured, undefined);
assert.equal(selectMobileDeals([], [{ ...daily, stockStatus: 'OutOfStock' }], now).featured, undefined);
assert.equal(selectMobileDeals([product], [], now).featured.id, 1, 'existing generic offer fallback is retained');

let renderNow = now;
const Component = load('src/components/discount/MobileDeals.tsx', name => {
  if (name === 'react') return { ...React, useState: () => [renderNow, () => {}], useEffect: () => {} };
  if (name === 'next/link') return { __esModule: true, default: ({ href, className, children }) => React.createElement('a', { href, className }, children) };
  if (name.includes('storefront/dailyDeals')) return { selectMobileDeals };
  if (name.includes('storefront/products')) return mapper;
  if (name.includes('useStorefrontLocale')) return { useStorefrontLocale: () => 'ka' };
  if (name.endsWith('.scss')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
  return require(name);
}).default;
const render = (products, dailyOffers) => renderToStaticMarkup(React.createElement(Component, { products, dailyOffers }));
let html = render([product], [daily]);
assert.match(html, /დღის შეთავაზება/);
assert.match(html, /01 საათი, 01 წუთი, 01 წამი/);
const hero = html.match(/<a[^>]*class="featured"[\s\S]*?<\/a>/)[0];
assert.doesNotMatch(hero, /<del|0%/, 'undiscounted daily has no crossed-out price or zero badge');
html = render([], [{ ...daily, compareAtPrice: 100 }]);
assert.match(html, /<del/); assert.match(html, /-20%/);
html = render([], [{ ...daily, dealOfDayEndsAt: null }]);
assert.match(html, /დასრულების დრო ჯერ არ არის მითითებული/);
renderNow = expires;
html = render([product], [daily]);
assert.doesNotMatch(html, /class="featured"|role="timer"|Synthetic daily/);
assert.match(html, /Synthetic discount/);
assert.equal(render([], [daily]), '', 'empty expired block disappears entirely');
console.log('PASS: daily deadline, timezone, no discount, home priority, cache expiry, stock, placeholders and rendered prices. Synthetic fixtures only.');
