// Run with node scripts/test-security-hardening.cjs. No live accounts or requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const modules = new Map();
const locale = { getBrowserLocale: () => 'en' };
const tokens = { getStoredAuthTokens: () => ({ accessToken: 'test', refreshToken: 'test' }), storeAuthTokens() {}, clearAuthTokens() {} };
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file);
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = name => name === 'next/server' ? { NextResponse: Response } : name.includes('i18n/locale') ? locale
    : name.includes('auth/tokens') ? tokens
    : name.includes('profilePreferences') ? { storeProfileGender() {} }
    : load(path.resolve(path.dirname(file), name + '.ts'));
  vm.runInNewContext(code, { exports: mod.exports, require: localRequire, process, window: { location: { origin: 'http://localhost', pathname: '/' } }, fetch: (...args) => global.fetch(...args), URL, Headers, Response, FormData, Date, console }, { filename: file });
  modules.set(file, mod.exports);
  return mod.exports;
}
(async () => {
  const { ApiError, apiRequest, parseRetryAfter } = load('src/lib/api/client.ts');
  const auth = load('src/lib/api/auth.ts');
  let calls = [];
  global.fetch = async (url, options) => { calls.push({ url, options }); return Response.json({}); };
  for (const length of [12, 128]) auth.validateNewPassword('a'.repeat(length));
  for (const value of ['a'.repeat(11), 'a'.repeat(129), 'Person@Example.com', '+995555123456']) {
    assert.throws(() => auth.validateNewPassword(value, 'person@example.com', '+995555123456'), e => e.code === 'WEAK_PASSWORD');
  }
  // Every password creation entry point rejects weak passwords before network access.
  for (const name of ['registerIndividual', 'registerLegal', 'changePassword', 'resetPassword', 'resetPasswordSms', 'resetPasswordEmailOtp']) {
    await assert.rejects(async () => auth[name]({ password: 'short', newPassword: 'short' }), e => e.code === 'WEAK_PASSWORD');
  }
  assert.equal(calls.length, 0);
  global.fetch = async () => { calls.push({}); return new Response(JSON.stringify({ code: 'RATE_LIMITED' }), { status: 429, headers: { 'content-type': 'application/problem+json', 'retry-after': '42' } }); };
  await assert.rejects(apiRequest('/api/auth/login', { useProxy: true }), e => e instanceof ApiError && e.code === 'RATE_LIMITED' && e.retryAfter === 42 && /42 seconds/.test(e.message));
  assert.equal(calls.length, 1, '429 must never retry automatically');
  assert.equal(parseRetryAfter('12'), 12);
  assert.equal(parseRetryAfter('invalid'), undefined);
  assert(parseRetryAfter(new Date(Date.now() + 60000).toUTCString()) > 58);
  for (const code of ['WEAK_PASSWORD', 'BREACHED_PASSWORD', 'AI_PROMPT_REQUIRED', 'AI_PROMPT_TOO_LONG', 'AI_DAILY_LIMIT', 'AI_UNAVAILABLE']) {
    assert(!new ApiError(409, { code }).message.includes('API request failed'));
  }
  global.fetch = async () => new Response(JSON.stringify({ message: 'account is locked' }), { status: 401, headers: { 'content-type': 'application/json' } });
  await assert.rejects(auth.login({ email: 'test@example.invalid', password: 'test' }), e => e.message === 'Email or password is incorrect.');
  calls = [];
  global.fetch = async (url, options) => { calls.push({ url, options }); return new Response(null, { status: 204 }); };
  await auth.resendEmailVerification('test@example.invalid');
  await auth.verifyEmailCode({ email: 'test@example.invalid', otpCode: '123456' });
  assert(calls[0].url.endsWith('/api/auth/verify-email/resend'));
  assert(calls[1].url.endsWith('/api/auth/verify-email/code'));
  assert.equal(JSON.parse(calls[1].options.body).otpCode, '123456');
  assert(!calls[0].options.headers.Authorization, 'resend must work without a token');
  process.env.NEXT_PUBLIC_API_URL = 'https://backend.example.invalid';
  const proxy = load('src/app/api/auth/[...segments]/route.ts');
  global.fetch = async () => new Response(JSON.stringify({ code: 'RATE_LIMITED' }), { status: 429, headers: { 'content-type': 'application/problem+json', 'retry-after': '37' } });
  const forwarded = await proxy.POST({ method: 'POST', headers: new Headers(), nextUrl: new URL('http://localhost/api/auth/login'), arrayBuffer: async () => new ArrayBuffer(0) }, { params: Promise.resolve({ segments: ['login'] }) });
  assert.equal(forwarded.status, 429);
  assert.equal(forwarded.headers.get('retry-after'), '37');
  assert.equal((await forwarded.json()).code, 'RATE_LIMITED');
  assert.equal(new ApiError(400, 'კოდი არასწორია ან ვადა გასულია.').message, 'კოდი არასწორია ან ვადა გასულია.');
  console.log('PASS: password boundaries and all six entry points; problem+json/Retry-After; 429 without retry; uniform login errors; verification payloads.');
})().catch(error => { console.error(error); process.exitCode = 1; });
