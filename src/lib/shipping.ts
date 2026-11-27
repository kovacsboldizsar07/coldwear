export const FREE_SHIPPING_QUANTITY = 3;
export const SHIPPING_FEE_HUF = 990;

/**
 * Qualification only: Shopify applies the free shipping itself through the automatic
 * "Ingyenes szállítás 3 terméktől" discount (minimum 3 items, socks included).
 */
export function shippingStatus(quantity: number) {
  const itemsRemaining = Math.max(0, FREE_SHIPPING_QUANTITY - quantity);
  return {
    eligible: itemsRemaining === 0,
    itemsRemaining,
    progress: Math.min(1, Math.max(0, quantity / FREE_SHIPPING_QUANTITY)),
  };
}
