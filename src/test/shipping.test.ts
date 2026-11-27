import { describe, expect, it } from 'vitest';
import { shippingStatus } from '@/lib/shipping';

describe('free shipping from 3 products', () => {
  it('qualifies at exactly three products, including socks', () => expect(shippingStatus(3).eligible).toBe(true));
  it('does not qualify for the 2-pair bundle', () => expect(shippingStatus(2).eligible).toBe(false));
  it('shows one remaining product for two gloves', () => expect(shippingStatus(2).itemsRemaining).toBe(1));
  it('shows two remaining products for one glove', () => expect(shippingStatus(1).itemsRemaining).toBe(2));
  it('caps progress at 1', () => expect(shippingStatus(5).progress).toBe(1));
});
