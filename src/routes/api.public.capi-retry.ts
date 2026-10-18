import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
export const Route = createFileRoute('/api/public/capi-retry')({ server: { handlers: { POST: async ({ request }) => {
  const failure = await authenticateCronRequest(request);
  if (failure) return failure;
  const { retryCapiBatch } = await import('@/lib/capi-delivery.server');
  await retryCapiBatch();
  return Response.json({ success: true });
} } } });