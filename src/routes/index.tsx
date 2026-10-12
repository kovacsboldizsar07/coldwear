import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Check, Truck, RefreshCcw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Guarantee } from '@/components/coldwear/guarantee';
import zip from '@/assets/glove-zip.png.asset.json';
import palm from '@/assets/glove-palm.png.asset.json';
export const Route=createFileRoute('/')({head:()=>({meta:[{title:'ColdWear | Thermo kesztyű és zokni a téli napokra'},{name:'description',content:'ColdWear szélálló, vízlepergető thermo kesztyű és thermo zokni. Ingyenes méretcsere, 14 napos pénzvisszafizetési garancia.'},{property:'og:title',content:'ColdWear | A hideg maradjon kint.'},{property:'og:description',content:'Thermo kesztyű és zokni a téli hétköznapokhoz.'},...(zip.url.startsWith('https://')?[{property:'og:image',content:zip.url},{name:'twitter:image',content:zip.url}]:[]),{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Home});
function Home(){
 return <>
 <section className="py-8 md:py-12"><div className="cw-container"><div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-text p-8 text-bg md:grid-cols-2 md:p-14">
  <div><p className="text-sm font-bold uppercase tracking-wider text-signal">ColdWear Thermo kesztyű</p><h1 className="mt-4 text-4xl font-extrabold leading-[1.02] md:text-6xl">A hideg maradjon <span className="text-signal">kint.</span></h1><p className="mt-5 max-w-md text-lg leading-8 text-on-block-muted">Szélálló, vízlepergető kesztyű érintőképes ujjbegyekkel. A telefonhoz nem kell levenned.</p>
   <ul className="mt-6 space-y-2.5">{['Ingyenes méretcsere','14 napos pénzvisszafizetési garancia','Utánvét a GLS futárnál'].map(t=><li key={t} className="flex items-center gap-3"><span className="flex size-6 items-center justify-center rounded-full bg-signal text-on-signal"><Check size={14} strokeWidth={3}/></span>{t}</li>)}</ul>
   <Button asChild className="mt-8 h-16 rounded-full px-10 text-lg font-extrabold"><Link to="/thermo-kesztyu">MEGNÉZEM A KESZTYŰT<ArrowRight/></Link></Button></div>
  <div className="relative aspect-square rounded-3xl bg-surface"><img src={zip.url} alt="ColdWear thermo kesztyű cipzáras csuklóval" fetchPriority="high" className="h-full w-full object-contain p-8"/><span className="absolute right-5 top-5 rounded-full bg-signal px-4 py-2 text-sm font-extrabold text-on-signal">2 db: 14 990 Ft</span></div>
 </div></div></section>
 <div className="cw-container"><div className="grid grid-cols-1 gap-3 rounded-3xl bg-signal-soft p-5 sm:grid-cols-3">{[[Truck,'GLS, 1–2 munkanap'],[RefreshCcw,'Ingyenes méretcsere'],[Lock,'Utánvéttel is fizethetsz']].map(([Icon,l])=>{const I=Icon as typeof Truck;return <p key={String(l)} className="flex items-center justify-center gap-2.5 font-semibold"><I size={20} className="text-signal-text"/>{String(l)}</p>})}</div></div>
 <section className="py-16"><div className="cw-container"><h2 className="text-3xl font-extrabold md:text-4xl">Termékeink</h2><div className="mt-8 grid gap-6 md:grid-cols-2">
  <Link to="/thermo-kesztyu" className="group overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-signal"><div className="aspect-[4/3] bg-bg"><img src={palm.url} alt="ColdWear thermo kesztyű" loading="lazy" className="h-full w-full object-contain p-8"/></div><div className="flex items-center justify-between p-6"><div><h3 className="text-xl font-extrabold">ColdWear Thermo kesztyű</h3><p className="text-text-muted">Szélálló · érintőképes · S–XL</p></div><span className="flex size-12 items-center justify-center rounded-full bg-signal text-on-signal transition-transform group-hover:translate-x-1"><ArrowRight/></span></div></Link>
  <Link to="/thermo-kesztyu" hash="bundle_selector" className="group overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-signal"><div className="flex aspect-[4/3] items-center justify-center bg-bg text-sm text-text-muted">[Termékfotó: Thermo zokni]</div><div className="flex items-center justify-between p-6"><div><h3 className="text-xl font-extrabold">ColdWear Thermo zokni</h3><p className="text-text-muted">3 kesztyű mellé ajándék</p></div><span className="flex size-12 items-center justify-center rounded-full bg-signal text-on-signal transition-transform group-hover:translate-x-1"><ArrowRight/></span></div></Link>
 </div></div></section>
 <Guarantee/>
 </>;
}
