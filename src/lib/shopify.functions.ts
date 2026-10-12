import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
const line = z.object({merchandiseId:z.string().startsWith('gid://shopify/ProductVariant/').max(160),quantity:z.number().int().min(1).max(20)});
const attribute = z.object({key:z.string().startsWith('cw_').max(40),value:z.string().max(512)});
export const getCatalog = createServerFn({method:'GET'}).handler(async()=>{ const api=await import('./shopify.server'); return api.catalog(); });
export const getQuote = createServerFn({method:'POST'}).inputValidator(z.array(line).min(1).max(4)).handler(async({data})=>{ const api=await import('./shopify.server'); return api.quote(data); });
export const getCart = createServerFn({method:'POST'}).inputValidator(z.string().min(1).max(500)).handler(async({data})=>{ const api=await import('./shopify.server'); return api.readCart(data); });
export const changeCart = createServerFn({method:'POST'}).inputValidator(z.object({operation:z.enum(['create','add','update','remove','attributes']),cartId:z.string().max(500).optional(),lines:z.array(line.extend({id:z.string().max(500).optional()})).max(10).optional(),lineIds:z.array(z.string().max(500)).max(10).optional(),attributes:z.array(attribute).max(15)})).handler(async({data})=>{
 const api=await import('./shopify.server');
 if(data.operation!=='create'&&!data.cartId) throw new Error('Hiányzó kosár.');
 if(['create','add','update'].includes(data.operation)&&!data.lines?.length) throw new Error('Hiányzó termék.');
 if(data.operation==='remove'&&!data.lineIds?.length) throw new Error('Hiányzó tétel.');
 let cart=await api.mutateCart(data.operation,data.operation==='create'?{input:{lines:data.lines,attributes:data.attributes,buyerIdentity:{countryCode:'HU'}}}:{cartId:data.cartId,lines:data.lines,lineIds:data.lineIds,attributes:data.attributes});
 if(cart && data.operation!=='create'&&data.operation!=='attributes') cart=await api.mutateCart('attributes',{cartId:cart.id,attributes:data.attributes});
 return cart;
});
