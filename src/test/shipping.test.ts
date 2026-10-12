import { describe, expect, it } from 'vitest';
import { shippingStatus } from '@/lib/shipping';

const huf = (amount: number) => ({ amount: String(amount), currencyCode: 'HUF' });
describe('free shipping: 3 products OR 17 000 Ft', () => {
  it('qualifies at exactly three products, including socks', () => expect(shippingStatus(3, huf(15970)).eligible).toBe(true));
  it('qualifies at exactly 17 000 Ft with fewer than three products', () => expect(shippingStatus(2, huf(17000)).eligible).toBe(true));
  it('does not qualify below both conditions', () => expect(shippingStatus(2, huf(16999)).eligible).toBe(false));
  it('shows 2 010 Ft remaining for the 14 990 Ft bundle', () => expect(shippingStatus(2, huf(14990)).amountRemaining).toBe(2010));
  it('shows one remaining product for two gloves', () => expect(shippingStatus(2, huf(14990)).itemsRemaining).toBe(1));
  it('revokes qualification after quantity and value drop', () => {
    expect(shippingStatus(3, huf(17980)).eligible).toBe(true);
    expect(shippingStatus(2, huf(14990)).eligible).toBe(false);
  });
  it('does not treat another currency as forints', () => expect(shippingStatus(1, { amount: '17000', currencyCode: 'EUR' }).eligible).toBe(false));
});