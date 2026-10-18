import { createFileRoute, redirect } from '@tanstack/react-router';

// The contact page is hidden for now. The old URL stays alive for bookmarks,
// ads and search results, forwarding it with its hash and query string intact.
export const Route = createFileRoute('/kapcsolat')({
  beforeLoad: () => {
    throw redirect({ to: '/', hash: true, search: true, statusCode: 301 });
  },
});
