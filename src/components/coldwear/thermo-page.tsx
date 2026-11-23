import { useEffect,useRef,useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BundleSelector,catalogOptions } from '@/components/coldwear/bundle-selector';
import { SizeChart } from '@/components/coldwear/size-chart';
import { Reviews } from '@/components/coldwear/reviews';
import { Guarantee } from '@/components/coldwear/guarantee';
import { Care } from '@/components/coldwear/care';
import { Water } from '@/components/coldwear/water';
import { Winter } from '@/components/coldwear/winter';
import { ProductFaq } from '@/components/coldwear/faq';
import { dispatchMessage } from '@/lib/dispatch';
import { observeBlocks } from '@/lib/track';
import type { Product } from '@/lib/commerce';
import palm from '@/assets/glove-palm.png';
import zip from '@/assets/glove-zip.png';
import pair from '@/assets/glove-pair.png';
import grip from '@/assets/grip-palm.png';
import zipClose from '@/assets/glove-zip-close.png';
import touch from '@/assets/touchscreen-fingertips.png';
const BENEFITS=['Szélálló külső','Vízlepergető felület','Érintőképes ujjbegy','Csúszásgátló tenyér','Cipzáras csukló','Polár belső'];
export function ThermoProductPage(){
 const [photo,setPhoto]=useState(0),[bike,setBike]=useState(false),[dispatch,setDispatch]=useState(''),[ready,setReady]=useState(false);
 const gloveRef=useRef<Product|undefined>(undefined);
 useEffect(()=>{setReady(true);setBike(new URLSearchParams(location.search).get('angle')==='bike');setDispatch(dispatchMessage(new Date()));const interval=setInterval(()=>setDispatch(dispatchMessage(new Date())),60_000);const cleanup=observeBlocks(()=>{const p=gloveRef.current;const price=p?.variants.nodes[0]?.price;return p?{content_type:'product',content_name:p.title,content_ids:p.variants.nodes.map(v=>v.id.split('/').pop()||v.id),...(price?{value:Number(price.amount),currency:price.currencyCode}:{})}:{content_type:'product',content_name:'ColdWear Thermo kesztyű'}});return()=>{clearInterval(interval);cleanup()}},[]);
 const {data:products=[]}=useQuery({...catalogOptions});
 const glove=ready?products.find(p=>p.title.toLowerCase().includes('kesztyű')):undefined;
 gloveRef.current=glove;
 const sock=ready?products.find(p=>p.title.toLowerCase().includes('zokni')):undefined;
 const photos=glove?.images?.nodes.length?glove.images.nodes.map(n=>({src:n.url,alt:n.altText||glove.title})):[{src:pair,alt:'ColdWear thermo kesztyűpár felülnézetben, cipzáras csukló és csúszásgátló tenyér'},{src:zip,alt:'ColdWear thermo kesztyű felülnézet, cipzáras csukló'},{src:palm,alt:'ColdWear thermo kesztyű elölnézet, csúszásgátló tenyér'}];
 return <>
 <section id="hero" className="py-6 lg:py-9"><div className="cw-container grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-9">
  <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
    <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-surface"><img src={photos[photo]?.src} alt={photos[photo]?.alt} fetchPriority="high" className="h-full w-full object-contain p-4 sm:p-4"/></div>
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{photos.map((p,i)=><button type="button" key={p.src} aria-label={p.alt} aria-pressed={photo===i} onClick={()=>setPhoto(i)} className={`size-16 shrink-0 overflow-hidden sm:size-20 rounded-xl border bg-surface p-1.5 transition-colors ${photo===i?'border-signal ring-1 ring-signal':'border-line hover:border-signal/50'}`}><img src={p.src} alt="" className="h-full w-full object-contain"/></button>)}</div>
  </div>
  <div className="min-w-0">
   <p className="text-sm font-semibold text-signal-text">{dispatch||'Feladás még ma, ha 14:00 előtt rendelsz.'}</p>
   <h1 className="mt-3 text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[40px]">{bike?'ColdWear kesztyű: biciklin sem fúj át rajta a szél':'ColdWear kesztyű: telefonozz benne, ne vedd le'}</h1>
   <div className="mt-5 grid grid-cols-2 gap-2">{BENEFITS.map(b=><span key={b} className="flex items-center gap-2 rounded-full bg-signal-soft px-2.5 py-2 text-xs sm:px-3 sm:text-sm font-semibold"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-signal text-on-signal"><Check size={12} strokeWidth={3}/></span>{b}</span>)}</div>
   <div className="mt-5"><BundleSelector/></div>
   <div className="mt-6 rounded-2xl bg-signal-soft p-4"><p className="font-bold">Vékony, mégis meleg.</p><p className="mt-1.5 text-sm leading-6 text-text-muted">Vezetés közben érzed benne a kormányt. Ha megállsz és csörög a telefon, nem kell levenned. A kötött kesztyűn átfúj a szél, a síkesztyűben semmit nem tudsz csinálni. Ez a kettő között van.</p></div>
   <div className="mt-6"><h2 className="mb-3 text-lg font-bold">Jól működik együtt</h2><div className="flex items-center gap-3 rounded-2xl border border-line bg-signal-soft p-4 sm:gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface sm:size-20">{sock?.images?.nodes[0]?.url?<img src={sock.images.nodes[0].url} alt={sock.images.nodes[0].altText||'ColdWear thermo zokni'} loading="lazy" className="h-full w-full object-cover"/>:<span className="text-center text-[10px] leading-4 text-text-muted">[zokni fotó]</span>}</div><div className="min-w-0 flex-1"><p className="font-extrabold leading-tight">COLDWEAR THERMO ZOKNI</p><p className="mt-1 text-sm leading-5 text-text-muted">Elvezeti a párát, erősített sarok és orr.</p><div className="mt-3 sm:mt-4 sm:text-right"><Button className="h-11 w-full rounded-full font-bold sm:w-auto sm:px-7" onClick={()=>document.getElementById('bundle_selector')?.scrollIntoView({behavior:'smooth'})}>Hozzáadom</Button></div></div></div><p className="mt-2 text-sm text-text-muted">3 kesztyű mellé 1 zokni ajándék.</p></div>
  </div>
 </div></section>
 <section id="features" className="bg-surface py-8 lg:py-10"><div className="cw-container"><h2 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Arra készült, amit naponta csinálsz.</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[{t:'Érintőképes ujjbegyek',b:'A [hüvelyk- és mutatóujj] hegye vezeti a kijelzőt, nem kell levenned.',img:touch,alt:'Fekete téli kesztyűt viselő kéz okostelefont tart, az érintőképes ujjbegy közelről'},{t:'Csúszásgátló tenyér',b:'Szilikon minta az egész tenyéren: a telefon nem csúszik ki, a kormányt stabilan fogod.',img:grip,alt:'ColdWear thermo kesztyű csúszásgátló tenyér közeli fotó, szilikon mintázattal'},{t:'Cipzáras csukló',b:'Széthúzod, könnyen belebújsz, összehúzod, és szorosan ül.',img:zipClose,alt:'ColdWear thermo kesztyű cipzáras csukló közeli fotó, kihúzott cipzárral'}].map(f=><article key={f.t} className="overflow-hidden rounded-2xl border border-line bg-bg"><div className="aspect-[4/3] bg-surface">{f.img?<img src={f.img} alt={f.alt} loading="lazy" className="h-full w-full object-contain p-4 sm:p-4"/>:<div className="flex h-full items-center justify-center text-sm text-text-muted">[Közeli fotó: ujjbegyek]</div>}</div><div className="border-t border-signal p-4 lg:p-5"><h3 className="text-lg font-extrabold">{f.t}</h3><p className="mt-2 text-sm leading-6 text-text-muted">{f.b}</p></div></article>)}</div></div></section>
  <Water/>
  <Winter/>
  <Guarantee/>
  <SizeChart/>
  <Reviews/>
  <Care/>
  <ProductFaq/>
 </>;
}
