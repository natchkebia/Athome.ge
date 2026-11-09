// Component state tests use a local API stub; no email is sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function harness({ initialCodeSent = false, send = async () => {}, verify = async () => {} } = {}) {
  let state = [], cursor = 0, verified = 0, sent = 0, registrationEmail;
  const useState = initial => {
    const i = cursor++;
    if (!(i in state)) state[i] = initial;
    return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }];
  };
  const jsx = (type, props) => ({ type, props });
  const mod = { exports: {} };
  class ApiError extends Error { constructor(status, retryAfter) { super('Too many attempts'); this.status = status; this.retryAfter = retryAfter; } }
  const requireMock = name => {
    if (name === 'react') return { useState, useEffect() {} };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name.endsWith('/api/auth')) return { resendEmailVerification: async email => { sent++; return send(email); }, verifyEmailCode: verify };
    if (name.endsWith('/api/client')) return { ApiError };
    if (name.endsWith('.scss')) return {};
    throw new Error(name);
  };
  const code = ts.transpileModule(fs.readFileSync('src/components/auth/EmailVerification.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports: mod.exports, require: requireMock, Error });
  let tree;
  function render() { cursor = 0; tree = mod.exports.default({ initialEmail: 'test@example.invalid', initialCodeSent, en: true, onVerified: () => verified++, onBack() {}, onRegister: email => { registrationEmail = email; } }); }
  function nodes(node) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(nodes);
    return [node, ...nodes(node.props?.children)];
  }
  const find = (type, name) => nodes(tree).find(n => n.type === type && (!name || n.props.name === name));
  render();
  return { render, find, nodes: () => nodes(tree), ApiError, sent: () => sent, verified: () => verified, registrationEmail: () => registrationEmail };
}
(async () => {
  let release;
  const h = harness({ send: () => new Promise(resolve => { release = resolve; }) });
  assert(!h.find('input', 'verificationCode'), 'direct entry must not ask for an unsent code');
  const registerButton = h.nodes().find(n => n.type === 'button' && n.props.children === 'Create an account');
  assert(registerButton, 'unregistered visitors need a registration route');
  registerButton.props.onClick();
  assert.equal(h.registrationEmail(), 'test@example.invalid');
  const pending = h.find('form').props.onSubmit({ preventDefault() {} });
  h.render();
  assert(!h.find('input', 'verificationCode'), 'pending send must not open code step');
  assert(h.find('button').props.disabled);
  release(); await pending; h.render();
  assert(h.find('input', 'verificationCode'), 'successful send opens code step');
  assert(h.find('input', 'verificationEmail').props.readOnly);
  h.find('input', 'verificationCode').props.onChange({ target: { value: '123456' } }); h.render();
  assert(!h.find('button').props.disabled, 'resend cooldown must not block verification');
  await h.find('form').props.onSubmit({ preventDefault() {} }); h.render();
  assert.equal(h.verified(), 1);
  assert.equal(h.sent(), 1);

  const failed = harness({ send: async () => { throw new Error('Email service unavailable'); } });
  await failed.find('form').props.onSubmit({ preventDefault() {} }); failed.render();
  assert(!failed.find('input', 'verificationCode'), 'send failure must remain at email step');
  assert(failed.nodes().some(n => n.props?.role === 'status' && n.props.children === 'Email service unavailable'));
  assert(!failed.find('button').props.disabled);

  let limited;
  limited = harness({ send: async () => { throw new limited.ApiError(429, 42); } });
  await limited.find('form').props.onSubmit({ preventDefault() {} }); limited.render();
  assert(!limited.find('input', 'verificationCode'));
  assert(limited.find('button').props.disabled, 'rate limit must keep send disabled');
  assert.equal(limited.sent(), 1);

  const registered = harness({ initialCodeSent: true });
  assert(registered.find('input', 'verificationCode'), 'successful registration already requested a code');
  assert.equal(registered.sent(), 0, 'mount must never send an email automatically');
  console.log('PASS: email → send → code; pending/failure/429 remain on email; verification works during resend cooldown; registration entry.');
})().catch(error => { console.error(error); process.exitCode = 1; });
