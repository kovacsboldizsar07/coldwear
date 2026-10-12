import { consentExpiry } from './commerce';
export type Consent = { statistics:boolean; marketing:boolean; expires:number };
let consent:Consent|null=null;
let sessionId='', visitorId:string|null=null, angle='default';
let source:Record<string,string>={};
const names=['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','ttclid'];
function safeGet(key:string){try{return localStorage.getItem(key)}catch{return null}}
function safeSet(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* storage unavailable */}}
export function currentConsent(){return consent}
export function initializeTracking(){
 sessionId=crypto.randomUUID();
 try { const saved=JSON.parse(safeGet('cw_consent')||'null') as Consent|null; if(saved&&saved.expires>Date.now())consent=saved; }catch{/* invalid stored consent */}
 const params=new URLSearchParams(location.search); angle=params.get('angle')==='bike'?'bike':'default';
 names.forEach(name=>{source[name]=params.get(name)||''});
 applyConsent(); track('PageView');
 return consent;
}
function applyConsent(){
 if(consent?.marketing){
 visitorId=safeGet('cw_visitor')||crypto.randomUUID();safeSet('cw_visitor',visitorId);
 const saved=safeGet('cw_session'); if(saved)try {const s=JSON.parse(saved);if(s.expires>Date.now()){sessionId=s.id;source={...s.source,...Object.fromEntries(Object.entries(source).filter(([,v])=>v))};if(!new URLSearchParams(location.search).has('angle'))angle=s.angle;}}catch{/* invalid session */}
 safeSet('cw_session',JSON.stringify({id:sessionId,angle,source,expires:Date.now()+30*60*1000}));
 } else {visitorId=null;try{localStorage.removeItem('cw_visitor');localStorage.removeItem('cw_session')}catch{/* no storage */}}
}
export function saveConsent(statistics:boolean,marketing:boolean){consent={statistics,marketing,expires:consentExpiry(new Date())};safeSet('cw_consent',JSON.stringify(consent));applyConsent();window.dispatchEvent(new Event('cw-consent'));}
export function cartAttributes(){return [...names.map(n=>({key:`cw_${n}`,value:consent?.marketing?source[n]||'':''})),{key:'cw_angle',value:angle},{key:'cw_consent',value:consent?.marketing?'1':'0'},{key:'cw_fbp',value:consent?.marketing?cookie('_fbp'):''},{key:'cw_fbc',value:consent?.marketing?(cookie('_fbc')||(source.fbclid?`fb.1.${Date.now()}.${source.fbclid}`:'')):''}];}
function cookie(name:string){return document.cookie.split('; ').find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)||''}
export function track(event_name:string,event_data:Record<string,unknown>={}){
 if(!sessionId||typeof navigator==='undefined')return;
 const event_id=crypto.randomUUID();
 const payload={session_id:sessionId,visitor_id:visitorId,event_name,event_id,page_path:location.pathname,event_data,angle,consent_level:consent?.marketing?'marketing':consent?.statistics?'statistics':'necessary',source:consent?.marketing?source:{}};
 navigator.sendBeacon('/api/public/collect',new Blob([JSON.stringify(payload)],{type:'application/json'}));
 const pixel=(window as unknown as {fbq?:(...args:unknown[])=>void}).fbq;
 if(consent?.marketing&&pixel&&['PageView','ViewContent','AddToCart','InitiateCheckout'].includes(event_name))pixel('track',event_name,event_data,{eventID:event_id});
}
export function observeBlocks(){
 const seen=new Map<string,{start:number;time:number;scroll:number}>();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const id=entry.target.id; const item=seen.get(id)||{start:0,time:0,scroll:0};
  if(entry.isIntersecting){item.start=performance.now();item.scroll=Math.max(item.scroll,Math.round(entry.intersectionRatio*100));if(id==='features')track('ViewContent');}
  else if(item.start){item.time+=(performance.now()-item.start)/1000;item.start=0;}
  seen.set(id,item);
 }),{threshold:[0,.25,.5,.75,1]});
 ['hero','problem','features','socks','size_chart','bundle_selector','faq'].forEach(id=>{const e=document.getElementById(id);if(e)observer.observe(e)});
 const flush=()=>{seen.forEach((item,id)=>track('block_view',{block_id:id,time_spent_sec:Math.round(item.time+(item.start?(performance.now()-item.start)/1000:0)),max_scroll_pct:item.scroll}));};
 const visibility=()=>{if(document.visibilityState==='hidden')flush()};
 document.addEventListener('visibilitychange',visibility);
 return ()=>{flush();observer.disconnect();document.removeEventListener('visibilitychange',visibility)};
}
