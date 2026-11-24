import { createServerFn } from "@tanstack/react-start";
// Public, non-secret site settings read from Worker env at request time.
// CF_WEB_ANALYTICS_TOKEN: Cloudflare Web Analytics site token (cookieless visit counter, no consent needed).
export const getSiteConfig = createServerFn({ method: "GET" }).handler(async () => ({
  webAnalyticsToken: process.env["CF_WEB_ANALYTICS_TOKEN"] || "",
}));
