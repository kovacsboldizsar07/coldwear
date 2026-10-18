import { consentExpiry } from './commerce';
import { telemetryConfig } from './telemetry.functions';
import { grantMarketing, withdrawMarketing } from './marketing.functions';
import { MARKETING_NOTICE_VERSION } from './marketing-rules';
let collectToken='',pixelId='';
let pending:{name:string;data:Record<string,unknown>}[]=[];
let pixelLoaded=false;
function loadPixel(){
 if(!consent?.marketing||!pixelId)return;if(pixelLoaded){const w=window as unknown as {fbq?:(...args:unknown[])=>void};w.fbq?.('consent','grant');return;}
 pixelLoaded=true;
 const w=window as unknown as {fbq?:((...args:unknown[])=>void)&{queue:unknown[][];loaded:boolean;version:string;callMethod:((...args:unknown[])=>void)|undefined}};
 const fbq=Object.assign((...args:unknown[])=>{if(fbq.callMethod)fbq.callMethod(...args);else fbq.queue.push(args)}, {queue:[] as unknown[][],loaded:true,version:'2.0',callMethod:undefined as ((...args:unknown[])=>void)|undefined});w.fbq=fbq;
 fbq('init',pixelId);const script=document.createElement('script');script.src='https://connect.facebook.net/en_US/fbevents.js';script.async=true;document.head.appendChild(script);
}

export type Consent = { statistics:boolean; marketing:boolean; expires:number; receipt?:string };
let withdrawal:Promise<void>=Promise.resolve();
function expiredConsent(){if(consent&&consent.expires<=Date.now()){saveConsent(consent.statistics,false);}}
let consent:Consent|null=null;
let sessionId='', visitorId:string|null=null, angle='default';
let source:Record<string,string>={};
const names=['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','ttclid'];
function safeGet(key:string){try{return localStorage.getItem(key)}catch{return null}}
function safeSet(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* storage unavailable */}}
export function currentConsent(){expiredConsent();return consent}
export function initializeTracking(){
 sessionId=crypto.randomUUID();
 try { const saved=JSON.parse(safeGet('cw_consent')||'null') as Consent|null; if(saved&&saved.expires>Date.now())consent={...saved,marketing:Boolean(saved.marketing&&saved.receipt)}; }catch{/* invalid stored consent */}
 const params=new URLSearchParams(location.search); angle=params.get('angle')==='bike'?'bike':'default';
 names.forEach(name=>{source[name]=params.get(name)||''});
 applyConsent();void flushWithdrawals().catch(()=>{});
 window.addEventListener('storage',e=>{if(e.key==='cw_consent'){const saved=JSON.parse(safeGet('cw_consent')||'null') as Consent|null;consent=saved&&saved.expires>Date.now()?saved:null;pending=[];applyConsent();window.dispatchEvent(new Event('cw-consent'));}});
 window.addEventListener('online',()=>{void flushWithdrawals()});
 void telemetryConfig().then(config=>{collectToken=config.token;pixelId=config.pixelId;loadPixel();const events=pending;pending=[];events.forEach(e=>track(e.name,e.data));}).catch(()=>{pending=[];}); track('PageView');
 return consent;
}
function applyConsent(){
 if(consent?.marketing){
 visitorId=safeGet('cw_visitor')||crypto.randomUUID();safeSet('cw_visitor',visitorId);
 const saved=safeGet('cw_session'); if(saved)try {const s=JSON.parse(saved);if(s.expires>Date.now()){sessionId=s.id;source={...s.source,...Object.fromEntries(Object.entries(source).filter(([,v])=>v))};if(!new URLSearchParams(location.search).has('angle'))angle=s.angle;}}catch{/* invalid session */}
 safeSet('cw_session',JSON.stringify({id:sessionId,angle,source,expires:Date.now()+30*60*1000}));
 loadPixel();
 } else {pending=[];if(pixelLoaded){const w=window as unknown as {fbq?:(...args:unknown[])=>void};w.fbq?.('consent','revoke');}visitorId=null;try{localStorage.removeItem('cw_visitor');localStorage.removeItem('cw_session')}catch{/* no storage */}}
}
function clearMarketingCookies(){
 for(const name of ['_fbp','_fbc']){document.cookie=`${name}=; Max-Age=0; path=/`;const labels=location.hostname.split('.');for(let i=0;i<labels.length-1;i++)document.cookie=`${name}=; Max-Age=0; path=/; domain=.${labels.slice(i).join('.')}`;}
}
async function flushWithdrawals(){
 const receipts=JSON.parse(safeGet('cw_withdrawals')||'[]') as string[];
 for(const receipt of receipts){await withdrawMarketing({data:receipt});const remaining=(JSON.parse(safeGet('cw_withdrawals')||'[]') as string[]).filter(r=>r!==receipt);safeSet('cw_withdrawals',JSON.stringify(remaining));}
}
export async function saveConsent(statistics:boolean,marketing:boolean){
 const previous=consent;
 if(!marketing){
  consent={statistics,marketing:false,expires:consentExpiry(new Date())};safeSet('cw_consent',JSON.stringify(consent));pending=[];applyConsent();clearMarketingCookies();window.dispatchEvent(new Event('cw-consent'));
  if(previous?.receipt){const receipts=JSON.parse(safeGet('cw_withdrawals')||'[]') as string[];safeSet('cw_withdrawals',JSON.stringify([...new Set([...receipts,previous.receipt])]));}
  withdrawal=flushWithdrawals();await withdrawal;
 }else{
  await flushWithdrawals();
  const id=safeGet('cw_visitor')||crypto.randomUUID();
  const granted=await grantMarketing({data:{visitorId:id,noticeVersion:MARKETING_NOTICE_VERSION}});
  consent={statistics,marketing:true,expires:granted.expires,receipt:granted.receipt};safeSet('cw_visitor',id);safeSet('cw_consent',JSON.stringify(consent));applyConsent();window.dispatchEvent(new Event('cw-consent'));
 }
}
export async function waitForConsentSync(){await withdrawal;await flushWithdrawals();}
export function cartAttributes(){expiredConsent();return [...names.map(n=>({key:`cw_${n}`,value:consent?.marketing?source[n]||'':''})),{key:'cw_angle',value:angle},{key:'cw_permission',value:consent?.marketing?consent.receipt||'':''},{key:'cw_consent',value:consent?.marketing?'1':'0'},{key:'cw_fbp',value:consent?.marketing?cookie('_fbp'):''},{key:'cw_fbc',value:consent?.marketing?(cookie('_fbc')||(source['fbclid']?`fb.1.${Date.now()}.${source['fbclid']}`:'')):''}];}
function cookie(name:string){return document.cookie.split('; ').find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)||''}
export function track(event_name:string,event_data:Record<string,unknown>={}){
 if(!sessionId||typeof navigator==='undefined')return;expiredConsent();
 if(!consent?.marketing&&!consent?.statistics)return;
 if(!collectToken){if(pending.length<100)pending.push({name:event_name,data:event_data});return;}
 const event_id=crypto.randomUUID();
 const payload={token:collectToken,permission:consent?.marketing?consent.receipt:undefined,session_id:sessionId,visitor_id:visitorId,event_name,event_id,page_path:location.pathname,event_data,angle,consent_level:consent?.marketing?'marketing':consent?.statistics?'statistics':'necessary',source:consent?.marketing?source:{}};
 navigator.sendBeacon('/api/public/collect',new Blob([JSON.stringify(payload)],{type:'application/json'}));
 const pixel=(window as unknown as {fbq?:(...args:unknown[])=>void}).fbq;
 if(consent?.marketing&&pixel&&['PageView','ViewContent','AddToCart','InitiateCheckout'].includes(event_name))pixel('track',event_name,event_data,{eventID:event_id});
}
export function observeBlocks(){
 const seen=new Map<string,{start:number;time:number;scroll:number}>();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const id=entry.target.id; const item=seen.get(id)||{start:0,time:0,scroll:0};
  if(entry.isIntersecting){if(!item.start)item.start=performance.now();item.scroll=Math.max(item.scroll,Math.round(entry.intersectionRatio*100));if(id==='features')track('ViewContent');}
  else if(item.start){item.time+=(performance.now()-item.start)/1000;item.start=0;}
  seen.set(id,item);
 }),{threshold:[0,.25,.5,.75,1]});
 ['hero','problem','features','socks','size_chart','bundle_selector','faq'].forEach(id=>{const e=document.getElementById(id);if(e)observer.observe(e)});
 const flush=()=>{seen.forEach((item,id)=>track('block_view',{block_id:id,time_spent_sec:Math.round(item.time+(item.start?(performance.now()-item.start)/1000:0)),max_scroll_pct:item.scroll}));};
 const visibility=()=>{if(document.visibilityState==='hidden')flush()};
 document.addEventListener('visibilitychange',visibility);
 return ()=>{flush();observer.disconnect();document.removeEventListener('visibilitychange',visibility)};
}
