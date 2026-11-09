// Exercise the actual checkout handler with synthetic API failures; no orders are created.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
async function scenario(code) {
  let state=[],cursor=0,cleared=0,refreshed=0,redirects=0,couponError;
  class ApiError extends Error {constructor(){super(code==='COUPON_EXHAUSTED'?'ამ კუპონის გამოყენების ლიმიტი ამოიწურა.':'ფასდაკლების ლიმიტი ამოიწურა.');this.details={code};}}
  const React={useEffect(){},useCallback:f=>f,useState:initial=>{const i=cursor++;if(!(i in state))state[i]=i===0?4:initial;return[state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];}};
  const jsx=(type,props)=>({type,props});
  const quote={quote:{coupon:{applied:true},total:90},couponCode:'LAST',loading:false,clearCoupon(){cleared++;},refreshQuote:async()=>{refreshed++;},setCouponError:v=>{couponError=v;},setCustomerEmail(){},setDeliverySelection(){}};
  const componentNames=new Map();
  const req=name=>{
    if(name==='react')return React;if(name==='react/jsx-runtime')return{jsx,jsxs:jsx,Fragment:'fragment'};
    if(name==='next/navigation')return{useRouter:()=>({push(){redirects++;}})};
    if(name.includes('CommerceContext'))return{useCommerce:()=>({cart:{items:[{productId:1,quantity:1}],totalPrice:100},clearCart:async()=>{throw Error('must not clear cart');}})};
    if(name.includes('ToastContext'))return{useToast:()=>({showToast(){}})};
    if(name.includes('CartQuoteContext'))return{useCartQuote:()=>quote};
    if(name.includes('useStorefrontLocale'))return{useStorefrontLocale:()=> 'ka'};
    if(name.endsWith('api/client'))return{ApiError};
    if(name.endsWith('api/checkout'))return{submitCheckout:async()=>{throw new ApiError();}};
    if(name.endsWith('api/orders'))return{retryOrderPayment:async()=>{throw Error('must not initiate payment');}};
    if(name.includes('stockShortfall'))return{};
    if(name.endsWith('.scss'))return{};
    componentNames.set(name,name);return{__esModule:true,default:name};
  };
  const mod={exports:{}};
  const source=ts.transpileModule(fs.readFileSync('src/components/checkout/CheckoutWizard.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{exports:mod.exports,require:req,Error,window:{location:{set href(v){redirects++;}}}});
  function render(){cursor=0;return mod.exports.default({});}
  function walk(n){if(!n||typeof n!=='object')return[];if(Array.isArray(n))return n.flatMap(walk);return[n,...walk(n.props?.children)];}
  let payment=walk(render()).find(n=>n.type==='./Step4Payment');assert(payment);
  await payment.props.onNext({method:'card',bank:'tbc'});
  payment=walk(render()).find(n=>n.type==='./Step4Payment');assert(payment,'must remain on payment selection');
  assert(payment.props.error.includes('ამოიწურა'));assert.equal(redirects,0);
  if(code==='COUPON_EXHAUSTED'){assert.equal(cleared,1);assert(couponError);assert.equal(refreshed,0,'context effect refreshes once after clearing coupon');}
  else{assert.equal(cleared,0);assert.equal(refreshed,1);}
  quote.loading=true;assert(walk(render()).find(n=>n.type==='./Step4Payment').props.submitting,'new checkout must wait for the fresh quote');
}
(async()=>{await scenario('COUPON_EXHAUSTED');await scenario('PROMOTION_EXHAUSTED');console.log('PASS: exhausted coupon clears; exhausted promotion refreshes; message retained; no payment redirect or cart clear; checkout waits for quote.');})().catch(error=>{console.error(error);process.exitCode=1;});
