import {
  AnalyticsEventName,
  AnalyticsPageType,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from "@shopify/hydrogen-react";

// Shopify Analytics for this headless storefront: page views, product views and add-to-carts land in the Shopify admin
// (Analytics → Reports, "Headless" sales channel). Sent only after the visitor accepted statistics or marketing cookies.

export type ShopifyProduct = {
  productGid: string;
  variantGid?: string;
  name: string;
  variantName?: string;
  price: string;
  quantity?: number;
};
export type ShopifyExtra = { products?: ShopifyProduct[] | undefined; cartId?: string | undefined };
export type ShopifyConsent = { statistics: boolean; marketing: boolean };

const UNIQUE = "_shopify_y";
const VISIT = "_shopify_s";
const YEAR = 365 * 24 * 60 * 60;
const HALF_HOUR = 30 * 60;
let shopId = "";

export function setShopifyShopId(id: string) {
  shopId = id;
}

function readCookie(name: string) {
  return (
    document.cookie
      .split("; ")
      .find((x) => x.startsWith(`${name}=`))
      ?.slice(name.length + 1) || ""
  );
}
function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

/** Visitor (1 year) and visit (30 minutes, sliding) identifiers Shopify uses to count sessions. */
function ensureTokens() {
  const unique = readCookie(UNIQUE) || crypto.randomUUID();
  const visit = readCookie(VISIT) || crypto.randomUUID();
  writeCookie(UNIQUE, unique, YEAR);
  writeCookie(VISIT, visit, HALF_HOUR);
  return { uniqueToken: unique, visitToken: visit };
}

/** Tokens to pass on cart requests so Shopify links the checkout to the visit; empty without consent. */
export function shopifyTrackingTokens(consent: ShopifyConsent | null) {
  if (!consent?.statistics && !consent?.marketing) return undefined;
  const uniqueToken = readCookie(UNIQUE),
    visitToken = readCookie(VISIT);
  return uniqueToken && visitToken ? { uniqueToken, visitToken } : undefined;
}

export function clearShopifyCookies() {
  for (const name of [UNIQUE, VISIT]) document.cookie = `${name}=; Max-Age=0; path=/`;
}

function pageType(path: string) {
  if (path === "/" || path === "/thermo-kesztyu" || path.startsWith("/product/"))
    return AnalyticsPageType.product;
  return AnalyticsPageType.page;
}

export function sendShopifyEvent(
  name: string,
  path: string,
  consent: ShopifyConsent,
  extra: ShopifyExtra = {},
) {
  if (!shopId || (!consent.statistics && !consent.marketing)) return;
  const eventName =
    name === "PageView"
      ? AnalyticsEventName.PAGE_VIEW
      : name === "ViewContent" && extra.products?.length
        ? AnalyticsEventName.PRODUCT_VIEW
        : name === "AddToCart" && extra.cartId
          ? AnalyticsEventName.ADD_TO_CART
          : null;
  if (!eventName) return;
  ensureTokens();
  const products = extra.products?.map((p) => ({
    ...p,
    brand: "ColdWear",
    quantity: p.quantity ?? 1,
  }));
  const payload = {
    ...getClientBrowserParameters(),
    hasUserConsent: true,
    shopId,
    currency: "HUF" as const,
    acceptedLanguage: "HU" as const,
    shopifySalesChannel: "headless" as const,
    analyticsAllowed: true,
    marketingAllowed: consent.marketing,
    saleOfDataAllowed: consent.marketing,
    gdprEnforced: true,
    pageType: pageType(path),
    ...(products
      ? { products, totalValue: products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0) }
      : {}),
    ...(extra.cartId ? { cartId: extra.cartId } : {}),
  };
  void sendShopifyAnalytics({ eventName, payload } as Parameters<
    typeof sendShopifyAnalytics
  >[0]).catch(() => {
    /* analytics is best effort */
  });
}
