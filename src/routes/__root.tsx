import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { StoreShell } from "@/components/coldwear/store-shell";
import appCss from "../styles.css?url";
import { getSiteConfig } from "@/lib/site-config.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Ez az oldal nem található</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lehet, hogy elírás van a címben, vagy az oldal már nem létezik.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-bold text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Az oldal nem töltődött be
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hiba történt nálunk. Próbáld újra, vagy menj vissza a főoldalra.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-bold text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Újrapróbálom
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 font-bold text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Vissza a főoldalra
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Loaded once per document; a failure must never block the page.
  loader: async () => getSiteConfig().catch(() => ({ webAnalyticsToken: "" })),
  staleTime: Infinity,
  head: ({ loaderData }) => ({
    // Cloudflare Web Analytics: cookieless visit counter, the denominator for conversion rate.
    scripts: loaderData?.webAnalyticsToken
      ? [
          {
            src: "https://static.cloudflareinsights.com/beacon.min.js",
            defer: true,
            "data-cf-beacon": JSON.stringify({ token: loaderData.webAnalyticsToken, spa: true }),
          },
        ]
      : [],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:site_name", content: "ColdWear" },
      { property: "og:locale", content: "hu_HU" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <StoreShell><Outlet /></StoreShell> breaks all child routes. */}
      <StoreShell>
        <Outlet />
      </StoreShell>
    </QueryClientProvider>
  );
}
