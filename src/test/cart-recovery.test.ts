import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { mutateCart } from '@/lib/shopify.server';

describe('Shopify missing cart classification',()=>{
 beforeEach(()=>vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN','unit-test-only'));
 afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()});
 for(const operation of ['add','update','remove','attributes','discounts'] as const){
  it(`${operation} returns null for a confirmed missing cart`,async()=>{
   vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({data:{mutation:{cart:null,userErrors:[{message:'The specified cart does not exist.'}]}}}))));
   expect(await mutateCart(operation,{cartId:'expired'})).toBeNull();
  });
 }
 it('does not classify unrelated user errors as an expired cart',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({data:{mutation:{cart:null,userErrors:[{message:'Invalid merchandise.'}]}}}))));
  await expect(mutateCart('add',{cartId:'valid'})).rejects.toThrow('Invalid merchandise.');
 });
 it('does not hide network failures or retry them',async()=>{
  const fetch=vi.fn().mockRejectedValue(new Error('Network unavailable'));
  vi.stubGlobal('fetch',fetch);
  await expect(mutateCart('add',{cartId:'valid'})).rejects.toThrow('Network unavailable');
  expect(fetch).toHaveBeenCalledTimes(1);
 });
});