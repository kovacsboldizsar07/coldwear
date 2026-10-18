import { createHmac, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin as db } from '@/integrations/supabase/client.server';
import { permissionAllows, MARKETING_NOTICE_VERSION } from './marketing-rules';

export function permissionReceipt(id: string) {
  const secret = process.env['CW_COLLECT_SIGNING_SECRET'];
  if (!secret) throw new Error('A hozzájárulás mentése most nem elérhető.');
  return `${id}.${createHmac('sha256', secret).update(`marketing:${id}`).digest('hex')}`;
}
export function receiptId(receipt: string) {
  const id = receipt.split('.')[0];
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const expected = permissionReceipt(id);
  return receipt.length === expected.length && timingSafeEqual(Buffer.from(receipt), Buffer.from(expected)) ? id : null;
}
export async function readPermission(receipt: string) {
  const id = receiptId(receipt);
  if (!id) return null;
  const { data, error } = await db.from('marketing_permissions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return permissionAllows(data) ? data : null;
}
export async function grantPermission(visitorId: string, userAgent: string, ip: string | null) {
  const id = crypto.randomUUID();
  const expires = new Date(); expires.setMonth(expires.getMonth() + 6);
  const { error } = await db.rpc('grant_marketing_permission',{p_id:id,p_visitor:visitorId,p_expires:expires.toISOString(),p_notice:MARKETING_NOTICE_VERSION,p_agent:userAgent,p_ip:ip||''});
  if (error) throw error;
  return { receipt: permissionReceipt(id), expires: expires.getTime() };
}
export async function revokePermission(receipt: string) {
  const id = receiptId(receipt);
  if (!id) throw new Error('Érvénytelen hozzájárulás.');
  const { error } = await db.rpc('revoke_marketing_permission', { p_id: id });
  if (error) throw error;
}
export async function sanitizeMarketingAttributes(attributes: { key: string; value: string }[]) {
  const permission = await readPermission(attributes.find(a => a.key === 'cw_permission')?.value ?? '');
  return attributes.map(a => a.key === 'cw_consent' ? { ...a, value: permission ? '1' : '0' } : !permission && a.key !== 'cw_angle' ? { ...a, value: '' } : a);
}