export const MARKETING_NOTICE_VERSION = 'coldwear-meta-2026-10-18';
export type Permission = { revoked_at: string | null; expires_at: string };
export function permissionAllows(permission: Permission | null, now = Date.now()) {
  return Boolean(permission && !permission.revoked_at && Date.parse(permission.expires_at) > now);
}
export function retryDelaySeconds(attempt: number) {
  return Math.min(3600, 60 * 2 ** Math.max(0, attempt - 1));
}
export function retryableResponse(status: number, code?: number) {
  return status === 0 || status === 429 || status >= 500 || [1, 2, 4, 17, 32, 613].includes(code ?? -1);
}
export function webhookNeedsRetry(status: string | null) {
  return status !== 'completed';
}
export function purchaseEventId(orderId: string) { return `shopify_order_${orderId}`; }