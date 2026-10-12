export type Money = { amount: string; currencyCode: string };
export type Variant = { id: string; title: string; availableForSale: boolean; price: Money };
export type Product = { id: string; handle: string; title: string; description: string; variants: { nodes: Variant[] } };
export type Cart = { id: string; checkoutUrl: string; totalQuantity: number; cost: { totalAmount: Money; subtotalAmount: Money }; discountAllocations: { discountedAmount: Money }[]; lines: { nodes: { id: string; quantity: number; merchandise: Variant & { product: { title: string; handle: string } }; cost: { totalAmount: Money }; discountAllocations: { discountedAmount: Money }[] }[] } };
export const money = (value?: Money) => value ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: value.currencyCode, maximumFractionDigits: 0 }).format(Number(value.amount)) : '[ár]';
export const shippingRemaining = (count: number) => Math.max(0, 3 - count);
export function copyFirstSize(sizes: string[], index: number, value: string) { return index === 0 ? sizes.map((size, i) => i === 0 || !size ? value : size) : sizes.map((size, i) => i === index ? value : size); }
export function consentExpiry(now: Date) { const date = new Date(now); date.setMonth(date.getMonth() + 6); return date.getTime(); }
