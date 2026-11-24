import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@shopify/hydrogen-react", async (original) => {
  const actual = await original<typeof import("@shopify/hydrogen-react")>();
  return { ...actual, sendShopifyAnalytics: vi.fn().mockResolvedValue(undefined) };
});

import { sendShopifyAnalytics } from "@shopify/hydrogen-react";
import {
  clearShopifyCookies,
  sendShopifyEvent,
  setShopifyShopId,
  shopifyTrackingTokens,
} from "@/lib/shopify-analytics";

const consented = { statistics: true, marketing: false };

describe("Shopify Analytics", () => {
  beforeEach(() => {
    vi.mocked(sendShopifyAnalytics).mockClear();
    clearShopifyCookies();
    setShopifyShopId("gid://shopify/Shop/1");
  });

  it("sends nothing without statistics or marketing consent", () => {
    sendShopifyEvent("PageView", "/", { statistics: false, marketing: false });
    expect(sendShopifyAnalytics).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("_shopify_y");
    expect(shopifyTrackingTokens({ statistics: false, marketing: false })).toBeUndefined();
  });

  it("sends nothing before the shop id is known", () => {
    setShopifyShopId("");
    sendShopifyEvent("PageView", "/", consented);
    expect(sendShopifyAnalytics).not.toHaveBeenCalled();
  });

  it("sends a page view with visit tokens after consent", () => {
    sendShopifyEvent("PageView", "/szallitas", consented);
    const event = vi.mocked(sendShopifyAnalytics).mock.calls[0]![0];
    expect(event.eventName).toBe("PAGE_VIEW");
    expect(event.payload).toMatchObject({
      hasUserConsent: true,
      shopId: "gid://shopify/Shop/1",
      currency: "HUF",
      pageType: "page",
      analyticsAllowed: true,
      marketingAllowed: false,
    });
    const tokens = shopifyTrackingTokens(consented);
    expect(tokens?.uniqueToken).toBeTruthy();
    expect(event.payload.uniqueToken).toBe(tokens?.uniqueToken);
  });

  it("sends add to cart with the cart and products", () => {
    sendShopifyEvent("AddToCart", "/", consented, {
      cartId: "gid://shopify/Cart/abc",
      products: [
        { productGid: "gid://shopify/Product/2", name: "Kesztyű", price: "8990", quantity: 2 },
      ],
    });
    const event = vi.mocked(sendShopifyAnalytics).mock.calls[0]![0];
    expect(event.eventName).toBe("ADD_TO_CART");
    expect(event.payload).toMatchObject({ cartId: "gid://shopify/Cart/abc", totalValue: 17980 });
  });

  it("ignores events Shopify does not track", () => {
    sendShopifyEvent("InitiateCheckout", "/", consented);
    sendShopifyEvent("ViewContent", "/", consented);
    expect(sendShopifyAnalytics).not.toHaveBeenCalled();
  });
});
