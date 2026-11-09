const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const storage = new Map();
const localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
const cache = new Map();
function load(file) {
  file=path.resolve(file); if(cache.has(file))return cache.get(file);
  const mod={exports:{}};
  const req = name => name.includes('i18n/locale') ? {getBrowserLocale:()=> 'en'}
    : name.includes('profilePreferences') ? {storeProfileGender(){},storeProfileAvatar(){}}
    : load(name.startsWith('@/') ? 'src/'+name.slice(2)+'.ts' : path.resolve(path.dirname(file), name+'.ts'));
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{exports:mod.exports,require:req,window:{location:{origin:'http://localhost:3000'},dispatchEvent(){}},localStorage,Event,atob,process,URL,Date,fetch:(...args)=>global.fetch(...args)});
  cache.set(file,mod.exports);return mod.exports;
}
(async()=>{
  const tokens=load('src/lib/auth/tokens.ts');
  storage.set('athome.accessToken','synthetic-access');storage.set('athome.refreshToken','synthetic-legacy');
  storage.set('athome.accessTokenExpiresAt',new Date(Date.now()+3600000).toISOString());
  assert.equal(tokens.shouldRefreshAccessToken(),true,'old sessions migrate immediately even before access-token expiry');
  assert(tokens.getStoredAuthTokens().accessToken);
  assert.equal(tokens.getStoredAuthTokens().refreshToken,undefined);
  assert.equal(tokens.takeLegacyRefreshToken(),'synthetic-legacy');assert.equal(tokens.takeLegacyRefreshToken(),null);assert.equal(tokens.shouldRefreshAccessToken(),false);
  storage.set('athome.refreshToken','synthetic-legacy');
  const auth=load('src/lib/api/auth.ts');let calls=[];let release;
  global.fetch=(url,opts)=>{calls.push({url,opts});return new Promise(resolve=>{release=()=>resolve(Response.json({accessToken:'synthetic-new-access'}));});};
  const first=auth.refreshToken(),second=auth.refreshToken();
  assert.equal(first,second,'concurrent refreshes must share a single rotation');assert.equal(calls.length,1);
  assert.equal(storage.get('athome.refreshToken'),undefined,'migration removes token before sending');
  assert.equal(JSON.parse(calls[0].opts.body).refreshToken,'synthetic-legacy');assert.equal(calls[0].opts.headers['X-Athome-Refresh'],'1');
  release();await first;
  assert.equal(storage.get('athome.accessToken'),'synthetic-new-access');assert.equal(storage.get('athome.refreshToken'),undefined);
  global.fetch=async(url,opts)=>{calls.push({url,opts});return Response.json({accessToken:'synthetic-refreshed'});};
  await auth.refreshToken();assert.equal(Object.keys(JSON.parse(calls.at(-1).opts.body)).length,0);
  await auth.login({email:'test@example.invalid',password:'synthetic-password'});assert.equal(storage.get('athome.accessToken'),'synthetic-refreshed','access-only login persists');
  tokens.clearAuthTokens();assert.equal(tokens.getStoredAuthTokens(),null);
  await auth.logout();assert(calls.at(-1).url.endsWith('/api/auth/logout'),'logout must contact proxy even without an access token');
  assert.equal(Object.keys(JSON.parse(calls.at(-1).opts.body)).length,0);
  console.log('PASS: access-only sessions; one-time legacy removal; concurrent refresh sharing; cookie-only refresh; logout without access token.');
})().catch(error=>{console.error(error);process.exitCode=1;});
