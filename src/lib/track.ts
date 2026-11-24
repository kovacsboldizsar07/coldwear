import { consentExpiry } from './commerce';
import { telemetryConfig } from './telemetry.functions';
import { checkMarketing, grantMarketing, withdrawMarketing } from './marketing.functions';
import { MARKETING_NOTICE_VERSION } from './marketing-rules';
import { clearShopifyCookies, sendShopifyEvent, setShopifyShopId, shopifyTrackingTokens, type ShopifyExtra } from './shopify-analytics';
type Queued={name:string;data:Record<string,unknown>;path:string;extra?:ShopifyExtra|undefined};
let collectToken='',pixelId='';
let pending:Queued[]=[];
let pixelLoaded=false;
function loadPixel(){
 expiredConsent();if(!consent?.marketing||!consent.receipt||!pixelId)return;if(pixelLoaded){const w=window as unknown as {fbq?:(...args:unknown[])=>void};w.fbq?.('consent','grant');return;}
 pixelLoaded=true;
 // Meta's official base-code stub: a classic function that queues the raw arguments until fbevents.js takes over via callMethod.
 type Fbq=((...args:unknown[])=>void)&{callMethod?:(...args:unknown[])=>void;queue:unknown[];push:unknown;loaded:boolean;version:string};
 const w=window as unknown as {fbq?:Fbq;_fbq?:Fbq};
 if(!w.fbq){
  const n=function(this:unknown,...args:unknown[]){if(n.callMethod)n.callMethod(...args);else n.queue.push(arguments)} as unknown as Fbq; // eslint-disable-line prefer-rest-params
  if(!w._fbq)w._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];w.fbq=n;
  const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(script);
 }
 w.fbq('consent','grant');w.fbq('init',pixelId);
}
// Events raised before the visitor made any cookie choice. Nothing leaves the browser until a choice is saved; on acceptance they are
// replayed (so the landing PageView/ViewContent of a first visit is not lost), on refusal they are discarded.
let preConsent:Queued[]=[];
const viewContentSent=new Set<string>();
let clickTime=Date.now();
export type Consent = { statistics:boolean; marketing:boolean; expires:number; receipt?:string };
let withdrawal:Promise<void>=Promise.resolve();
let consentRevision=0;
function expiredConsent(){if(consent&&consent.expires<=Date.now()){void saveConsent(false,false).catch(()=>{});}}
let consent:Consent|null=null;
let sessionId='', visitorId:string|null=null, angle='default';
let source:Record<string,string>={};
const names=['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','ttclid'];
function safeGet(key:string){try{return localStorage.getItem(key)}catch{return null}}
function safeSet(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* storage unavailable */}}
export function currentConsent(){expiredConsent();return consent}
export function initializeTracking(){
 sessionId=crypto.randomUUID();
 try { const saved=JSON.parse(safeGet('cw_consent')||'null') as Consent|null; if(saved&&saved.expires>Date.now())consent={...saved,marketing:Boolean(saved.marketing&&saved.receipt)};else if(saved?.receipt){const receipts=JSON.parse(safeGet('cw_withdrawals')||'[]') as string[];safeSet('cw_withdrawals',JSON.stringify([...new Set([...receipts,saved.receipt])])) ;clearMarketingCookies();} }catch{/* invalid stored consent */}
 const params=new URLSearchParams(location.search); angle=params.get('angle')==='bike'?'bike':'default';
 names.forEach(name=>{source[name]=params.get(name)||''});
 applyConsent();void flushWithdrawals().catch(()=>{});
 window.addEventListener('storage',e=>{if(e.key==='cw_consent'){consentRevision++;try{const saved=JSON.parse(safeGet('cw_consent')||'null') as Consent|null;consent=saved&&saved.expires>Date.now()?{...saved,marketing:Boolean(saved.marketing&&saved.receipt)}:null;}catch{consent=null;}pending=[];applyConsent();if(!consent?.marketing)clearMarketingCookies();window.dispatchEvent(new Event('cw-consent'));}});
 window.addEventListener('online',()=>{void flushWithdrawals().catch(()=>{})});
 // A stored marketing choice is only trusted once the server confirms its receipt (a choice saved by the old site, or revoked
 // server-side, is not). Until then nothing is sent and the pixel stays unloaded; an unconfirmed choice re-opens the cookie banner.
 const stored=consent?.marketing&&consent.receipt?consent.receipt:'';
 const permissionCheck=stored?checkMarketing({data:stored}).then(r=>r.valid).catch(()=>true):Promise.resolve(true);
 void Promise.all([telemetryConfig(),permissionCheck]).then(([config,valid])=>{if(!valid&&consent?.receipt===stored)dropUnconfirmedConsent();collectToken=config.token;pixelId=config.pixelId;setShopifyShopId(config.shopId||'');loadPixel();const events=pending;pending=[];events.forEach(e=>send(e.name,e.data,e.path,e.extra));}).catch(()=>{pending=[];}); track('PageView');
 return consent;
}
function dropUnconfirmedConsent(){
 preConsent=pending.slice(0,50);consent=null;consentRevision++;
 try{localStorage.removeItem('cw_consent')}catch{/* no storage */}
 applyConsent();clearMarketingCookies();window.dispatchEvent(new Event('cw-consent'));
}
function applyConsent(){
 if(consent?.marketing){
 visitorId=safeGet('cw_visitor')||crypto.randomUUID();safeSet('cw_visitor',visitorId);
 const saved=safeGet('cw_session'); if(saved)try {const s=JSON.parse(saved);if(s.expires>Date.now()){sessionId=s.id;const freshClick=Boolean(source['fbclid']);source={...s.source,...Object.fromEntries(Object.entries(source).filter(([,v])=>v))};if(!freshClick&&typeof s.clickTime==='number')clickTime=s.clickTime;if(!new URLSearchParams(location.search).has('angle'))angle=s.angle;}}catch{/* invalid session */}
 safeSet('cw_session',JSON.stringify({id:sessionId,angle,source,clickTime,expires:Date.now()+30*60*1000}));
 loadPixel();
 } else {pending=[];if(pixelLoaded){const w=window as unknown as {fbq?:(...args:unknown[])=>void};w.fbq?.('consent','revoke');}visitorId=null;try{localStorage.removeItem('cw_visitor');localStorage.removeItem('cw_session')}catch{/* no storage */}}
 if(!consent?.marketing&&!consent?.statistics)clearShopifyCookies();
 if(consent){const queued=preConsent;preConsent=[];if(consent.marketing||consent.statistics)queued.forEach(e=>send(e.name,e.data,e.path,e.extra));}
}
function clearMarketingCookies(){
 for(const name of ['_fbp','_fbc']){document.cookie=`${name}=; Max-Age=0; path=/`;const labels=location.hostname.split('.');for(let i=0;i<labels.length-1;i++)document.cookie=`${name}=; Max-Age=0; path=/; domain=.${labels.slice(i).join('.')}`;}
}
async function flushWithdrawals(){
 const receipts=JSON.parse(safeGet('cw_withdrawals')||'[]') as string[];
 for(const receipt of receipts){await withdrawMarketing({data:receipt});const remaining=(JSON.parse(safeGet('cw_withdrawals')||'[]') as string[]).filter(r=>r!==receipt);safeSet('cw_withdrawals',JSON.stringify(remaining));}
}
export async function saveConsent(statistics:boolean,marketing:boolean){
 const revision=++consentRevision;
 const previous=consent;
 if(!marketing){
  consent={statistics,marketing:false,expires:consentExpiry(new Date())};safeSet('cw_consent',JSON.stringify(consent));pending=[];applyConsent();clearMarketingCookies();
  if(previous?.receipt){const receipts=JSON.parse(safeGet('cw_withdrawals')||'[]') as string[];safeSet('cw_withdrawals',JSON.stringify([...new Set([...receipts,previous.receipt])]));}
  withdrawal=flushWithdrawals();window.dispatchEvent(new Event('cw-consent'));await withdrawal;
 }else{
  await flushWithdrawals();
  const id=safeGet('cw_visitor')||crypto.randomUUID();
  const granted=await grantMarketing({data:{visitorId:id,noticeVersion:MARKETING_NOTICE_VERSION}});
  if(revision!==consentRevision){const receipts=JSON.parse(safeGet('cw_withdrawals')||'[]') as string[];safeSet('cw_withdrawals',JSON.stringify([...new Set([...receipts,granted.receipt])]));await flushWithdrawals();return;}
  consent={statistics,marketing:true,expires:granted.expires,receipt:granted.receipt};safeSet('cw_visitor',id);safeSet('cw_consent',JSON.stringify(consent));applyConsent();window.dispatchEvent(new Event('cw-consent'));
 }
}
export async function waitForConsentSync(){await flushWithdrawals();withdrawal=Promise.resolve();}
export function cartAttributes(){expiredConsent();return [...names.map(n=>({key:`cw_${n}`,value:consent?.marketing?source[n]||'':''})),{key:'cw_angle',value:angle},{key:'cw_permission',value:consent?.marketing?consent.receipt||'':''},{key:'cw_consent',value:consent?.marketing?'1':'0'},{key:'cw_fbp',value:consent?.marketing?cookie('_fbp'):''},{key:'cw_fbc',value:consent?.marketing?fbc():''}];}
// Meta click ID: the pixel's own _fbc cookie, or one built from the landing fbclid with a stable click time.
function fbc(){return cookie('_fbc')||(source['fbclid']?`fb.1.${clickTime}.${source['fbclid']}`:'')}
function cookie(name:string){return document.cookie.split('; ').find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)||''}
/** Shopify visit tokens for cart requests (links the checkout to the visit in Shopify Analytics); none without consent. */
export function shopifyTokens(){expiredConsent();return shopifyTrackingTokens(consent)}
export function track(event_name:string,event_data:Record<string,unknown>={},extra?:ShopifyExtra){
 if(!sessionId||typeof navigator==='undefined')return;expiredConsent();
 const path=location.pathname;
 if(event_name==='ViewContent'){if(viewContentSent.has(path))return;viewContentSent.add(path);}
 if(!consent){if(preConsent.length<50)preConsent.push({name:event_name,data:event_data,path,extra});return;}
 send(event_name,event_data,path,extra);
}
function send(event_name:string,event_data:Record<string,unknown>,page_path:string,extra?:ShopifyExtra){
 if(!consent?.marketing&&!consent?.statistics)return;
 if(!collectToken){if(pending.length<100)pending.push({name:event_name,data:event_data,path:page_path,extra});return;}
 const event_id=crypto.randomUUID();
 const marketing=Boolean(consent?.marketing);
 const payload={token:collectToken,permission:marketing?consent?.receipt:undefined,session_id:sessionId,visitor_id:visitorId,event_name,event_id,page_path,event_data,angle,consent_level:marketing?'marketing':consent?.statistics?'statistics':'necessary',source:marketing?source:{},fbp:marketing?cookie('_fbp')||undefined:undefined,fbc:marketing?fbc()||undefined:undefined};
 navigator.sendBeacon('/api/public/collect',new Blob([JSON.stringify(payload)],{type:'application/json'}));
 const pixel=(window as unknown as {fbq?:(...args:unknown[])=>void}).fbq;
 if(marketing&&pixel&&['PageView','ViewContent','AddToCart','InitiateCheckout'].includes(event_name))pixel('track',event_name,event_data,{eventID:event_id});
 sendShopifyEvent(event_name,page_path,{statistics:Boolean(consent?.statistics),marketing},extra);
}
export function observeBlocks(viewContent?:()=>Record<string,unknown>,viewProducts?:()=>ShopifyExtra['products']){
 const seen=new Map<string,{start:number;time:number;scroll:number}>();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const id=entry.target.id; const item=seen.get(id)||{start:0,time:0,scroll:0};
  if(entry.isIntersecting){if(!item.start)item.start=performance.now();item.scroll=Math.max(item.scroll,Math.round(entry.intersectionRatio*100));if(id==='features')track('ViewContent',viewContent?.()??{},{products:viewProducts?.()});}
  else if(item.start){item.time+=(performance.now()-item.start)/1000;item.start=0;}
  seen.set(id,item);
 }),{threshold:[0,.25,.5,.75,1]});
 ['hero','problem','features','socks','size_chart','bundle_selector','faq'].forEach(id=>{const e=document.getElementById(id);if(e)observer.observe(e)});
 const flush=()=>{seen.forEach((item,id)=>track('block_view',{block_id:id,time_spent_sec:Math.round(item.time+(item.start?(performance.now()-item.start)/1000:0)),max_scroll_pct:item.scroll}));};
 const visibility=()=>{if(document.visibilityState==='hidden')flush()};
 document.addEventListener('visibilitychange',visibility);
 return ()=>{flush();observer.disconnect();document.removeEventListener('visibilitychange',visibility)};
}
