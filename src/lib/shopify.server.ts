import { getRequest } from '@tanstack/react-start/server';
import type { BundlePrice, Cart, Product } from './commerce';
import { giftActive } from './gift-offer';
const productFields = 'id handle title description images(first:5){nodes{url altText}} variants(first:20){nodes{id title availableForSale price{amount currencyCode}}}';
const cartFields = `id checkoutUrl discountCodes{code applicable} totalQuantity cost{totalAmount{amount currencyCode} subtotalAmount{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}} lines(first:100){nodes{id quantity cost{amountPerQuantity{amount currencyCode} totalAmount{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}} merchandise{...on ProductVariant{id title availableForSale price{amount currencyCode} product{id title handle}}}}}`;
export type TrackingTokens = { uniqueToken: string; visitToken: string };
/** The visitor's IP. Without it Shopify counts every private-token request against the Worker's own IP and soon answers "Throttled". */
function buyerIp(): string {
 try { const h = getRequest()?.headers; return h?.get('cf-connecting-ip') || h?.get('x-forwarded-for')?.split(',')[0]?.trim() || ''; } catch { return ''; }
}
async function request<T>(query: string, variables: Record<string, unknown> = {}, tracking?: TrackingTokens): Promise<T> {
 // Server-side only: the Headless channel's private Storefront token.
 const token = process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'];
 if (!token) throw new Error('A Shopify kapcsolat nincs beállítva.');
 const ip = buyerIp();
 const response = await fetch('https://coldwear-webshop-build-f7kqk-2ptaz8yb.myshopify.com/api/2025-07/graphql.json', { method:'POST', headers:{'Content-Type':'application/json','Shopify-Storefront-Private-Token':token,...(ip?{'Shopify-Storefront-Buyer-IP':ip}:{}),...(tracking?{'X-Shopify-UniqueToken':tracking.uniqueToken,'X-Shopify-VisitToken':tracking.visitToken}:{})}, body:JSON.stringify({query,variables}) });
 if (!response.ok) throw new Error('A Shopify jelenleg nem elérhető. Próbáld újra.');
 const result = await response.json() as { data:T; errors?:{message:string}[] };
 if (result.errors?.length) throw new Error(result.errors.map(x=>x.message).join(', '));
 return result.data;
}
let shopIdCache = '';
/** The shop's GID, needed by Shopify Analytics events. */
export async function shopId() { if (!shopIdCache) shopIdCache = (await request<{shop:{id:string}}>('query{shop{id}}')).shop.id; return shopIdCache; }
export async function catalog() { return (await request<{products:{nodes:Product[]}}>(`query{products(first:20,query:"vendor:ColdWear"){nodes{${productFields}}}}`)).products.nodes; }
export async function readCart(id: string) { return (await request<{cart:Cart|null}>(`query($id:ID!){cart(id:$id){${cartFields}}}`,{id})).cart; }
export async function mutateCart(operation:'create'|'add'|'update'|'remove'|'attributes'|'discounts', variables: Record<string,unknown>, tracking?: TrackingTokens) {
 const mutations = {
 create: `mutation($input:CartInput!){cartCreate(input:$input){cart{${cartFields}} userErrors{message}}}`,
 add:`mutation($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`,
 update:`mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`,
 remove:`mutation($cartId:ID!,$lineIds:[ID!]!){cartLinesRemove(cartId:$cartId,lineIds:$lineIds){cart{${cartFields}} userErrors{message}}}`,
 discounts:`mutation($cartId:ID!,$discountCodes:[String!]!){cartDiscountCodesUpdate(cartId:$cartId,discountCodes:$discountCodes){cart{${cartFields}} userErrors{message}}}`,
 attributes:`mutation($cartId:ID!,$attributes:[AttributeInput!]!){cartAttributesUpdate(cartId:$cartId,attributes:$attributes){cart{${cartFields}} userErrors{message}}}`
 };
 const data = await request<Record<string,{cart:Cart|null;userErrors:{message:string}[]}>>(mutations[operation],variables,tracking);
 const result = Object.values(data)[0];
 // A missing cart is recoverable, unlike an ambiguous network failure.
 if(operation!=='create' && result?.userErrors.length && result.userErrors.every(x=>/the specified cart does not exist\.?|cart (?:does not exist|has expired|not found)/i.test(x.message))) return null;
 if(result?.userErrors.length) throw new Error(result.userErrors.map(x=>x.message).join(', '));
 return result?.cart ?? null;
}
/** Bundle pricing lives in Shopify discount codes; the code is chosen from the cart's composition, the amount comes from Shopify. */
export function bundleCode(cart: Cart, gift = giftActive()): string | null {
 let gloves=0, socks=0;
 for (const l of cart.lines.nodes) { const t=l.merchandise.product.title.toLowerCase(); if(t.includes('kesztyű')) gloves+=l.quantity; else if(t.includes('zokni')) socks+=l.quantity; }
 if (gift && gloves>=3) return 'CW-CSOMAG3-AJANDEK';
 if (gloves>=3 && socks>=1) return 'CW-CSOMAG3';
 if (gloves>=2) return 'CW-CSOMAG2';
 return null;
}
export async function withBundle(cart: Cart | null) {
 if (!cart) return cart;
 const code = bundleCode(cart);
 const current = cart.discountCodes?.map(d=>d.code) ?? [];
 if ((code ? [code] : []).join() === current.join()) return cart;
 return mutateCart('discounts',{cartId:cart.id,discountCodes:code?[code]:[]});
}
export async function quote(lines:{merchandiseId:string;quantity:number}[]) { return withBundle(await mutateCart('create',{input:{lines,buyerIdentity:{countryCode:'HU'}}})); }
export type { BundlePrice } from './commerce';
let bundleCache: { at: number; prices: BundlePrice[]; gift?: boolean } | null = null;
let bundleInflight: Promise<BundlePrice[]> | null = null;
const BUNDLE_TTL = 60 * 60_000;
// The key names the package composition, so cached prices never cross the gift offer's start or end.
const sharedKey = () => `https://coldwear.hu/__cache/bundle-prices-v2-${giftActive() ? 'gift' : 'sock'}`;
type EdgeCache = { match(key: string): Promise<Response | undefined>; put(key: string, res: Response): Promise<void> };
const edgeCache = (): EdgeCache | null => { try { return (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default ?? null; } catch { return null; } };
async function readShared(): Promise<{ at: number; prices: BundlePrice[] } | null> {
 try { const res = await edgeCache()?.match(sharedKey()); return res ? await res.json() as { at: number; prices: BundlePrice[] } : null; } catch { return null; }
}
async function writeShared(entry: { at: number; prices: BundlePrice[] }) {
 try { await edgeCache()?.put(sharedKey(), new Response(JSON.stringify(entry), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' } })); } catch { /* best effort */ }
}
async function quoteBundles(): Promise<BundlePrice[]> {
 const products = await catalog();
 const glove = products.find(p => p.title.toLowerCase().includes('kesztyű'));
 const sock = products.find(p => p.title.toLowerCase().includes('zokni'));
 const variant = glove?.variants.nodes.find(v => v.availableForSale);
 if (!variant) return [];
 const sockVariant = sock?.variants.nodes.find(v => v.availableForSale) ?? sock?.variants.nodes[0];
 const carts = await Promise.allSettled([1, 2, 3].map(count => quote([{ merchandiseId: variant.id, quantity: count }, ...(count === 3 && sockVariant && !giftActive() ? [{ merchandiseId: sockVariant.id, quantity: 1 }] : [])])));
 return carts.flatMap((r, i) => r.status === 'fulfilled' && r.value ? [{ count: i + 1, total: r.value.cost.totalAmount, subtotal: r.value.cost.subtotalAmount }] : []);
}
/**
 * Bundle prices for the 1/2/3-pair options, quoted by Shopify and cached (per Worker instance and in the
 * Cloudflare edge cache) so pages render with prices. Quoting creates Shopify carts, so it must stay rare:
 * a failed or partial quote never replaces the last good prices, and concurrent requests share one quote.
 */
export async function bundlePrices(): Promise<BundlePrice[]> {
 if (bundleCache && bundleCache.gift !== giftActive()) bundleCache = null;
 if (bundleCache && Date.now() - bundleCache.at < BUNDLE_TTL) return bundleCache.prices;
 const shared = await readShared();
 if (shared?.prices?.length === 3 && (!bundleCache || shared.at > bundleCache.at)) bundleCache = { ...shared, gift: giftActive() };
 if (bundleCache && Date.now() - bundleCache.at < BUNDLE_TTL) return bundleCache.prices;
 bundleInflight ??= (async () => {
  try {
   const prices = await quoteBundles();
   if (prices.length === 3) { bundleCache = { at: Date.now(), prices, gift: giftActive() }; await writeShared(bundleCache); return prices; }
   return bundleCache?.prices ?? prices;
  } catch (error) {
   if (bundleCache) return bundleCache.prices;
   throw error;
  } finally { bundleInflight = null; }
 })();
 return bundleInflight;
}
