import { describe, expect, it } from 'vitest';
import { attachTestCode, PURCHASE_TEST_WINDOW_END } from '@/lib/marketing-rules';
describe('temporary Purchase test window', () => {
  it('sends Purchase as test inside the window', () => expect(attachTestCode('Purchase', false, PURCHASE_TEST_WINDOW_END - 1)).toBe(true));
  it('stops automatically after the window', () => expect(attachTestCode('Purchase', false, PURCHASE_TEST_WINDOW_END)).toBe(false));
  it('never affects other events', () => expect(attachTestCode('AddToCart', false, PURCHASE_TEST_WINDOW_END - 1)).toBe(false));
  it('keeps Shopify test orders as test', () => expect(attachTestCode('Purchase', true, PURCHASE_TEST_WINDOW_END + 1)).toBe(true));
});
