// Real provider state/effects with synthetic cart/quote adapters.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
let slots=[],cursor=0,dirty=false,effects=[],calls=[];
const storage=new Map([['athomeCouponCode','LAST']]);
const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
const hooks={
  createContext:()=>({Provider:'provider'}),useContext(){},
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>{const next=typeof v==='function'?v(slots[i]):v;if(!Object.is(next,slots[i])){slots[i]=next;dirty=true;}}];},
  useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},
  useCallback(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={fn,deps};return slots[i].fn;},
  useMemo(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={value:fn(),deps};return slots[i].value;},
  useEffect(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){slots[i]={deps};effects.push(fn);}},
};
const cart={items:[{productId:1,quantity:1}]};
const req=name=>{
  if(name==='react')return hooks;
  if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props})};
  if(name.includes('CommerceContext'))return{useCommerce:()=>({cart})};
  if(name.includes('auth/tokens'))return{getStoredAuthTokens:()=>null};
  if(name.includes('api/cartQuote'))return{getCartQuote:async payload=>{calls.push(payload);return{total:payload.couponCode?90:100,coupon:payload.couponCode?{applied:true}:null};}};
  throw Error(name);
};
const source=ts.transpileModule(fs.readFileSync('src/contexts/CartQuoteContext.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const mod={exports:{}};
vm.runInNewContext(source,{exports:mod.exports,require:req,window:{requestIdleCallback:cb=>{cb();return 1;},cancelIdleCallback(){}},sessionStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
let value;
async function flush(){for(let i=0;i<20;i++){dirty=false;cursor=0;value=mod.exports.CartQuoteProvider({children:null}).props.value;for(const effect of effects.splice(0))effect();await new Promise(resolve=>setImmediate(resolve));if(!dirty&&!effects.length)return;}throw Error('provider did not settle');}
(async()=>{
 await flush();assert.equal(value.quote.total,90);assert.equal(calls.length,1);
 value.clearCoupon();await flush();assert.equal(value.couponCode,'');assert.equal(storage.has('athomeCouponCode'),false);
 assert.equal(calls.length,2,'one fresh request after clearing');assert.equal(calls[1].couponCode,undefined);assert.equal(value.quote.total,100);
 assert.equal(value.loading,false);
 console.log('PASS: clearing exhausted coupon removes stored/input code and makes exactly one fresh quote at the corrected total.');
})().catch(error=>{console.error(error);process.exitCode=1;});
