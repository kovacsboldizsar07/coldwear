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
  it('1 kesztyűre nincs kedvezmény', () => expect(bundleCode(cart(1, 0), false)).toBeNull());
  it('2 kesztyű a 14 990 Ft-os kódot kapja', () => expect(bundleCode(cart(2, 0), false)).toBe('CW-CSOMAG2'));
  it('3 kesztyű + zokni a 18 990 Ft-os kódot kapja', () => expect(bundleCode(cart(3, 1), false)).toBe('CW-CSOMAG3'));
  it('3 kesztyű zokni nélkül nem kapja a zoknis csomagkódot', () => expect(bundleCode(cart(3, 0), false)).not.toBe('CW-CSOMAG3'));
});

describe('csomagkedvezmény az ajándékos akció alatt', () => {
  it('3 kesztyű zokni nélkül is a 18 990 Ft-os ajándékos kódot kapja', () => expect(bundleCode(cart(3, 0), true)).toBe('CW-CSOMAG3-AJANDEK'));
  it('3 kesztyű + zokni is az ajándékos kódot kapja', () => expect(bundleCode(cart(3, 1), true)).toBe('CW-CSOMAG3-AJANDEK'));
  it('2 kesztyű marad a 14 990 Ft-os kódon', () => expect(bundleCode(cart(2, 0), true)).toBe('CW-CSOMAG2'));
});
