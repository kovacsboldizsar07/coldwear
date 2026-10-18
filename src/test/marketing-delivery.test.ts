import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', mocks.fetch); });
  it('does not send when another worker owns the event lease', async () => { mocks.rpc.mockResolvedValue({ data: [], error: null }); await deliverCapi('shopify_order_12345'); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('does not send after permission was withdrawn between claim and send', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ event_id: 'shopify_order_12345', consent_id: 'permission', lease_token: 'lease' }], error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { revoked_at: '2026-10-18T10:00:00Z', expires_at: '2027-04-18T10:00:00Z' }, error: null }), update: vi.fn().mockReturnThis(), then: (resolve: (value: unknown) => void) => resolve({ error: null }) };
    mocks.from.mockReturnValue(query);
    await deliverCapi('shopify_order_12345');
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'suppressed' }));
  });
});