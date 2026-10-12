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
- Keep the storefront shell shared and each information page as its own TanStack content route for navigation and metadata.
