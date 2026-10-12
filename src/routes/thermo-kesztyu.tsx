import { createFileRoute } from '@tanstack/react-router';
import { useEffect,useState } from 'react';
import { Check,ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BundleSelector } from '@/components/coldwear/bundle-selector';
import { SizeChart } from '@/components/coldwear/size-chart';
import { Reviews } from '@/components/coldwear/reviews';
import { Guarantee } from '@/components/coldwear/guarantee';
import { dispatchMessage } from '@/lib/dispatch';
import { observeBlocks } from '@/lib/track';
import palm from '@/assets/glove-palm.png.asset.json';
import zip from '@/assets/glove-zip.png.asset.json';
import pair from '@/assets/glove-pair.png.asset.json';
export const Route=createFileRoute('/thermo-kesztyu')({head:()=>({meta:[{title:'ColdWear Thermo kesztyű | Szélálló, érintőképes, vízlepergető'},{name:'description',content:'ColdWear szélálló, vízlepergető thermo kesztyű érintőképes ujjbegyekkel. 14 napos pénzvisszafizetési garancia.'},{property:'og:title',content:'ColdWear Thermo kesztyű'},{property:'og:description',content:'Thermo kesztyű és zokni a téli hétköznapokhoz. Válaszd ki a méreted.'},...(zip.url.startsWith('https://')?[{property:'og:image',content:zip.url},{name:'twitter:image',content:zip.url}]:[]),{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Home});
const BENEFITS=['Szélálló külső','Vízlepergető felület','Érintőképes ujjbegy','Csúszásgátló tenyér','Cipzáras csukló','Polár belső'];
function Home(){
 const [photo,setPhoto]=useState(0),[bike,setBike]=useState(false),[dispatch,setDispatch]=useState(''),[faq,setFaq]=useState<number|null>(0);
 useEffect(()=>{setBike(new URLSearchParams(location.search).get('angle')==='bike');setDispatch(dispatchMessage(new Date()));const interval=setInterval(()=>setDispatch(dispatchMessage(new Date())),60_000);const cleanup=observeBlocks();return()=>{clearInterval(interval);cleanup()}},[]);
 const photos=[{src:pair.url,alt:'ColdWear thermo kesztyűpár felülnézetben, cipzáras csukló és csúszásgátló tenyér'},{src:zip.url,alt:'ColdWear thermo kesztyű felülnézet, cipzáras csukló'},{src:palm.url,alt:'ColdWear thermo kesztyű elölnézet, csúszásgátló tenyér'}];
 const faqs=[['Mosható a kesztyű?','[Mosási útmutató a gyártói adatok alapján.]'],['Milyen hidegre ajánlott?','[Őszinte válasz a saját teszt alapján. Nincs hőmérséklet ígéret.]'],['Mikor érkezik meg a rendelésem?','GLS házhozszállítással vagy csomagpontra, 1–2 munkanap alatt.'],['Lehet utánvéttel fizetni?','Igen. Átvételkor készpénzzel vagy kártyával is fizethetsz a GLS futárnál. [utánvét díja]']];
 return <>
 <section id="hero" className="py-8 md:py-12"><div className="cw-container grid gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
  <div className="min-w-0 md:sticky md:top-24 md:self-start">
    <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-surface"><img src={photos[photo]?.src} alt={photos[photo]?.alt} fetchPriority="high" className="h-full w-full object-contain p-6"/></div>
    <div className="mt-3 flex gap-3">{photos.map((p,i)=><button type="button" key={p.src} aria-label={p.alt} aria-pressed={photo===i} onClick={()=>setPhoto(i)} className={`size-24 overflow-hidden rounded-xl border bg-surface p-1.5 transition-colors ${photo===i?'border-signal ring-1 ring-signal':'border-line hover:border-signal/50'}`}><img src={p.src} alt="" className="h-full w-full object-contain"/></button>)}</div>
  </div>
  <div className="min-w-0">
   <p className="text-sm font-semibold text-signal-text">{dispatch||'Feladás még ma, ha 14:00 előtt rendelsz.'}</p>
   <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-[1.05] tracking-tight md:text-[52px]">{bike?'ColdWear thermo kesztyű: biciklin sem fúj át rajta a szél':'ColdWear thermo kesztyű: telefonálj benne, ne vedd le'}</h1>
   <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">{BENEFITS.map(b=><span key={b} className="flex items-center gap-2.5 rounded-full bg-signal-soft px-3.5 py-2.5 text-sm font-semibold"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-signal text-on-signal"><Check size={12} strokeWidth={3}/></span>{b}</span>)}</div>
   <div className="mt-7"><BundleSelector/></div>
   <div className="mt-8 rounded-2xl bg-signal-soft p-5"><p className="font-bold">Vékony, mégis meleg.</p><p className="mt-1.5 text-sm leading-6 text-text-muted">Vezetés közben érzed benne a kormányt. Ha megállsz és csörög a telefon, nem kell levenned. A kötött kesztyűn átfúj a szél, a síkesztyűben semmit nem tudsz csinálni. Ez a kettő között van.</p></div>
   <div className="mt-6 divide-y divide-line border-y border-line">{faqs.map(([q,a],i)=><div key={q}><button type="button" aria-expanded={faq===i} onClick={()=>setFaq(faq===i?null:i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-bold">{q}<ChevronDown size={20} className={`shrink-0 text-signal-text transition-transform ${faq===i?'rotate-180':''}`}/></button>{faq===i&&<p className="pb-5 leading-7 text-text-muted">{a}</p>}</div>)}</div>
   <div className="mt-8"><h2 className="mb-3 text-lg font-bold">Jól működik együtt</h2><div className="flex items-center gap-4 rounded-2xl border border-line bg-signal-soft p-4"><div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-surface text-center text-[10px] text-text-muted">[zokni fotó]</div><div className="flex-1"><p className="font-extrabold">COLDWEAR THERMO ZOKNI</p><p className="text-sm text-text-muted">Elvezeti a párát, erősített sarok és orr.</p></div><Button className="rounded-full font-bold" onClick={()=>document.getElementById('bundle_selector')?.scrollIntoView({behavior:'smooth'})}>Hozzáadom</Button></div><p className="mt-2 text-sm text-text-muted">3 kesztyű mellé 1 zokni ajándék.</p></div>
  </div>
 </div></section>
 <section id="features" className="bg-surface py-16 md:py-20"><div className="cw-container"><h2 className="max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">Arra készült, amit naponta csinálsz.</h2><div className="mt-10 grid gap-6 md:grid-cols-3">{[{t:'Érintőképes ujjbegyek',b:'A [hüvelyk- és mutatóujj] hegye vezeti a kijelzőt, nem kell levenned.',img:null},{t:'Csúszásgátló tenyér',b:'Szilikon minta az egész tenyéren: a telefon nem csúszik ki, a kormányt stabilan fogod.',img:palm.url},{t:'Cipzáras csukló',b:'Széthúzod, könnyen belebújsz, összehúzod, és szorosan ül.',img:zip.url}].map(f=><article key={f.t} className="overflow-hidden rounded-2xl border border-line bg-bg"><div className="aspect-[4/3] bg-surface">{f.img?<img src={f.img} alt={f.t} loading="lazy" className="h-full w-full object-contain p-6"/>:<div className="flex h-full items-center justify-center text-sm text-text-muted">[Közeli fotó: ujjbegyek]</div>}</div><div className="border-t border-signal p-6"><h3 className="text-xl font-extrabold">{f.t}</h3><p className="mt-2 leading-7 text-text-muted">{f.b}</p></div></article>)}</div></div></section>
 <Reviews/>
 <Guarantee/>
 <SizeChart/>
 </>;
}
