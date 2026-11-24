import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { changeCart } from '@/lib/shopify.functions';
import { cartAttributes,shopifyTokens,track,waitForConsentSync } from '@/lib/track';
import type { Cart } from '@/lib/commerce';
import { toast } from 'sonner';
type LineInput={merchandiseId:string;quantity:number;id?:string};
type State={cart:Cart|null;cartId:string|null;open:boolean;busy:boolean;setOpen:(value:boolean)=>void;sync:()=>Promise<void>;add:(lines:LineInput[])=>Promise<void>;update:(lineId:string,variantId:string,quantity:number)=>Promise<void>;remove:(lineId:string)=>Promise<void>};
export const useCart=create<State>()(persist((set,get)=>({
 cart:null,cartId:null,open:false,busy:false,
 setOpen:open=>{set({open});if(open)void get().sync()},
 sync:async()=>{
  if(get().busy)return;
  const id=get().cartId;if(!id)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:'attributes',cartId:id,attributes:cartAttributes(),tracking:shopifyTokens()}});
   set({cart,cartId:cart?.id||null});
  }catch{toast.error('A kosár frissítése nem sikerült. Próbáld újra.')}finally{set({busy:false})}
 },
 add:async(lines)=>{
  if(get().busy)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:get().cartId?'add':'create',cartId:get().cartId||undefined,lines,attributes:cartAttributes(),tracking:shopifyTokens()}});
   set({cart,cartId:cart?.id||null});
   if(!cart){toast.error('Nem sikerült a kosár létrehozása. Próbáld újra.');return}
   set({open:true});
   // Value of what was just added (not the whole cart), with the Shopify variant IDs Meta uses for product matching.
   const added=lines.map(l=>({l,line:cart.lines.nodes.find(n=>n.merchandise.id===l.merchandiseId)})).filter(x=>x.line);
   const value=added.reduce((sum,x)=>sum+Number(x.line?.cost.amountPerQuantity.amount||0)*x.l.quantity,0);
   track('AddToCart',{value:value||Number(cart.cost.totalAmount.amount),currency:cart.cost.totalAmount.currencyCode,content_type:'product',content_ids:added.map(x=>x.l.merchandiseId.split('/').pop()||x.l.merchandiseId),num_items:lines.reduce((s,l)=>s+l.quantity,0)},{cartId:cart.id,products:added.flatMap(({l,line})=>line?[{productGid:line.merchandise.product.id,variantGid:l.merchandiseId,name:line.merchandise.product.title,variantName:line.merchandise.title,price:line.cost.amountPerQuantity.amount,quantity:l.quantity}]:[])});
  }catch{toast.error('Nem sikerült a kosárba helyezés. Próbáld újra.')}finally{set({busy:false})}
 },
 update:async(id,merchandiseId,quantity)=>{
  if(quantity<=0)return get().remove(id);
  if(get().busy||!get().cartId)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:'update',cartId:get().cartId||undefined,lines:[{id,merchandiseId,quantity}],attributes:cartAttributes(),tracking:shopifyTokens()}});
   set({cart,cartId:cart?.id||null});
   if(!cart)toast.info('A korábbi kosarad lejárt. Kérjük, válaszd ki újra a termékeket.');
  }catch{toast.error('A módosítás nem sikerült.')}finally{set({busy:false})}
 },
 remove:async(id)=>{
  if(get().busy||!get().cartId)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:'remove',cartId:get().cartId||undefined,lineIds:[id],attributes:cartAttributes(),tracking:shopifyTokens()}});
   set({cart,cartId:cart?.id||null});
   if(!cart)toast.info('A korábbi kosarad lejárt. Kérjük, válaszd ki újra a termékeket.');
  }catch{toast.error('A törlés nem sikerült.')}finally{set({busy:false})}
 }
}),{name:'cw_cart',partialize:s=>({cartId:s.cartId}),skipHydration:true}));
