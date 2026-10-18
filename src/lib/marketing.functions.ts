import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
export const grantMarketing = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ visitorId: z.string().uuid(), noticeVersion: z.literal('coldwear-meta-2026-10-18') }))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Érvénytelen kérés.');
    const { grantPermission } = await import('./marketing-permission.server');
    return grantPermission(data.visitorId, (request.headers.get('user-agent') ?? '').slice(0, 1024), request.headers.get('cf-connecting-ip'));
  });
export const withdrawMarketing = createServerFn({ method: 'POST' })
  .inputValidator(z.string().max(200))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new Error('Érvénytelen kérés.');
    const { revokePermission } = await import('./marketing-permission.server');
    await revokePermission(data);
    return { success: true };
  });