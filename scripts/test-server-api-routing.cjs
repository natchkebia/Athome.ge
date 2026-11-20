const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function runtime(env, fetchImpl, timeout = 5000) {
  const calls = [];
  const deadlines = [];
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const mod = { exports: {} };
    const req = name => {
      if (name === 'next/headers') return { headers: async () => new Headers({ 'x-lang': 'en' }) };
      if (name.includes('admin/entity-meta')) return { entityMeta: () => ({}) };
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      return require(name);
    };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, {
      exports: mod.exports, require: req, process: { env }, URL, Response, Headers,
      console: { error() {} },
      AbortSignal: { timeout: ms => { deadlines.push(ms); return AbortSignal.timeout(timeout); } },
      fetch: async (url, options) => { calls.push({ url: String(url), options }); return fetchImpl(url, options); },
    });
    cache.set(file, mod.exports);
    return mod.exports;
  }
  return { load, calls, deadlines };
}

const env = {
  INTERNAL_API_URL: 'http://127.0.0.1:5001/',
  NEXT_PUBLIC_API_URL: 'https://public.example.invalid/',
  NEXT_PUBLIC_SITE_URL: 'https://shop.example.invalid',
};
const fixture = { heroBanners: [], name: 'Synthetic title', images: [{ url: 'https://public.example.invalid/uploads/photo.png' }] };
const ok = () => Response.json(fixture);
const slow = (_, { signal }) => new Promise((resolve, reject) => {
  const pending = setTimeout(() => resolve(ok()), 1000);
  signal.addEventListener('abort', () => { clearTimeout(pending); reject(signal.reason); }, { once: true });
});

(async () => {
  for (const [settings, origin] of [
    [env, 'http://127.0.0.1:5001'],
    [{ NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL }, 'https://public.example.invalid'],
    [{}, 'https://api.ithome.ge'],
  ]) {
    const rt = runtime(settings, ok);
    await rt.load('src/lib/api/storefrontServer.ts').getStorefrontHomeServer('en');
    assert.equal(rt.calls[0].url, origin + '/api/storefront/home?lang=en');
    assert.equal(rt.calls[0].options.headers['X-Lang'], 'en');
    assert.equal(rt.calls[0].options.next.revalidate, 60);
    assert.deepEqual(rt.deadlines, [5000]);
  }
  const timed = runtime(env, slow, 15);
  const start = Date.now();
  const fallback = await timed.load('src/lib/api/storefrontServer.ts').getStorefrontHomeServer();
  assert.equal(fallback.heroBanners.length, 0);
  assert(Date.now() - start < 500, 'SSR recovers instead of waiting on an unresponsive API');
  const failed = runtime(env, () => new Response(null, { status: 503 }));
  assert.equal((await failed.load('src/lib/api/storefrontServer.ts').getStorefrontCategoriesServer()).length, 0);

  const layouts = [
    ['src/app/(pages)/products/[category]/layout.tsx', { category: 'monitor' }, '/api/storefront/categories/monitor'],
    ['src/app/(pages)/products/[category]/[slug]/layout.tsx', { category: 'monitor', slug: 'synthetic' }, '/api/storefront/products/synthetic'],
    ['src/app/(pages)/products/brand/[brandSlug]/layout.tsx', { brandSlug: 'asus' }, '/api/storefront/brands/asus'],
  ];
  for (const [file, params, endpoint] of layouts) {
    const rt = runtime(env, ok);
    const metadata = await rt.load(file).generateMetadata({ params: Promise.resolve(params) });
    assert.equal(rt.calls[0].url, 'http://127.0.0.1:5001' + endpoint + '?lang=en');
    assert.equal(rt.calls[0].options.cache, 'no-store');
    assert.deepEqual(rt.deadlines, [5000]);
    assert(metadata.alternates.canonical.startsWith('https://shop.example.invalid/en/'));
    assert(!JSON.stringify(metadata).includes('127.0.0.1'), 'metadata never exposes the internal origin');
    const timedMetadata = runtime(env, slow, 15);
    const result = await timedMetadata.load(file).generateMetadata({ params: Promise.resolve(params) });
    assert.equal(result.title, 'Athome.ge', 'metadata retains fallback titles on timeout');
  }

  const imageRuntime = runtime(env, () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } }));
  const imageRoute = imageRuntime.load('src/app/api/storefront/invoice-image/route.ts');
  const request = value => ({ nextUrl: new URL('http://localhost:3000/api/storefront/invoice-image?path=' + encodeURIComponent(value)), headers: new Headers({ 'cf-connecting-ip': '203.0.113.5' }) });
  assert.equal((await imageRoute.GET(request('/uploads/products/images/synthetic.png'))).status, 200);
  assert.equal(imageRuntime.calls[0].url, 'http://127.0.0.1:5001/uploads/products/images/synthetic.png');
  assert.equal(imageRuntime.calls[0].options.headers['X-Forwarded-For'], '203.0.113.5');
  for (const bad of ['https://other.example.invalid/a.png', '//other.example.invalid/a.png', '/uploads/products/images/../secret', '/uploads/products/images/%2e%2e/%2e%2e/private']) {
    assert.equal((await imageRoute.GET(request(bad))).status, 400);
  }
  assert.equal(imageRuntime.calls.length, 1, 'invalid paths never reach upstream');
  const rejectedImage = runtime(env, () => Response.json({ secret: 'synthetic' }));
  assert.equal((await rejectedImage.load('src/app/api/storefront/invoice-image/route.ts').GET(request('/uploads/products/images/a.png'))).status, 404);

  for (const level of ['minicategories', 'subcategories']) {
    const rt = runtime(env, () => Response.json({ filters: [] }));
    const route = rt.load('src/app/api/storefront/' + level + '/[slug]/filters/route.ts');
    const result = await route.GET({ nextUrl: new URL('http://localhost:3000/api/storefront/' + level + '/synthetic/filters?lang=en'), headers: new Headers() }, { params: Promise.resolve({ slug: 'synthetic' }) });
    assert.equal(result.status, 200);
    assert.equal(rt.calls[0].url, 'http://127.0.0.1:5001/api/storefront/' + level + '/synthetic/filters?lang=en');
  }
  const media = runtime(env, ok).load('src/lib/storefront/products.ts');
  assert.equal(media.normalizeMediaUrl('/uploads/products/images/a.png'), 'https://public.example.invalid/uploads/products/images/a.png');
  console.log('PASS: internal SSR/metadata/image/filter routing, public fallback and media, 5s abort signals, timeout fallbacks, image allowlist. Synthetic requests only.');
})().catch(error => { console.error(error); process.exitCode = 1; });
