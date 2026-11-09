// Isolated proxy tests: only synthetic tokens, mocked upstream, no live account mutations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');
function loader() {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const mod = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const req = name => name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : require(name);
    vm.runInNewContext(code, { exports: mod.exports, require: req, process, URL, Response, TextDecoder, Headers, fetch: (...args) => global.fetch(...args) });
    cache.set(file, mod.exports);
    return mod.exports;
  }
  return load;
}
function request(action, { body = {}, cookie, headers = {}, method = 'POST' } = {}) {
  return new NextRequest('http://localhost:3000/api/auth/' + action, {
    method, headers: { 'content-type': 'application/json', host: 'localhost:3000', ...(cookie ? {cookie: 'athome_rt=' + cookie} : {}), ...headers },
    ...(method === 'POST' ? {body: JSON.stringify(body)} : {}),
  });
}
const context = action => ({ params: Promise.resolve({segments: action.split('/')}) });
(async () => {
  process.env.INTERNAL_API_URL = 'http://127.0.0.1:5001';
  process.env.NEXT_PUBLIC_API_URL = 'https://public.example.invalid';
  const load = loader();
  const proxy = load('src/app/api/auth/[...segments]/route.ts');
  const upstream = load('src/lib/api/upstream.ts');
  let captured, count = 0;
  global.fetch = async (url, options) => { captured = {url: String(url), options}; count++; return Response.json({ accessToken: 'synthetic-access', refreshToken: 'synthetic-refresh' }); };
  for (const action of ['login', 'social']) {
    const res = await proxy.POST(request(action, {headers: {'cf-connecting-ip':'203.0.113.8'}}), context(action));
    assert.equal(res.status, 200);
    assert.equal((await res.json()).refreshToken, undefined);
    assert.equal(res.cookies.get('athome_rt').value, 'synthetic-refresh');
    const cookie = res.headers.get('set-cookie');
    for (const part of ['HttpOnly','Secure','SameSite=strict','Path=/api/auth','Max-Age=604800']) assert(cookie.includes(part), part);
    assert.equal(captured.url, 'http://127.0.0.1:5001/api/auth/' + action);
    assert.equal(captured.options.headers['X-Forwarded-For'], '203.0.113.8');
  }
  const before = count;
  assert.equal((await proxy.POST(request('refresh-token', {cookie:'synthetic-old'}), context('refresh-token'))).status, 401);
  assert.equal(count, before, 'missing CSRF header must not reach backend');
  for (const origin of ['https://foreign.example.invalid','invalid']) {
    const res = await proxy.POST(request('refresh-token', {cookie:'synthetic-old', headers:{'x-athome-refresh':'1',origin}}), context('refresh-token'));
    assert.equal(res.status, 403);
  }
  let res = await proxy.POST(request('refresh-token', {cookie:'synthetic-cookie', body:{refreshToken:'synthetic-stale-body'}, headers:{'x-athome-refresh':'1',origin:'http://localhost:3000'}}), context('refresh-token'));
  assert.equal(JSON.parse(captured.options.body).refreshToken, 'synthetic-cookie');
  assert.equal((await res.json()).refreshToken, undefined);
  res = await proxy.POST(request('refresh-token', {body:{refreshToken:'synthetic-legacy'}}), context('refresh-token'));
  assert.equal(JSON.parse(captured.options.body).refreshToken, 'synthetic-legacy');
  assert.equal(res.cookies.get('athome_rt').value, 'synthetic-refresh');
  global.fetch = async () => Response.json({message:'expired'}, {status:401});
  res = await proxy.POST(request('refresh-token', {cookie:'synthetic-expired',headers:{'x-athome-refresh':'1'}}), context('refresh-token'));
  assert(res.headers.get('set-cookie').includes('Max-Age=0'));
  global.fetch = async () => Response.json({code:'RATE_LIMITED'}, {status:429,headers:{'Retry-After':'17'}});
  res = await proxy.POST(request('refresh-token', {cookie:'synthetic-valid',headers:{'x-athome-refresh':'1'}}), context('refresh-token'));
  assert.equal(res.headers.get('retry-after'),'17');
  assert.equal(res.headers.get('set-cookie'),null, '429 must preserve the session cookie');
  for (const status of [200,401,500]) {
    global.fetch = async () => Response.json({message:'logout'}, {status});
    res = await proxy.POST(request('logout', {cookie:'synthetic-old'}), context('logout'));
    assert(res.headers.get('set-cookie').includes('Max-Age=0'));
  }
  global.fetch = async () => { throw new Error('offline'); };
  res = await proxy.POST(request('logout', {cookie:'synthetic-old'}), context('logout'));
  assert.equal(res.status,502); assert(res.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal((await proxy.POST(request('logout'),context('logout'))).status,204);
  assert.equal((await proxy.GET(request('refresh-token',{method:'GET'}),context('refresh-token'))).status,405);

  const ipRequest = headers => ({headers:new Headers(headers)});
  assert.equal(upstream.clientIpOf(ipRequest({'cf-connecting-ip':'2001:db8::1'})),'2001:db8::1');
  assert.equal(upstream.clientIpOf(ipRequest({'cf-connecting-ip':'bad','x-forwarded-for':'192.0.2.1, 203.0.113.9'})),'203.0.113.9');
  assert.equal(upstream.clientIpOf(ipRequest({'x-forwarded-for':'203.0.113.9, invalid'})),undefined);
  assert.equal(Object.keys(upstream.upstreamHeaders(ipRequest({'cf-connecting-ip':'bad'}))).length,0);
  // Execute every upstream proxy export with a mocked backend, including both product fetches.
  const files = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  let routesChecked = 0;
  for (const file of files('src/app/api').filter(file => file.endsWith('/route.ts') && fs.readFileSync(file, 'utf8').includes('UPSTREAM_API_URL as API_BASE_URL'))) {
    const route = load(file);
    for (const method of ['GET','POST','PUT','DELETE'].filter(method => typeof route[method] === 'function')) {
      let sent = false;
      global.fetch = async (url, options) => {
        sent = true;
        assert(String(url).startsWith('http://127.0.0.1:5001/'), file);
        assert.equal(options.headers['X-Forwarded-For'], '203.0.113.8', file);
        return Response.json([]);
      };
      await route[method](new NextRequest('http://localhost:3000/api/test', {method, headers:{'cf-connecting-ip':'203.0.113.8'}, ...(method === 'GET' ? {} : {body:'{}'})}), {params:Promise.resolve({segments:['me'],slug:'test',categorySlug:'test',orderNumber:'QA-1'})});
      assert(sent, file + ' ' + method);
    }
    routesChecked++;
  }
  assert.equal(routesChecked, 29);
  delete process.env.INTERNAL_API_URL;
  assert.equal(Object.keys(loader()('src/lib/api/upstream.ts').upstreamHeaders(ipRequest({'cf-connecting-ip':'203.0.113.9'}))).length,0);

  const middleware = load('src/middleware.ts').middleware;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://new.athome.ge';
  const redirect = await middleware(new NextRequest('http://localhost:3000/en/authorization?tab=register',{headers:{host:'new.athome.ge','cf-visitor':'{"scheme": "http"}'}}));
  assert.equal(redirect.status,308); assert.equal(redirect.headers.get('location'),'https://new.athome.ge/en/authorization?tab=register');
  const local = await middleware(new NextRequest('http://localhost:3000/authorization',{headers:{host:'localhost:3000'}}));
  assert.equal(local.headers.get('location'),null);
  const secure = await middleware(new NextRequest('http://localhost:3000/authorization',{headers:{host:'new.athome.ge','cf-visitor':'{"scheme":"https"}'}}));
  assert.equal(secure.headers.get('location'),null,'HTTPS visitors must not loop');
  console.log('PASS: token redaction and cookie flags/rotation/legacy/logout/401/429; CSRF; client IP trust and public fallback; HTTPS redirect without loops.');
})().catch(error => { console.error(error); process.exitCode = 1; });
