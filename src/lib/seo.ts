import share from '@/assets/coldwear-share.jpg.asset.json';
import type { Product } from '@/lib/commerce';

// Keep the published origin in one place for self-referencing route metadata.
export const SITE_URL = 'https://coldwear.lovable.app';
export const SHARE_IMAGE = new URL(share.url, SITE_URL).href;

export function pageHead(title: string, description: string, path: string, image?: string) {
  const url = new URL(path, SITE_URL).href;
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      ...(image ? [
        { property: 'og:image', content: image },
        { name: 'twitter:image', content: image },
        { property: 'og:image:alt', content: title },
      ] : []),
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}

export function productSchema(product: Product, path: string) {
  const url = new URL(path, SITE_URL).href;
  const variants = product.variants.nodes.filter(v => Number.isFinite(Number(v.price.amount)) && Number(v.price.amount) > 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url,
    brand: { '@type': 'Brand', name: 'ColdWear' },
    image: product.images.nodes.map(image => new URL(image.url, SITE_URL).href),
    ...(variants.length ? { offers: variants.map(variant => ({
      '@type': 'Offer',
      name: variant.title,
      url,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      // Ordering eligibility is not evidence of physical inventory.
    })) } : {}),
  };
}

export function jsonLd(data: unknown) {
  return { type: 'application/ld+json', children: JSON.stringify(data).replace(/</g, '\\u003c') };
}