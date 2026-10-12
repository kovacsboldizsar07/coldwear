import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, Ruler, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCatalog,getQuote } from '@/lib/shopify.functions';
import { copyFirstSize,money } from '@/lib/commerce';
import { useCart } from '@/stores/cart';
import { track } from '@/lib/track';
export const catalogOptions={queryKey:['coldwear-catalog'],queryFn:()=>getCatalog(),staleTime:60_000};
export function BundleSelector(){
 const {data:products=[],isPending,isError}=useQuery(catalogOptions);
 const glove=products.find(p=>p.title.toLowerCase().includes('kesztyű')); const sock=products.find(p=>p.title.toLowerCase().includes('zokni'));
 const [bundle,setBundle]=useState(2);const [sizes,setSizes]=useState(['','','']);const [sockSize,setSockSize]=useState('');
 const busy=useCart(s=>s.busy); const add=useCart(s=>s.add); const [sticky,setSticky]=useState(false);
 useEffect(()=>{const hero=document.getElementById('hero');if(!hero)return;const observer=new IntersectionObserver(([entry])=>setSticky(Boolean(entry&&!entry.isIntersecting)));observer.observe(hero);return()=>observer.disconnect()},[]);
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
 return <>
 <section id="bundle_selector" className="cw-section"><div className="cw-container">
 <div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="cw-label mb-3 text-text-muted">06 / VÁLASZD KI A CSOMAGOD</p><h2 className="cw-heading">Egy neked. Egy annak, aki mindig fázik.</h2></div><Button variant="ghost" onClick={()=>{track('size_chart_open');document.getElementById('size_chart')?.scrollIntoView()}}><Ruler/>Mérettáblázat</Button></div>
 <div className="cw-grid3">{[1,2,3].map(count=><Button key={count} variant="outline" aria-pressed={bundle===count} onClick={()=>choose(count)} className={`relative h-auto min-h-[184px] flex-col items-start justify-start whitespace-normal p-6 text-left ${bundle===count?'border-2 border-text bg-surface':'bg-bg'}`}>
 {count===2&&<span className="cw-label absolute -top-3 right-4 rounded bg-signal px-3 py-1 text-on-signal">Ajánlott</span>}
 <span className="mb-4 flex w-full items-center justify-between text-lg font-bold">{count===3?'3 kesztyű + ajándék zokni':`${count} kesztyű`}<span className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${bundle===count?'bg-text text-bg':'border-line'}`}>{bundle===count&&<Check className="size-3"/>}</span></span>
 <span className="text-3xl font-extrabold tabular-nums">{money(quotes.data?.[count-1]?.cost.totalAmount)}</span>
 <span className="mt-4 text-sm font-normal text-text-muted">{count===3?'Ingyenes szállítás':'+ 1.490 Ft szállítás'}</span>
 </Button>)}</div>
 <p className="cw-body mt-4 text-sm">Tegyél a két kesztyű mellé egy zoknit, és ingyenes a szállítás.</p>
 <div className="mt-8 grid gap-8 border-t border-line pt-8 md:grid-cols-2"><div className="space-y-4">{Array.from({length:bundle},(_,i)=><div key={i} className="flex flex-wrap items-center gap-3"><span className="cw-label mr-3 w-16">{i+1}. pár</span>{['S','M','L','XL'].map(size=><Button key={size} aria-label={`${i+1}. pár ${size}`} aria-pressed={sizes[i]===size} variant="outline" onClick={()=>chooseSize(i,size)} disabled={Boolean(glove)&&!glove?.variants.nodes.find(v=>v.title===size)?.availableForSale} className={`h-11 min-w-12 font-mono ${sizes[i]===size?'bg-text text-bg border-text':''}`}>{size}</Button>)}</div>)}
 {bundle===3&&<label className="block cw-label">Ajándék zokni<select className="cw-input mt-2" value={sockSize} onChange={e=>setSockSize(e.target.value)}><option value="">[méretek]</option>{sock?.variants.nodes.map(v=><option key={v.id} value={v.id} disabled={!v.availableForSale}>{v.title}</option>)}</select></label>}
 </div><div className="md:pl-8"><div className="mb-5 flex items-center justify-between"><span className="text-sm">Kiválasztott csomag</span><strong className="text-2xl">{money(quote.data?.cost.totalAmount||quotes.data?.[bundle-1]?.cost.totalAmount)}</strong></div><Button className="w-full" disabled={!allSizes||!glove||busy} onClick={submit}><ShoppingBag/>{busy?'Frissítés…':'Kosárba teszem'}<ArrowRight className="ml-auto"/></Button>
 <p aria-live="polite" className="mt-3 text-sm text-signal-text">{!allSizes?'Válaszd ki minden pár méretét'+(bundle===3?' és az ajándék zokni méretét.':'.'):''}</p>
 {!glove&&<p className="mt-3 text-sm text-text-muted">{isPending?'A termékek betöltése…':isError?'A termékek betöltése nem sikerült.':'Még nincs elérhető termék az áruházban.'}</p>}
 <p className="cw-body mt-5 text-sm">Ingyenes méretcsere. Fizethetsz a GLS futárnál is.</p></div></div>
 </div></section>
 {sticky&&<div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 bg-block px-5 py-3 text-on-block md:hidden"><div><p className="text-xs">{bundle} kesztyű{bundle===3?' + zokni':''}</p><strong>{money(quote.data?.cost.totalAmount||quotes.data?.[bundle-1]?.cost.totalAmount)}</strong></div><Button variant="secondary" onClick={submit} disabled={busy||Boolean(allSizes&&!glove)}>Kosárba<ArrowRight/></Button></div>}
 </>;
}
