import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({enqueue:vi.fn(),permission:vi.fn(),from:vi.fn(),rpc:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:mocks.from,rpc:mocks.rpc}}));
vi.mock('@/lib/marketing-permission.server',()=>({readPermission:mocks.permission}));
vi.mock('@/lib/capi-delivery.server',()=>({enqueueCapi:mocks.enqueue,hash:vi.fn(async()=> 'test-only-hash')}));
import { processWebhook } from '@/lib/webhook.server';
const order={id:12345,created_at:'2026-10-18T09:00:00Z',total_price:'18990',subtotal_price:'18990',currency:'HUF',line_items:[{title:'Thermo kesztyű',quantity:3,price:'8990'}],note_attributes:[{name:'cw_consent',value:'1'},{name:'cw_permission',value:'test-receipt'}]};
describe('Purchase webhook recovery',()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.from.mockReturnValue({upsert:vi.fn().mockResolvedValue({error:null})});mocks.rpc.mockResolvedValue({error:null});mocks.permission.mockResolvedValue({id:'permission',visitor_id:'visitor',user_agent:'test-browser',client_ip:null});mocks.enqueue.mockResolvedValue(undefined);});
 it('redelivery after failure keeps the original Purchase time, identity, value and currency',async()=>{
  mocks.enqueue.mockRejectedValueOnce(new Error('CAPI delivery pending retry'));
  await expect(processWebhook('orders/create',order)).rejects.toThrow('pending retry');
  await expect(processWebhook('orders/create',order)).resolves.toBeUndefined();
  const first=mocks.enqueue.mock.calls[0]?.[0],second=mocks.enqueue.mock.calls[1]?.[0];
  expect(first).toEqual(second);
  expect(second).toMatchObject({id:'shopify_order_12345',time:1792314000,custom:{value:18990,currency:'HUF'}});
 });
 it('revoked receipt suppresses Purchase even with accepted Shopify snapshot',async()=>{
  mocks.permission.mockResolvedValue(null);
  await processWebhook('orders/create',order);
  expect(mocks.enqueue).not.toHaveBeenCalled();
 });
 it('replaces mirrored items atomically on webhook redelivery',async()=>{
  await processWebhook('orders/create',order);
  expect(mocks.rpc).toHaveBeenCalledWith('replace_mirrored_order_items',{p_order:'12345',p_items:[{product_title:'Thermo kesztyű',variant_title:null,sku:null,quantity:3,price:8990,discount:0}]});
 });
 it('withdrawn marketing permission removes abandoned-checkout attribution',async()=>{
  mocks.permission.mockResolvedValue(null);
  const upsert=vi.fn().mockResolvedValue({error:null});mocks.from.mockReturnValue({upsert});
  await processWebhook('checkouts/update',{id:12345,total_price:'18990',updated_at:order.created_at,note_attributes:[{name:'cw_utm_source',value:'facebook'},{name:'cw_permission',value:'test-receipt'}]});
  expect(upsert).toHaveBeenCalledWith(expect.objectContaining({utm_source:null}));
 });
});