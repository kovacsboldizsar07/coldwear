import { useEffect,useRef,useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Lock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BundleSelector,catalogOptions } from '@/components/coldwear/bundle-selector';
import { SizeChart } from '@/components/coldwear/size-chart';
import { NewBrand } from '@/components/coldwear/reviews';
import { Guarantee } from '@/components/coldwear/guarantee';
import { Water } from '@/components/coldwear/water';
import { Winter } from '@/components/coldwear/winter';
import { ProductFaq } from '@/components/coldwear/faq';
import { GiftSection, GiftStrip, giftActive } from '@/components/coldwear/gift';
import { money } from '@/lib/commerce';
import { angleFrom, observeBlocks, setHeadlineVariant, track } from '@/lib/track';
import type { BundlePrice, Product } from '@/lib/commerce';
import palm from '@/assets/glove-palm-1200.webp';
import palmSmall from '@/assets/glove-palm-600.webp';
import zip from '@/assets/glove-zip-1200.webp';
import zipSmall from '@/assets/glove-zip-600.webp';
import pair from '@/assets/glove-pair-1200.webp';
import pairSmall from '@/assets/glove-pair-600.webp';
import grip from '@/assets/grip-palm.webp';
import zipClose from '@/assets/glove-zip-close.webp';
import touch from '@/assets/touchscreen-fingertips.webp';
import sockPhoto from '@/assets/socks.webp';
import infographic from '@/assets/glove-infographic-1000.webp';
import infographicSmall from '@/assets/glove-infographic-600.webp';
// The first three are shown everywhere; the rest only on large screens (the feature cards repeat them below).
const BENEFITS=['Érintőképes ujjbegy','Szélálló külső','Csúszásgátló tenyér','Vízlepergető felület','Cipzáras csukló','Vékony, jó fogás'];
type Photo={src:string;alt:string;srcSet?:string};
const HERO_SIZES='(min-width:1024px) 540px, calc(100vw - 32px)';
const HEADLINES={default:'ColdWear kesztyű: telefonozz benne, ne vedd le',bike:'ColdWear kesztyű: biciklin sem fúj át rajta a szél',fishing:'ColdWear kesztyű: horgászat közben is meleg marad a kezed'} as const;
// While the gift offer runs the headline sells the offer, not the brand.
// While the gift offer runs, the headline is an A/B/C test: each visitor gets one variant (kept in localStorage),
// and the variant goes with every tracked event and onto the cart (cw_headline), so orders can be split by headline.
// ?headline=phone|hike|wind forces one (for checking).
const GIFT_HEADLINES={phone:'Téli kesztyű, amiben telefonozhatsz. Most ajándék is jár mellé.',hike:'Téli kesztyű, amiben túrázhatsz. Most ajándék is jár mellé.',wind:'Téli kesztyű, amin nem fúj át a szél. Most ajándék is jár mellé.'} as const;
type HeadlineVariant=keyof typeof GIFT_HEADLINES;
function pickHeadline():HeadlineVariant{const keys=Object.keys(GIFT_HEADLINES) as HeadlineVariant[];const forced=new URLSearchParams(location.search).get('headline');if(keys.includes(forced as HeadlineVariant))return forced as HeadlineVariant;try{const saved=localStorage.getItem('cw_headline');if(keys.includes(saved as HeadlineVariant))return saved as HeadlineVariant;const v=keys[Math.floor(Math.random()*keys.length)]!;localStorage.setItem('cw_headline',v);return v}catch{return keys[Math.floor(Math.random()*keys.length)]!}}
// ViewContent fires once per page as soon as the product page loads (the buy box is in the hero, so every visitor sees the product).
// It waits up to 3 s for the catalog so Meta gets content_ids and value; after that it is sent without them.
function viewContentData(p:Product|undefined):Record<string,unknown>{const price=p?.variants.nodes[0]?.price;return p?{content_type:'product',content_name:p.title,content_ids:p.variants.nodes.map(v=>v.id.split('/').pop()||v.id),...(price?{value:Number(price.amount),currency:price.currencyCode}:{})}:{content_type:'product',content_name:'ColdWear Thermo kesztyű'}}
function viewContentProducts(p:Product|undefined){const v=p?.variants.nodes.find(x=>x.availableForSale)??p?.variants.nodes[0];return p&&v?[{productGid:p.id,variantGid:v.id,name:p.title,variantName:v.title,price:v.price.amount}]:undefined}
export function ThermoProductPage({prices}:{prices?:BundlePrice[]|undefined}={}){
 const [photo,setPhoto]=useState(0),[angle,setAngle]=useState<'default'|'bike'|'fishing'>('default'),[ready,setReady]=useState(false),[headline,setHeadline]=useState<HeadlineVariant|null>(null);
 const gloveRef=useRef<Product|undefined>(undefined);
 useEffect(()=>{setReady(true);if(giftActive()){const h=pickHeadline();setHeadlineVariant(h);setHeadline(h)}setAngle(angleFrom(new URLSearchParams(location.search)));const cleanup=observeBlocks();return()=>{cleanup()}},[]);
 const {data:products=[]}=useQuery({...catalogOptions});
 const glove=ready?products.find(p=>p.title.toLowerCase().includes('kesztyű')):undefined;
 gloveRef.current=glove;
 useEffect(()=>{if(!ready)return;const send=()=>track('ViewContent',viewContentData(gloveRef.current),{products:viewContentProducts(gloveRef.current)});if(glove){send();return}const t=setTimeout(send,3000);return()=>clearTimeout(t)},[ready,glove]);
 const sock=ready?products.find(p=>p.title.toLowerCase().includes('zokni')):undefined;
 const inUse:Photo={src:touch,alt:'Téli kesztyűt viselő kéz okostelefont tart, az érintőképes ujjbegy közelről'};
 const shopPhotos:Photo[]|undefined=glove?.images?.nodes.length?glove.images.nodes.map(n=>({src:n.url,alt:n.altText||glove.title,...(n.url.startsWith('https://cdn.shopify.com/')?{srcSet:`${n.url}${n.url.includes('?')?'&':'?'}width=600 600w, ${n.url}${n.url.includes('?')?'&':'?'}width=1200 1200w`}:{})})):undefined;
 // The in-use photo goes second: the touchscreen fingertip is the main promise, so it should not wait until the feature cards.
 // The feature infographic is always the first photo, both before and after the Shopify images load, so the hero never swaps.
 const features:Photo={src:infographic,srcSet:`${infographicSmall} 600w, ${infographic} 1000w`,alt:'ColdWear thermo kesztyű: érintőképernyővel is használható, vízálló, csúszásgátló, hidegálló'};
 const photos:Photo[]=shopPhotos?[features,shopPhotos[0]!,inUse,...shopPhotos.slice(1)]:[features,{src:pair,srcSet:`${pairSmall} 600w, ${pair} 1200w`,alt:'ColdWear thermo kesztyűpár felülnézetben, cipzáras csukló és csúszásgátló tenyér'},inUse,{src:zip,srcSet:`${zipSmall} 600w, ${zip} 1200w`,alt:'ColdWear thermo kesztyű felülnézet, cipzáras csukló'},{src:palm,srcSet:`${palmSmall} 600w, ${palm} 1200w`,alt:'ColdWear thermo kesztyű elölnézet, csúszásgátló tenyér'}];
 // Server-rendered bundle prices (from the route loader) so the price is in the first HTML; the variant price is the fallback.
 const single=prices?.find(p=>p.count===1)?.total??glove?.variants.nodes[0]?.price;
 function chooseSockBundle(){window.dispatchEvent(new CustomEvent('cw:bundle',{detail:{count:3}}));document.getElementById('bundle_selector')?.scrollIntoView({behavior:'smooth',block:'start'})}
 return <>
 <section id="hero" className="py-6 lg:py-9"><div className="cw-container grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-9">
  <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-surface sm:aspect-square"><img src={photos[photo]?.src} srcSet={photos[photo]?.srcSet} sizes={HERO_SIZES} width={1200} height={1200} alt={photos[photo]?.alt} fetchPriority="high" decoding="async" className="h-full w-full object-contain p-3 sm:p-4"/></div>
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{photos.map((p,i)=><button type="button" key={p.src} aria-label={p.alt} aria-pressed={photo===i} onClick={()=>setPhoto(i)} className={`size-14 shrink-0 overflow-hidden sm:size-20 rounded-xl border bg-surface p-1.5 transition-colors ${photo===i?'border-signal ring-1 ring-signal':'border-line hover:border-signal/50'}`}><img src={p.srcSet?p.srcSet.split(' ')[0]:p.src} alt="" loading="lazy" className="h-full w-full object-contain"/></button>)}</div>
  </div>
  <div className="min-w-0">
   {giftActive()&&<GiftStrip/>}
   <h1 className="mt-3 text-[26px] font-extrabold leading-[1.12] sm:mt-3 sm:text-4xl lg:text-[40px]">{giftActive()?<span className={headline?'':'invisible'}>{GIFT_HEADLINES[headline??'phone']}</span>:HEADLINES[angle]}</h1>
   <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted"><strong className="text-xl font-extrabold text-text tabular-nums">{single?<>{money(single)}<span className="text-sm font-semibold text-text-muted"> / pár</span></>:<span className="inline-block h-6 w-28 animate-pulse rounded-md bg-line align-middle" aria-label="Ár betöltése"/>}</strong><span className="flex items-center gap-1.5"><Lock size={14} className="text-signal-text"/>Fizetés átvételkor</span><span className="flex items-center gap-1.5"><Truck size={14} className="text-signal-text"/>GLS 1–2 nap</span></div>
   <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-3 lg:grid-cols-2">{BENEFITS.map((b,i)=><span key={b} className={`items-center gap-2 rounded-full bg-signal-soft px-2.5 py-2 text-xs sm:px-3 sm:text-sm font-semibold ${i<3?'flex':'hidden lg:flex'}`}><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-signal text-on-signal"><Check size={12} strokeWidth={3}/></span>{b}</span>)}</div>
   <div className="mt-4 sm:mt-5"><BundleSelector initialPrices={prices}/></div>
   <div className="mt-6 rounded-2xl bg-signal-soft p-4"><p className="font-bold">Vékony, mégis meleg.</p><p className="mt-1.5 text-sm leading-6 text-text-muted">Vezetés közben érzed benne a kormányt. Ha megállsz és csörög a telefon, nem kell levenned. A kötött kesztyűn átfúj a szél, a síkesztyűben semmit nem tudsz csinálni. Ez a kettő között van.</p></div>
   {!giftActive()&&<div className="mt-6"><h2 className="mb-3 text-lg font-bold">Jól működik együtt</h2><div className="flex items-center gap-3 rounded-2xl border border-line bg-signal-soft p-4 sm:gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface sm:size-20"><img src={sock?.images?.nodes[0]?.url||sockPhoto} alt={sock?.images?.nodes[0]?.altText||'ColdWear thermo zokni'} loading="lazy" className="h-full w-full object-contain"/></div><div className="min-w-0 flex-1"><p className="font-extrabold leading-tight">COLDWEAR THERMO ZOKNI</p><p className="mt-1 text-sm leading-5 text-text-muted">Elvezeti a párát, erősített sarok és orr.</p><div className="mt-3 sm:mt-4 sm:text-right"><Button className="h-11 w-full rounded-full font-bold sm:w-auto sm:px-7" onClick={chooseSockBundle}>Ajándékba kérem</Button></div></div></div><p className="mt-2 text-sm text-text-muted">3 kesztyű mellé 1 zokniajándék, ingyenes szállítással.</p></div>}
  </div>
 </div></section>
  <Water/>
  {giftActive()&&<GiftSection/>}
 <section id="features" className="bg-surface py-8 lg:py-10"><div className="cw-container"><h2 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Arra készült, amit naponta csinálsz.</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[{t:'Érintőképes ujjbegyek',b:'Az ujjbegyek vezetik a kijelzőt: üzenetet írsz, hívást fogadsz, nem kell levenned.',img:touch,alt:'Fekete téli kesztyűt viselő kéz okostelefont tart, az érintőképes ujjbegy közelről'},{t:'Csúszásgátló tenyér',b:'Szilikon minta az egész tenyéren: a telefon nem csúszik ki, a kormányt stabilan fogod.',img:grip,alt:'ColdWear thermo kesztyű csúszásgátló tenyér közeli fotó, szilikon mintázattal'},{t:'Cipzáras csukló',b:'Széthúzod, könnyen belebújsz, összehúzod, és szorosan ül.',img:zipClose,alt:'ColdWear thermo kesztyű cipzáras csukló közeli fotó, kihúzott cipzárral'}].map(f=><article key={f.t} className="overflow-hidden rounded-2xl border border-line bg-bg"><div className="aspect-[4/3] bg-surface">{f.img?<img src={f.img} alt={f.alt} loading="lazy" className="h-full w-full object-contain p-4 sm:p-4"/>:<div className="flex h-full items-center justify-center text-sm text-text-muted">[Közeli fotó: ujjbegyek]</div>}</div><div className="border-t border-signal p-4 lg:p-5"><h3 className="text-lg font-extrabold">{f.t}</h3><p className="mt-2 text-sm leading-6 text-text-muted">{f.b}</p></div></article>)}</div></div></section>
  <Winter/>
  <Guarantee/>
  <SizeChart/>
  <NewBrand/>
  <ProductFaq/>
 </>;
}
