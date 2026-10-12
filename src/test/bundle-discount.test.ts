import { describe, expect, it } from 'vitest';
import { bundleCode } from '@/lib/shopify.server';
import type { Cart } from '@/lib/commerce';

const cart = (gloves: number, socks: number) => ({
  lines: { nodes: [
    ...(gloves ? [{ quantity: gloves, merchandise: { product: { title: 'ColdWear Thermo kesztyű' } } }] : []),
    ...(socks ? [{ quantity: socks, merchandise: { product: { title: 'ColdWear Thermo zokni' } } }] : []),
  ] },
}) as unknown as Cart;

describe('csomagkedvezmény', () => {
  it('1 kesztyűre nincs kedvezmény', () => expect(bundleCode(cart(1, 0))).toBeNull());
  it('2 kesztyű a 14 990 Ft-os kódot kapja', () => expect(bundleCode(cart(2, 0))).toBe('CW-CSOMAG2'));
  it('3 kesztyű + zokni a 18 990 Ft-os kódot kapja', () => expect(bundleCode(cart(3, 1))).toBe('CW-CSOMAG3'));
  it('3 kesztyű zokni nélkül nem kapja a zoknis csomagkódot', () => expect(bundleCode(cart(3, 0))).not.toBe('CW-CSOMAG3'));
});
