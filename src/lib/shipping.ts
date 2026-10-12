import type { Money } from './commerce';

export const FREE_SHIPPING_AMOUNT = 17000;
export const FREE_SHIPPING_QUANTITY = 3;

/** Qualification only; actual delivery prices and discounts remain Shopify's responsibility. */
export function shippingStatus(quantity: number, merchandiseTotal: Money) {
  const amount = Number(merchandiseTotal.amount);
  const validAmount = merchandiseTotal.currencyCode === 'HUF' && Number.isFinite(amount);
  const amountRemaining = validAmount ? Math.max(0, FREE_SHIPPING_AMOUNT - amount) : null;
  const itemsRemaining = Math.max(0, FREE_SHIPPING_QUANTITY - quantity);
  return {
    eligible: itemsRemaining === 0 || amountRemaining === 0,
    amountRemaining,
    itemsRemaining,
    progress: Math.min(1, Math.max(quantity / FREE_SHIPPING_QUANTITY, validAmount ? amount / FREE_SHIPPING_AMOUNT : 0)),
  };
}