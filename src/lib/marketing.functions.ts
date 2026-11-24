import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
export const grantMarketing = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ visitorId: z.string().uuid(), noticeVersion: z.literal('coldwear-meta-2026-10-18') }))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Érvénytelen kérés.');
    const { grantPermission } = await import('./marketing-permission.server');
    return grantPermission(data.visitorId, (request.headers.get('user-agent') ?? '').slice(0, 1024), request.headers.get('cf-connecting-ip')||request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||null);
  });
export const withdrawMarketing = createServerFn({ method: 'POST' })
  .inputValidator(z.string().max(200))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Érvénytelen kérés.');
    const { revokePermission, receiptId } = await import('./marketing-permission.server');
    // A receipt this server never signed (e.g. one stored by the old site) has nothing to revoke here.
    if (!receiptId(data)) return { success: true };
    await revokePermission(data);
    return { success: true };
  });// Confirms that a stored marketing receipt is still honoured by the server (signed with the current key, not revoked or expired).
export const checkMarketing = createServerFn({ method: 'POST' })
  .inputValidator(z.string().max(200))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Érvénytelen kérés.');
    const { readPermission } = await import('./marketing-permission.server');
    return { valid: Boolean(await readPermission(data)) };
  });
