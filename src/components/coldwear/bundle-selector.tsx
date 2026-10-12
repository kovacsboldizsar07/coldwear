import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lock, Truck, RefreshCcw, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCatalog,getQuote } from '@/lib/shopify.functions';
import { copyFirstSize,money } from '@/lib/commerce';
import { useCart } from '@/stores/cart';
import { track } from '@/lib/track';
export const catalogOptions={queryKey:['coldwear-catalog'],queryFn:()=>getCatalog(),staleTime:60_000};
const OPTIONS=[{count:1,title:'1 KESZTYŰ',sub:'1 pár · + szállítási díj'},{count:2,title:'2 KESZTYŰ',sub:'2 pár · egy neked, egy ajándékba',badge:'AJÁNLOTT'},{count:3,title:'3 KESZTYŰ + AJÁNDÉK ZOKNI',sub:'3 pár + 1 zokni ajándékba · ingyenes szállítás',badge:'LEGJOBB ÁR'}];
export function BundleSelector(){
 const {data:products=[],isPending,isError}=useQuery(catalogOptions);
 const glove=products.find(p=>p.title.toLowerCase().includes('kesztyű')); const sock=products.find(p=>p.title.toLowerCase().includes('zokni'));
 const [bundle,setBundle]=useState(2);const [sizes,setSizes]=useState(['','','']);const [sockSize,setSockSize]=useState('');
 const busy=useCart(s=>s.busy); const add=useCart(s=>s.add); const [sticky,setSticky]=useState(false);
 useEffect(()=>{const el=document.getElementById('bundle_selector');if(!el)return;const observer=new IntersectionObserver(([entry])=>setSticky(Boolean(entry&&!entry.isIntersecting&&entry.boundingClientRect.top<0)));observer.observe(el);return()=>observer.disconnect()},[]);
 const allSizes=sizes.slice(0,bundle).every(Boolean)&&(bundle!==3||Boolean(sockSize));
 const lines=sizes.slice(0,bundle).map(size=>({merchandiseId:glove?.variants.nodes.find(v=>v.title===size)?.id||'',quantity:1}));
 if(bundle===3)lines.push({merchandiseId:sockSize,quantity:1});
 const quote=useQuery({queryKey:['selected-quote',lines],queryFn:()=>getQuote({data:lines}),enabled:allSizes&&lines.every(l=>Boolean(l.merchandiseId)),staleTime:30_000});
 const quotes=useQuery({queryKey:['bundle-quotes',glove?.id,sock?.id],enabled:Boolean(glove?.variants.nodes.some(v=>v.availableForSale)),queryFn:async()=>{
  const variant=glove?.variants.nodes.find(v=>v.availableForSale);if(!variant)return [];
  return Promise.all([1,2,3].map(count=>getQuote({data:[{merchandiseId:variant.id,quantity:count},...(count===3&&sock?.variants.nodes[0]?[{merchandiseId:sock.variants.nodes[0].id,quantity:1}]:[])]})));},staleTime:60_000});
 function choose(count:number){setBundle(count);track('bundle_select',{quantity:count})}
 function chooseSize(index:number,value:string){setSizes(previous=>copyFirstSize(previous,index,value));track('size_select',{pair:index+1,size:value})}
 function submit(){if(!allSizes){document.getElementById('bundle_selector')?.scrollIntoView({behavior:'smooth'});return}if(!glove||lines.some(l=>!l.merchandiseId))return;void add(lines)}
 const total=money(quote.data?.cost.totalAmount||quotes.data?.[bundle-1]?.cost.totalAmount);
 return <div id="bundle_selector">
  <div className="space-y-3" role="radiogroup" aria-label="Csomag">{OPTIONS.map(o=>{const active=bundle===o.count;const q=quotes.data?.[o.count-1];return <button type="button" role="radio" aria-checked={active} key={o.count} onClick={()=>choose(o.count)} className={`relative flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-colors ${active?'border-signal bg-signal-soft':'border-line bg-surface hover:border-signal/50'}`}>
   {o.badge&&<span className="absolute -top-3 right-4 rotate-2 rounded-md bg-signal px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-on-signal">{o.badge}</span>}
   <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${active?'border-signal':'border-line'}`}>{active&&<span className="size-3 rounded-full bg-signal"/>}</span>
   <span className="flex-1"><span className="block text-lg font-extrabold leading-tight">{o.title}</span><span className="mt-1 block text-sm text-text-muted">{o.sub}</span></span>
   <span className="text-right"><span className="block text-xl font-extrabold tabular-nums text-signal-text">{q?money(q.cost.totalAmount):'–'}</span>{q&&q.cost.subtotalAmount.amount!==q.cost.totalAmount.amount&&<span className="block text-sm text-text-muted line-through">{money(q.cost.subtotalAmount)}</span>}{q?.lines.nodes[0]?.cost.amountPerQuantity&&<span className="block text-xs text-text-muted">{money(q.lines.nodes[0].cost.amountPerQuantity)} / pár</span>}</span>
  </button>})}</div>
  <div className="mt-6 space-y-3"><div className="flex items-center justify-between"><span className="text-sm font-bold">Válassz méretet</span><a href="#size_chart" onClick={()=>track('size_chart_open')} className="flex items-center gap-1.5 text-sm font-semibold text-signal-text underline underline-offset-4"><Ruler size={15}/>Mérettáblázat</a></div>
   {Array.from({length:bundle},(_,i)=><div key={i} className="flex items-center gap-2"><span className="w-14 text-sm text-text-muted">{i+1}. pár</span>{['S','M','L','XL'].map(size=><button type="button" key={size} aria-label={`${i+1}. pár ${size}`} aria-pressed={sizes[i]===size} onClick={()=>chooseSize(i,size)} disabled={Boolean(glove)&&!glove?.variants.nodes.find(v=>v.title===size)?.availableForSale} className={`h-11 min-w-14 rounded-lg border-2 px-3 font-bold transition-colors disabled:opacity-40 ${sizes[i]===size?'border-signal bg-signal text-on-signal':'border-line bg-surface hover:border-signal/60'}`}>{size}</button>)}</div>)}
   {bundle===3&&<div className="flex flex-wrap items-center gap-2"><span className="w-14 text-sm text-text-muted">Zokni</span>{sock?.variants.nodes.length?sock.variants.nodes.map(v=><button type="button" key={v.id} aria-label={`Ajándék zokni ${v.title}`} aria-pressed={sockSize===v.id} disabled={!v.availableForSale} onClick={()=>{setSockSize(v.id);track('size_select',{pair:'sock',size:v.title})}} className={`h-11 min-w-14 rounded-lg border-2 px-3 font-bold transition-colors disabled:opacity-40 ${sockSize===v.id?'border-signal bg-signal text-on-signal':'border-line bg-surface hover:border-signal/60'}`}>{v.title}</button>):<span className="text-sm text-text-muted">A zokni méretei akkor jelennek meg, ha a zokni termék elérhető az áruházban.</span>}</div>}
  </div>
  <Button className="mt-6 h-16 w-full rounded-full text-lg font-extrabold tracking-wide" disabled={!glove||busy} onClick={submit}>{busy?'FRISSÍTÉS…':'KOSÁRBA TESZEM'}{total!=='–'&&!busy?<span className="font-semibold opacity-80">· {total}</span>:null}</Button>
  <p aria-live="polite" className="mt-2 min-h-5 text-center text-sm text-signal-text">{glove&&!allSizes?'Válaszd ki minden pár méretét'+(bundle===3?' és a zokni méretét.':'.'):''}</p>
  {!glove&&<p className="text-center text-sm text-text-muted">{isPending?'A termékek betöltése…':isError?'A termékek betöltése nem sikerült.':'Még nincs elérhető termék az áruházban.'}</p>}
  <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-muted">{[[Lock,'Utánvét a futárnál'],[Truck,'GLS, 1–2 munkanap'],[RefreshCcw,'Ingyenes méretcsere']].map(([Icon,l])=>{const I=Icon as typeof Lock;return <span key={String(l)} className="flex items-center gap-1.5"><I size={15} className="text-signal-text"/>{String(l)}</span>})}</div>
  {sticky&&<div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-surface px-5 py-3 md:hidden"><div><p className="text-xs text-text-muted">{bundle} kesztyű{bundle===3?' + zokni':''}</p><strong className="text-signal-text">{total}</strong></div><Button className="rounded-full font-extrabold" onClick={submit} disabled={busy||!glove}>KOSÁRBA</Button></div>}
 </div>;
}
