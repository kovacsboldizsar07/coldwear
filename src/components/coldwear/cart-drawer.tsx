import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Check, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/stores/cart';
import { money } from '@/lib/commerce';
import { shippingStatus } from '@/lib/shipping';
import { track, cartAttributes, waitForConsentSync } from '@/lib/track';
import { getQuote, changeCart } from '@/lib/shopify.functions';
import { toast } from 'sonner';
import { catalogOptions } from './bundle-selector';
import { SIGNUP_STORAGE_KEY } from '@/lib/newsletter-rules';
import { giftActive, giftLabel } from './gift';

function savedCoupon(){try{return (JSON.parse(localStorage.getItem(SIGNUP_STORAGE_KEY)||'null') as {code?:string}|null)?.code||null}catch{return null}}
import glovePhoto from '@/assets/glove-pair-600.webp';
import sockAsset from '@/assets/socks.webp';

function SockPhoto() {
 return <img src={sockAsset} alt="ColdWear Thermo zokni" className="h-full w-full bg-surface object-contain"/>;
}

export function CartDrawer(){
 const {cart,open,setOpen,busy,update,remove,add}=useCart();
 const {data:products=[]}=useQuery(catalogOptions);
 const [sockSize,setSockSize]=useState('');
 const socks=products.find(p=>p.title.toLowerCase().includes('zokni'));
 const lines=cart?.lines.nodes||[];
 const count=cart?.totalQuantity||0;
 const shipping=shippingStatus(count);
 const hasGlove=lines.some(l=>l.merchandise.product.title.toLowerCase().includes('kesztyű'));
 const gloveCount=lines.filter(l=>l.merchandise.product.title.toLowerCase().includes('kesztyű')).reduce((n,l)=>n+l.quantity,0);
 const hasSock=lines.some(l=>l.merchandise.product.title.toLowerCase().includes('zokni'));
 const sockVariant=socks?.variants.nodes.find(v=>v.id===sockSize)||socks?.variants.nodes.find(v=>v.availableForSale);
 const upsellQuote=useQuery({queryKey:['sock-upsell-quote',cart?.id,sockVariant?.id,lines.map(l=>`${l.merchandise.id}:${l.quantity}`).join(',')],enabled:open&&hasGlove&&!hasSock&&Boolean(sockVariant)&&lines.length<4,queryFn:()=>getQuote({data:[...lines.map(l=>({merchandiseId:l.merchandise.id,quantity:l.quantity})),{merchandiseId:sockVariant?.id||'',quantity:1}]}),staleTime:30000});
 const sockPrice=upsellQuote.data?.lines.nodes.find(l=>l.merchandise.id===sockVariant?.id)?.cost.totalAmount;
 const coupon=open&&!shipping.eligible?savedCoupon():null;
 const discountApplied=cart?.discountCodes?.some(d=>d.applicable&&d.code.startsWith('CW-CSOMAG'));
 async function checkout(){
  if(busy||!cart?.id)return;
  useCart.setState({busy:true});
  try{
    await waitForConsentSync();
    const fresh=await changeCart({data:{operation:'attributes',cartId:cart.id,attributes:cartAttributes()}});
    if(!fresh){
      useCart.setState({cart:null,cartId:null});
      toast.info('A korábbi kosarad lejárt. Kérjük, válaszd ki újra a termékeket.');
      return;
    }
    if(!fresh.checkoutUrl)throw new Error('checkout_unavailable');
    useCart.setState({cart:fresh,cartId:fresh.id});
    track('InitiateCheckout',{value:Number(fresh.cost.totalAmount.amount),currency:fresh.cost.totalAmount.currencyCode,content_type:'product',content_ids:fresh.lines.nodes.map(l=>l.merchandise.id.split('/').pop()||l.merchandise.id),num_items:fresh.totalQuantity});
    const url=new URL(fresh.checkoutUrl);url.searchParams.set('channel','online_store');
    window.location.assign(url.toString());
  }catch{toast.error('A pénztár előkészítése nem sikerült. Próbáld újra.');}finally{useCart.setState({busy:false});}
 }
 return <Sheet open={open} onOpenChange={setOpen}><SheetContent className="flex h-dvh w-full flex-col gap-0 overflow-hidden border-l border-line bg-surface p-0 sm:max-w-[440px]">
  <div className="shrink-0 border-b border-line px-4 pb-5 pt-6 sm:px-6"><div className="flex items-center gap-3"><ShoppingBag className="size-6" strokeWidth={1.5}/><SheetTitle className="text-xl font-extrabold sm:text-2xl">A kosarad</SheetTitle><span className="flex size-7 items-center justify-center rounded-full border border-line bg-bg text-xs font-bold">{count}</span></div><SheetDescription className="mt-1.5">{count?'Már csak egy lépés a téli kényelem.':'A kosarad még üres.'}</SheetDescription></div>
  {count>0&&<div className="shrink-0 px-4 pt-4 sm:px-6"><div className="rounded-2xl border border-signal/25 bg-signal-soft p-4"><div className="flex items-start gap-3"><Truck className="mt-0.5 size-5 shrink-0 text-signal-text" strokeWidth={1.5}/><div className="min-w-0"><p className="text-sm font-bold">{shipping.eligible?'Ingyenes a szállítás!':`Még ${shipping.itemsRemaining} termék az ingyenes szállításig`}</p><p className="mt-1 text-xs leading-5 text-text-muted">{shipping.eligible?'3 terméktől 0 Ft a szállítás, a pénztárban automatikusan levonjuk.':'A zokni is beleszámít. Alatta a szállítás 990 Ft.'}</p></div></div><progress aria-label="Ingyenes szállítás felé haladás" value={shipping.progress} max={1} className="cw-shipping-progress mt-3 block h-1.5 w-full overflow-hidden rounded-full"/></div></div>}
  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6" aria-busy={busy}>
   {!count?<div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 text-center"><div className="flex size-20 items-center justify-center rounded-full border border-line bg-bg"><ShoppingBag size={32} strokeWidth={1}/></div><p className="text-text-muted">Válassz kesztyűt a téli napokra.</p><Button asChild className="rounded-full" onClick={()=>setOpen(false)}><Link to="/" hash="bundle_selector">Megnézem a csomagokat<ArrowRight/></Link></Button></div>:<div className="space-y-3">{lines.map(line=>{
    const product=products.find(p=>p.handle===line.merchandise.product.handle);
    const isGlove=line.merchandise.product.title.toLowerCase().includes('kesztyű');
    const thumb=product?.images?.nodes[0]?.url;
    const free=Number(line.cost.totalAmount.amount)===0;
    return <div key={line.id} className="rounded-2xl border border-line p-3"><div className="flex gap-3"><div className="h-20 w-16 shrink-0 sm:h-24 sm:w-20 overflow-hidden rounded-xl border border-line">{thumb?<img src={thumb} alt={product?.images?.nodes[0]?.altText||line.merchandise.product.title} className="h-full w-full object-contain"/>:isGlove?<img src={glovePhoto} alt="ColdWear thermo kesztyű" className="h-full w-full object-contain"/>:<SockPhoto/>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-1"><h3 className="text-sm font-bold leading-5">{line.merchandise.product.title}</h3><Button size="icon" variant="ghost" className="size-7 shrink-0 text-text-muted" title="Termék törlése" aria-label="Termék törlése" disabled={busy} onClick={()=>void remove(line.id)}><Trash2 className="size-3.5"/></Button></div><div className="mt-2 flex items-center gap-2"><label className="text-xs text-text-muted" htmlFor={line.id}>Méret</label><select id={line.id} value={line.merchandise.id} disabled={busy} className="h-8 min-w-0 max-w-full rounded-lg border border-line bg-bg px-2 text-xs" onChange={e=>void update(line.id,e.target.value,line.quantity)}>{product?product.variants.nodes.map(v=><option key={v.id} value={v.id} disabled={!v.availableForSale}>{v.title}</option>):<option value={line.merchandise.id}>{line.merchandise.title}</option>}</select></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="flex h-8 items-center rounded-lg border border-line"><Button size="icon" variant="ghost" className="size-8" aria-label="Mennyiség csökkentése" disabled={busy} onClick={()=>void update(line.id,line.merchandise.id,line.quantity-1)}><Minus/></Button><span className="w-6 text-center text-xs font-semibold">{line.quantity}</span><Button size="icon" variant="ghost" className="size-8" aria-label="Mennyiség növelése" disabled={busy} onClick={()=>void update(line.id,line.merchandise.id,line.quantity+1)}><Plus/></Button></div><div className="text-right"><strong className={`text-sm ${free?'text-go':'text-text'}`}>{free?'Ajándék':money(line.cost.totalAmount)}</strong>{discountApplied&&!free&&<p className="text-[10px] text-text-muted">Csomagkedvezmény előtt</p>}</div></div></div></div></div>;
   })}</div>}
   {hasGlove&&!hasSock&&socks&&<div className="mt-4 rounded-2xl border border-signal/25 bg-signal-soft p-4"><div className="flex gap-3"><div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-line">{socks.images?.nodes[0]?.url?<img src={socks.images.nodes[0].url} alt={socks.images.nodes[0].altText||'ColdWear thermo zokni'} className="h-full w-full object-contain"/>:<SockPhoto/>}</div><div className="min-w-0 flex-1"><h3 className="text-base font-extrabold">A lábad se fázzon.</h3><p className="mt-1 text-xs leading-5 text-text-muted">ColdWear Thermo zokni</p><p className="mt-1 text-sm font-bold">{sockPrice?Number(sockPrice.amount)===0?'Ajándék a csomagodhoz':money(sockPrice):upsellQuote.isFetching?'Ár frissítése…':'Válassz méretet'}</p></div></div><div className="mt-3 flex gap-2"><select aria-label="Zokni méret" className="h-11 min-w-0 flex-1 rounded-xl border border-signal/25 bg-surface px-3 text-sm" value={sockSize} disabled={busy} onChange={e=>setSockSize(e.target.value)}><option value="">Zokniméret</option>{socks.variants.nodes.map(v=><option key={v.id} value={v.id} disabled={!v.availableForSale}>{v.title}</option>)}</select><Button className="h-11 shrink-0 rounded-xl px-4 normal-case" disabled={!sockSize||busy} onClick={()=>{track('upsell_add');void add([{merchandiseId:sockSize,quantity:1}])}}>Hozzáadom<Plus/></Button></div>{count===2&&<p className="mt-2 text-xs text-signal-text">Ezzel a 3 termékes szállítási feltételt is eléred.</p>}</div>}
   {hasSock&&<p className="mt-4 flex items-center gap-2 text-xs text-go"><Check className="size-4"/>Thermo zokni a kosaradban</p>}
   {giftActive()&&gloveCount>0&&<div className="mt-4 flex items-center gap-3 rounded-2xl border border-gift/30 bg-gift-soft p-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gift text-2xl" aria-hidden>🎁</span><div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5">Téli meglepetés ajándék</p><p className="text-xs leading-5 text-text-muted">{giftLabel(gloveCount)}. A csomagodhoz tesszük.</p></div><strong className="shrink-0 text-sm text-gift-text">0 Ft</strong></div>}
  </div>
  {count>0&&<div className="shrink-0 border-t border-line bg-surface px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 sm:px-6">{discountApplied&&<p className="mb-3 flex items-center gap-2 text-xs font-semibold text-go"><Check className="size-4"/>Csomagkedvezmény automatikusan érvényesítve</p>}<div className="mb-1 flex items-center justify-between gap-3"><span className="font-semibold">Összesen</span><strong className="text-xl font-extrabold sm:text-2xl">{money(cart?.cost.totalAmount)}</strong></div><p className="mb-4 text-xs leading-5 text-text-muted">A szállítás végleges díja a pénztárban jelenik meg.</p>{coupon&&<p className="-mt-2 mb-4 flex items-center gap-2 rounded-xl bg-signal/10 px-3 py-2 text-xs"><Truck className="size-4 shrink-0 text-signal-text"/><span>Ingyenes szállítás kuponod: <strong className="font-mono">{coupon}</strong> – a pénztárban add meg.</span></p>}<Button className="h-14 w-full rounded-full text-sm" disabled={busy||!cart?.checkoutUrl} onClick={()=>void checkout()}>{busy?<><Loader2 className="animate-spin"/>Kosár frissítése</>:<>Tovább a pénztárhoz<ArrowRight/></>}</Button><div className="mt-3 flex items-center justify-center gap-2 text-xs text-text-muted"><ShieldCheck className="size-4 shrink-0" strokeWidth={1.5}/><span>14 napos pénzvisszafizetési garancia</span></div></div>}
 </SheetContent></Sheet>;
}
