import { createFileRoute, redirect } from '@tanstack/react-router';

// The sales page now lives at "/". This keeps the old URL alive for bookmarks,
// ads and search results, forwarding it with its hash and query string intact.
export const Route = createFileRoute('/thermo-kesztyu')({
  beforeLoad: () => {
    throw redirect({ to: '/', hash: true, search: true, statusCode: 301 });
  },
});
