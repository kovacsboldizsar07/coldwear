import type { BundlePrice, Cart, Product } from './commerce';
const productFields = 'id handle title description images(first:5){nodes{url altText}} variants(first:20){nodes{id title availableForSale price{amount currencyCode}}}';
const cartFields = `id checkoutUrl discountCodes{code applicable} totalQuantity cost{totalAmount{amount currencyCode} subtotalAmount{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}} lines(first:100){nodes{id quantity cost{amountPerQuantity{amount currencyCode} totalAmount{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}} merchandise{...on ProductVariant{id title availableForSale price{amount currencyCode} product{id title handle}}}}}`;
export type TrackingTokens = { uniqueToken: string; visitToken: string };
async function request<T>(query: string, variables: Record<string, unknown> = {}, tracking?: TrackingTokens): Promise<T> {
 // Server-side only: the Headless channel's private Storefront token.
 const token = process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'];
 if (!token) throw new Error('A Shopify kapcsolat nincs beállítva.');
 const response = await fetch('https://coldwear-webshop-build-f7kqk-2ptaz8yb.myshopify.com/api/2025-07/graphql.json', { method:'POST', headers:{'Content-Type':'application/json','Shopify-Storefront-Private-Token':token,...(tracking?{'X-Shopify-UniqueToken':tracking.uniqueToken,'X-Shopify-VisitToken':tracking.visitToken}:{})}, body:JSON.stringify({query,variables}) });
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
export function bundleCode(cart: Cart): string | null {
 let gloves=0, socks=0;
 for (const l of cart.lines.nodes) { const t=l.merchandise.product.title.toLowerCase(); if(t.includes('kesztyű')) gloves+=l.quantity; else if(t.includes('zokni')) socks+=l.quantity; }
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
let bundleCache: { at: number; prices: BundlePrice[] } | null = null;
const BUNDLE_TTL = 10 * 60_000;
/** Bundle prices for the 1/2/3-pair options, quoted once by Shopify and cached per worker instance so pages render with prices. */
export async function bundlePrices(): Promise<BundlePrice[]> {
 if (bundleCache && Date.now() - bundleCache.at < BUNDLE_TTL) return bundleCache.prices;
 const products = await catalog();
 const glove = products.find(p => p.title.toLowerCase().includes('kesztyű'));
 const sock = products.find(p => p.title.toLowerCase().includes('zokni'));
 const variant = glove?.variants.nodes.find(v => v.availableForSale);
 if (!variant) return [];
 const sockVariant = sock?.variants.nodes.find(v => v.availableForSale) ?? sock?.variants.nodes[0];
 const carts = await Promise.all([1, 2, 3].map(count => quote([{ merchandiseId: variant.id, quantity: count }, ...(count === 3 && sockVariant ? [{ merchandiseId: sockVariant.id, quantity: 1 }] : [])])));
 const prices = carts.flatMap((cart, i) => cart ? [{ count: i + 1, total: cart.cost.totalAmount, subtotal: cart.cost.subtotalAmount }] : []);
 if (prices.length === 3) bundleCache = { at: Date.now(), prices };
 return prices;
}
