<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Use a server-only Shopify module with fixed GraphQL operations and validated server functions; credentials must not enter browser bundles.
- Keep all cart totals and discounts as Shopify response data; Zustand persists only cart identity and refreshes server state.
- Keep shipping eligibility in a shared pure module using Shopify's discounted merchandise total; eligibility is not proof of an applied delivery discount.
- Store analytics and mirrored commerce records in Cloud with admin-only reads and validated server-only writes.
- Persist CAPI events with stable event identity and occurrence time, atomically lease delivery/webhook retries, and check signed server-recorded marketing permission before each send; this prevents failed delivery loss and stale checkout consent from authorizing uploads.
- Recover Purchase delivery through Shopify's signed webhook redelivery by returning a retryable failure while delivery is pending; do not run a permanent polling schedule for an otherwise idle queue.
- Record marketing acceptance separately from revocation and synchronize refusal across browser tabs and Shopify cart attributes; pending withdrawal receipts are retried before checkout synchronization so checkout snapshots do not override current server permission.
- Keep the storefront shell shared and each information page as its own TanStack content route for navigation and metadata.
- Keep the glove FAQ in a dedicated presentation component using the shared accessible accordion; this keeps long-form answers out of the purchase panel without duplicating controls.
