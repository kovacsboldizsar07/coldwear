import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const huf = (amount: number) => ({ amount: String(amount), currencyCode: 'HUF' });
const products = [
  { id: 'g', handle: 'kesztyu', title: 'ColdWear Thermo kesztyű', description: '', images: { nodes: [] }, variants: { nodes: [{ id: 'gid://shopify/ProductVariant/1', title: 'M', availableForSale: true, price: huf(8990) }] } },
  { id: 's', handle: 'zokni', title: 'ColdWear Thermo zokni', description: '', images: { nodes: [] }, variants: { nodes: [{ id: 'gid://shopify/ProductVariant/2', title: '39-42', availableForSale: true, price: huf(2990) }] } },
];
const totals: Record<number, number> = { 1: 8990, 2: 14990, 3: 18990 };

function fakeShopify() {
  return vi.fn(async (_url: string, init: { body: string }) => {
    const { query, variables } = JSON.parse(init.body) as { query: string; variables: { input?: { lines: { quantity: number }[] }; cartId?: string } };
    if (query.includes('products(')) return Response.json({ data: { products: { nodes: products } } });
    const gloves = variables.input?.lines[0]?.quantity ?? 1;
    const cart = { id: `c${gloves}`, checkoutUrl: '', totalQuantity: gloves, discountCodes: [], cost: { totalAmount: huf(totals[gloves] ?? 0), subtotalAmount: huf(gloves * 8990 + (gloves === 3 ? 2990 : 0)) }, discountAllocations: [], lines: { nodes: [] } };
    return Response.json({ data: { cartCreate: { cart, userErrors: [] } } });
  });
}

describe('szerveroldali csomagárak', () => {
  beforeEach(() => { vi.resetModules(); process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'] = 'test'; });
  afterEach(() => { vi.unstubAllGlobals(); delete process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN']; });

  it('mindhárom csomag árát visszaadja', async () => {
    vi.stubGlobal('fetch', fakeShopify());
    const { bundlePrices } = await import('@/lib/shopify.server');
    const prices = await bundlePrices();
    expect(prices.map(p => [p.count, p.total.amount])).toEqual([[1, '8990'], [2, '14990'], [3, '18990']]);
  });

  it('a második hívás a cache-ből jön, nem hoz létre új Shopify kosarat', async () => {
    const fetch = fakeShopify();
    vi.stubGlobal('fetch', fetch);
    const { bundlePrices } = await import('@/lib/shopify.server');
    await bundlePrices();
    const calls = fetch.mock.calls.length;
    await bundlePrices();
    expect(fetch.mock.calls.length).toBe(calls);
  });

  it('Shopify "Throttled" hiba esetén a legutóbbi jó árakat adja, nem üres listát', async () => {
    const ok = fakeShopify();
    vi.stubGlobal('fetch', ok);
    const mod = await import('@/lib/shopify.server');
    await mod.bundlePrices();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 2 * 60 * 60_000);
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: { body: string }) => init.body.includes('products(') ? ok(_u, init) : Response.json({ errors: [{ message: 'Throttled' }] })));
    const prices = await mod.bundlePrices();
    vi.useRealTimers();
    expect(prices.map(p => p.total.amount)).toEqual(['8990', '14990', '18990']);
  });
});
