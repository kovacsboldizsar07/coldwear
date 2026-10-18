import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { permissionAllows, retryDelaySeconds, retryableResponse, purchaseEventId, webhookNeedsRetry } from '@/lib/marketing-rules';
describe('marketing permission and durable retries', () => {
  it('refusal suppresses sending even when checkout previously accepted', () => expect(permissionAllows({ revoked_at: '2026-10-18T10:00:00Z', expires_at: '2027-04-18T10:00:00Z' }, Date.parse('2026-10-18T11:00:00Z'))).toBe(false));
  it('missing permission cannot authorize Purchase', () => expect(permissionAllows(null)).toBe(false));
  it('expired acceptance cannot authorize delayed sending', () => expect(permissionAllows({ revoked_at: null, expires_at: '2026-10-18T10:00:00Z' }, Date.parse('2026-10-18T10:00:00Z'))).toBe(false));
  it('current recorded acceptance authorizes sending', () => expect(permissionAllows({ revoked_at: null, expires_at: '2027-04-18T10:00:00Z' }, Date.parse('2026-10-18T11:00:00Z'))).toBe(true));
  it('keeps one Purchase identity on every retry', () => { expect(purchaseEventId('12345')).toBe('shopify_order_12345'); expect(purchaseEventId('12345')).not.toBe(purchaseEventId('12346')); });
  it('failed and processing webhooks must not be acknowledged as completed', () => { expect(webhookNeedsRetry('error')).toBe(true); expect(webhookNeedsRetry('processing')).toBe(true); expect(webhookNeedsRetry('completed')).toBe(false); });
  it('backs off retry traffic with a bounded wait', () => { expect(retryDelaySeconds(1)).toBe(60); expect(retryDelaySeconds(2)).toBe(120); expect(retryDelaySeconds(12)).toBe(3600); });
  it('network and rate limiting failures are retried, invalid credentials are flagged', () => { expect(retryableResponse(0)).toBe(true); expect(retryableResponse(429)).toBe(true); expect(retryableResponse(503)).toBe(true); expect(retryableResponse(400, 190)).toBe(false); });
});

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), fetch: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: mocks }));
import { deliverCapi } from '@/lib/capi-delivery.server';
describe('leased delivery', () => {
  it.each([true,false])('uses TEST136 only for a Shopify test order (%s)',async(testOrder)=>{
    vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-10-19T00:00:00Z'));
    vi.stubEnv('META_CAPI_TOKEN','test-only-credential');vi.stubEnv('META_PIXEL_ID','test-only-pixel');vi.stubEnv('META_CAPI_TEST_EVENT_CODE','TEST136');
    const payload={event_name:'Purchase',event_id:'shopify_order_test',event_time:1792314000,...(testOrder?{_shopify_test_order:true}:{})};
    mocks.rpc.mockResolvedValue({data:[{event_id:'shopify_order_test',event_name:'Purchase',event_payload:payload,consent_id:'permission',lease_token:'lease',attempts:1}],error:null});
    const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),maybeSingle:vi.fn().mockResolvedValue({data:{revoked_at:null,expires_at:new Date(Date.now()+86400000).toISOString()},error:null}),insert:vi.fn().mockResolvedValue({error:null}),update:vi.fn().mockReturnThis(),then:(resolve:(value:unknown)=>void)=>resolve({error:null})};mocks.from.mockReturnValue(query);
    mocks.fetch.mockResolvedValue({status:200,ok:true,json:async()=>({events_received:1})});
    await deliverCapi('shopify_order_test');
    const submitted=JSON.parse(mocks.fetch.mock.calls[0]?.[1]?.body);
    expect(submitted.test_event_code).toBe(testOrder?'TEST136':undefined);
    expect(submitted.data[0]).not.toHaveProperty('_shopify_test_order');
  });
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', mocks.fetch); });
  afterEach(()=>{vi.useRealTimers();vi.unstubAllEnvs();vi.unstubAllGlobals();});
  it('does not send when another worker owns the event lease', async () => { mocks.rpc.mockResolvedValue({ data: [], error: null }); await deliverCapi('shopify_order_12345'); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('does not send after permission was withdrawn between claim and send', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ event_id: 'shopify_order_12345', consent_id: 'permission', lease_token: 'lease' }], error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { revoked_at: '2026-10-18T10:00:00Z', expires_at: '2027-04-18T10:00:00Z' }, error: null }), update: vi.fn().mockReturnThis(), then: (resolve: (value: unknown) => void) => resolve({ error: null }) };
    mocks.from.mockReturnValue(query);
    await deliverCapi('shopify_order_12345');
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'suppressed' }));
  });
  it('stores a retry after a temporary provider failure without changing Purchase identity or time',async()=>{
    vi.stubEnv('META_CAPI_TOKEN','test-only-credential');vi.stubEnv('META_PIXEL_ID','test-only-pixel');
    const payload={event_name:'Purchase',event_id:'shopify_order_12345',event_time:1792314000,custom_data:{value:18990,currency:'HUF'}};
    mocks.rpc.mockResolvedValue({data:[{event_id:'shopify_order_12345',event_name:'Purchase',event_time:1792314000,event_payload:payload,consent_id:'permission',lease_token:'lease',attempts:2}],error:null});
    const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),maybeSingle:vi.fn().mockResolvedValue({data:{revoked_at:null,expires_at:new Date(Date.now()+86400000).toISOString()},error:null}),insert:vi.fn().mockResolvedValue({error:null}),update:vi.fn().mockReturnThis(),then:(resolve:(value:unknown)=>void)=>resolve({error:null})};mocks.from.mockReturnValue(query);
    mocks.fetch.mockResolvedValue({status:503,ok:false,json:async()=>({error:{code:2}})});
    await deliverCapi('shopify_order_12345');
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({status:'retry',last_error:'meta_status_503_code_2'}));
    const submitted=JSON.parse(mocks.fetch.mock.calls[0]?.[1]?.body);
    expect(submitted.data).toEqual([payload]);
    expect(query.update.mock.calls.some(([value])=>'event_time' in value||'event_id' in value)).toBe(false);
  });
});