import { createHash } from 'node:crypto';
import { supabaseAdmin as db } from '@/integrations/supabase/client.server';
import type { Json } from '@/integrations/supabase/types';
import { permissionAllows, retryDelaySeconds, retryableResponse } from './marketing-rules';
export async function hash(value: string) { return createHash('sha256').update(value.trim().toLowerCase()).digest('hex'); }

export async function deliverCapi(eventId?: string) {
  const { data, error } = await db.rpc('claim_capi_delivery', eventId ? { p_event_id: eventId } : {});
  if (error) throw error;
  const job = data?.[0];
  if (!job) return;
  const permission = await db.from('marketing_permissions').select('revoked_at,expires_at').eq('id', job.consent_id).maybeSingle();
  if (permission.error) throw permission.error;
  if (!permissionAllows(permission.data)) {
    const suppressed = await db.from('capi_deliveries').update({ status: 'suppressed', event_payload: {}, last_error: 'consent_revoked' }).eq('event_id', job.event_id).eq('lease_token', job.lease_token ?? '');
    if (suppressed.error) throw suppressed.error;
    return;
  }
  let status = 0, received = 0, code: number | undefined, retry = true;
  const token = process.env['META_CAPI_TOKEN'], pixel = process.env['META_PIXEL_ID'];
  if (token && pixel) {
    try {
      const response = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pixel)}/events`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: token, data: [job.event_payload] }) });
      status = response.status;
      const result = await response.json() as { events_received?: number; error?: { code?: number; is_transient?: boolean } };
      received = response.ok ? result.events_received ?? 0 : 0;
      code = result.error?.code;
      retry = Boolean(result.error?.is_transient) || retryableResponse(status, code) || (response.ok && !received);
    } catch { retry = true; }
  }
  const logged = await db.from('capi_log').insert({ event_name: job.event_name, event_id: job.event_id, status_code: status, response: { events_received: received, error_code: code ?? null } });
  if (logged.error) throw logged.error;
  const now = new Date().toISOString();
  const updated = await db.from('capi_deliveries').update(received > 0 ? { status: 'sent', sent_at: now, event_payload: {}, lease_until: null, last_error: null } : { status: retry && job.attempts < 12 ? 'retry' : 'failed', next_attempt_at: new Date(Date.now() + retryDelaySeconds(job.attempts) * 1000).toISOString(), lease_until: null, last_error: token && pixel ? `meta_status_${status}_code_${code ?? 0}` : 'meta_not_configured' }).eq('event_id', job.event_id).eq('lease_token', job.lease_token ?? '').eq('status', 'sending');
  if (updated.error) throw updated.error;
  if (received && job.order_id) {
    const result = await db.from('orders').update({ capi_sent_at: now }).eq('id', job.order_id);
    if (result.error) throw result.error;
  }
}
export async function enqueueCapi(input: { name: string; id: string; consentId: string; time: number; user: Record<string, unknown>; custom: Record<string, unknown>; url: string; orderId?: string }) {
  const payload = JSON.parse(JSON.stringify({ event_name: input.name, event_id: input.id, event_time: input.time, action_source: 'website', event_source_url: input.url, user_data: input.user, custom_data: input.custom })) as Json;
  const { error } = await db.from('capi_deliveries').upsert({ event_id: input.id, event_name: input.name, order_id: input.orderId ?? null, consent_id: input.consentId, event_time: input.time, event_payload: payload }, { onConflict: 'event_id', ignoreDuplicates: true });
  if (error) throw error;
  await deliverCapi(input.id);
  const result = await db.from('capi_deliveries').select('status').eq('event_id', input.id).single();
  if (result.error) throw result.error;
  if (['pending', 'retry', 'sending'].includes(result.data.status)) throw new Error('CAPI delivery pending retry');
}
export async function retryCapiBatch() {
  // Sequential claims keep outbound concurrency bounded and each job independently leased.
  for (let i = 0; i < 5; i++) await deliverCapi();
  return { success: true };
}