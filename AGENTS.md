## Hosting
- The app runs on Cloudflare Workers (nitro `cloudflare-module` preset, see vite.config.ts) and uses the owner's own Supabase project. It no longer depends on Lovable; do not reintroduce `@lovable.dev/*` packages or `/__l5e/` asset URLs. Images live in `src/assets/` and are imported directly.

## Architecture
- Keep canonical URLs and share metadata in a browser-safe SEO helper used by leaf routes only; product offers must come from Shopify data, never estimated stock or invented reviews.
- Use a server-only Shopify module with fixed GraphQL operations and validated server functions; credentials must not enter browser bundles.
- Keep all cart totals and discounts as Shopify response data; Zustand persists only cart identity and refreshes server state.
- Treat confirmed missing Shopify carts as null, recreate only on explicit add, and clear stale state on other actions; never retry ambiguous mutation failures because they may duplicate items.
- Keep shipping eligibility in a shared pure module using Shopify's discounted merchandise total; eligibility is not proof of an applied delivery discount.
- Store analytics and mirrored commerce records in Cloud with admin-only reads and validated server-only writes.
- Persist CAPI events with stable event identity and occurrence time, atomically lease delivery/webhook retries, and check signed server-recorded marketing permission before each send; this prevents failed delivery loss and stale checkout consent from authorizing uploads.
- Recover Purchase delivery through Shopify's signed webhook redelivery by returning a retryable failure while delivery is pending; do not run a permanent polling schedule for an otherwise idle queue.
- Attach the server-configured Meta test code only to signed Shopify orders marked test; keep the internal test marker out of Meta event data so ordinary orders remain production events.
- Record marketing acceptance separately from revocation and synchronize refusal across browser tabs and Shopify cart attributes; pending withdrawal receipts are retried before checkout synchronization so checkout snapshots do not override current server permission.
- Keep the storefront shell shared and each information page as its own TanStack content route for navigation and metadata.
- Keep the glove FAQ in a dedicated presentation component using the shared accessible accordion; this keeps long-form answers out of the purchase panel without duplicating controls.

- Keep storefront two-column purchase/calculator layouts at the large-screen breakpoint, and use shrinkable grid tracks for mixed text and controls; tablet widths need the same uncramped flow as phones.
