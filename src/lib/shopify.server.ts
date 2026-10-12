import type { Cart, Product } from './commerce';
const productFields = 'id handle title description variants(first:20){nodes{id title availableForSale price{amount currencyCode}}}';
const cartFields = `id checkoutUrl totalQuantity cost{totalAmount{amount currencyCode} subtotalAmount{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}} lines(first:100){nodes{id quantity cost{amountPerQuantity{amount currencyCode} totalAmount{amount currencyCode}} discountAllocations{discountedAmount{amount currencyCode}} merchandise{...on ProductVariant{id title availableForSale price{amount currencyCode} product{title handle}}}}}`;
async function request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
 const token = process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'];
 if (!token) throw new Error('A Shopify kapcsolat nincs beállítva.');
 const response = await fetch('https://coldwear-webshop-build-f7kqk-2ptaz8yb.myshopify.com/api/2025-07/graphql.json', { method:'POST', headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':token}, body:JSON.stringify({query,variables}) });
 if (!response.ok) throw new Error('A Shopify jelenleg nem elérhető. Próbáld újra.');
 const result = await response.json() as { data:T; errors?:{message:string}[] };
 if (result.errors?.length) throw new Error(result.errors.map(x=>x.message).join(', '));
 return result.data;
}
export async function catalog() { return (await request<{products:{nodes:Product[]}}>(`query{products(first:20,query:"vendor:ColdWear"){nodes{${productFields}}}}`)).products.nodes; }
export async function readCart(id: string) { return (await request<{cart:Cart|null}>(`query($id:ID!){cart(id:$id){${cartFields}}}`,{id})).cart; }
export async function mutateCart(operation:'create'|'add'|'update'|'remove'|'attributes', variables: Record<string,unknown>) {
 const mutations = {
 create: `mutation($input:CartInput!){cartCreate(input:$input){cart{${cartFields}} userErrors{message}}}`,
 add:`mutation($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`,
 update:`mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$cartId,lines:$lines){cart{${cartFields}} userErrors{message}}}`,
 remove:`mutation($cartId:ID!,$lineIds:[ID!]!){cartLinesRemove(cartId:$cartId,lineIds:$lineIds){cart{${cartFields}} userErrors{message}}}`,
 attributes:`mutation($cartId:ID!,$attributes:[AttributeInput!]!){cartAttributesUpdate(cartId:$cartId,attributes:$attributes){cart{${cartFields}} userErrors{message}}}`
 };
 const data = await request<Record<string,{cart:Cart|null;userErrors:{message:string}[]}>>(mutations[operation],variables);
 const result = Object.values(data)[0];
 if(result?.userErrors.length) throw new Error(result.userErrors.map(x=>x.message).join(', '));
 return result?.cart ?? null;
}
export async function quote(lines:{merchandiseId:string;quantity:number}[]) { return mutateCart('create',{input:{lines,buyerIdentity:{countryCode:'HU'}}}); }
