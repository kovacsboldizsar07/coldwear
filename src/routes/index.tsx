import { createFileRoute } from "@tanstack/react-router";
import { ThermoProductPage } from "@/components/coldwear/thermo-page";
import { pageHead, SHARE_IMAGE, SITE_URL, jsonLd } from "@/lib/seo";
import { getBundlePrices } from "@/lib/shopify.functions";

// Bundle prices are quoted on the server so the first HTML already shows them. Never block the page on Shopify.
const PRICE_TIMEOUT_MS = 2500;
const loadPrices = () =>
  Promise.race([
    getBundlePrices(),
    new Promise<[]>((resolve) => setTimeout(() => resolve([]), PRICE_TIMEOUT_MS)),
  ]).catch(() => []);

export const Route = createFileRoute("/")({
  loader: () => loadPrices(),
  staleTime: 5 * 60_000,
  head: () => ({
    ...pageHead(
      "ColdWear kesztyű: tartsd melegen a kezed, ne állj meg a hideg miatt.",
      "ColdWear téli kesztyű érintőképes ujjbegyekkel, csúszásgátló tenyérrel és vízlepergető felülettel. Méretválasztó és 14 napos pénzvisszafizetési garancia.",
      "/",
      SHARE_IMAGE,
    ),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "Product",
        name: "ColdWear kesztyű",
        description:
          "Érintőképes, szélálló téli kesztyű csúszásgátló tenyérrel és vízlepergető felülettel.",
        brand: { "@type": "Brand", name: "ColdWear" },
        url: `${SITE_URL}/`,
        image: SHARE_IMAGE,
      }),
    ],
  }),
  component: Page,
});

function Page() {
  return <ThermoProductPage prices={Route.useLoaderData()} />;
}
