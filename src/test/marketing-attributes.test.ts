import { beforeEach,describe,expect,it,vi } from 'vitest';
const mocks=vi.hoisted(()=>({from:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:mocks}));
import { sanitizeMarketingAttributes } from '@/lib/marketing-permission.server';
describe('Shopify marketing attribute cleanup',()=>{
 beforeEach(()=>vi.clearAllMocks());
 it('clears every identifier even when the caller omits stale Shopify attributes',async()=>{
  const attributes=await sanitizeMarketingAttributes([{key:'cw_angle',value:'bike'}]);
  expect(attributes).toContainEqual({key:'cw_consent',value:'0'});
  for(const key of ['cw_permission','cw_fbp','cw_fbc','cw_fbclid','cw_gclid','cw_ttclid','cw_utm_source','cw_utm_medium','cw_utm_campaign','cw_utm_content'])expect(attributes).toContainEqual({key,value:''});
  expect(attributes).toContainEqual({key:'cw_angle',value:'bike'});
 });
 it('cannot authorize marketing with the client consent flag alone',async()=>{
  const attributes=await sanitizeMarketingAttributes([{key:'cw_consent',value:'1'},{key:'cw_fbp',value:'test-cookie'}]);
  expect(attributes).toContainEqual({key:'cw_consent',value:'0'});
  expect(attributes).toContainEqual({key:'cw_fbp',value:''});
  expect(mocks.from).not.toHaveBeenCalled();
 });
});