import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { changeCart } from '@/lib/shopify.functions';
import { cartAttributes,track,waitForConsentSync } from '@/lib/track';
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
   const cart=await changeCart({data:{operation:'attributes',cartId:id,attributes:cartAttributes()}});
   set({cart,cartId:cart?.id||null});
  }catch{toast.error('A kosár frissítése nem sikerült. Próbáld újra.')}finally{set({busy:false})}
 },
 add:async(lines)=>{
  if(get().busy)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:get().cartId?'add':'create',cartId:get().cartId||undefined,lines,attributes:cartAttributes()}});
   set({cart,cartId:cart?.id||null});
   if(!cart){toast.error('Nem sikerült a kosár létrehozása. Próbáld újra.');return}
   set({open:true});
   track('AddToCart',{value:Number(cart.cost.totalAmount.amount),currency:cart.cost.totalAmount.currencyCode});
  }catch{toast.error('Nem sikerült a kosárba helyezés. Próbáld újra.')}finally{set({busy:false})}
 },
 update:async(id,merchandiseId,quantity)=>{
  if(quantity<=0)return get().remove(id);
  if(get().busy||!get().cartId)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:'update',cartId:get().cartId||undefined,lines:[{id,merchandiseId,quantity}],attributes:cartAttributes()}});
   set({cart,cartId:cart?.id||null});
   if(!cart)toast.info('A korábbi kosarad lejárt. Kérjük, válaszd ki újra a termékeket.');
  }catch{toast.error('A módosítás nem sikerült.')}finally{set({busy:false})}
 },
 remove:async(id)=>{
  if(get().busy||!get().cartId)return;
  set({busy:true});
  try{
   await waitForConsentSync();
   const cart=await changeCart({data:{operation:'remove',cartId:get().cartId||undefined,lineIds:[id],attributes:cartAttributes()}});
   set({cart,cartId:cart?.id||null});
   if(!cart)toast.info('A korábbi kosarad lejárt. Kérjük, válaszd ki újra a termékeket.');
  }catch{toast.error('A törlés nem sikerült.')}finally{set({busy:false})}
 }
}),{name:'cw_cart',partialize:s=>({cartId:s.cartId}),skipHydration:true}));
