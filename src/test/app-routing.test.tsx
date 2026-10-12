import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as OldSalesPage } from "@/routes/thermo-kesztyu";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("serves the product page at / and still resolves the old sales-page URL", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/").at(-1)?.routeId).toBe("/");
    expect(router.matchRoutes("/thermo-kesztyu").at(-1)?.routeId).toBe("/thermo-kesztyu");
  });

  it("forwards the old sales-page URL to the homepage permanently", () => {
    let forwarded: unknown;
    try {
      (OldSalesPage.options.beforeLoad as () => void)();
    } catch (redirected) {
      forwarded = redirected;
    }

    const response = forwarded as { status?: number; options?: { to?: string } };
    expect(response?.options?.to).toBe("/");
    expect(response?.status).toBe(301);
  });
});
