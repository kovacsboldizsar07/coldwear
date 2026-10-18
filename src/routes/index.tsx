import { createFileRoute } from '@tanstack/react-router';
import { ThermoProductPage } from '@/components/coldwear/thermo-page';
import { pageHead, SHARE_IMAGE, SITE_URL, jsonLd } from '@/lib/seo';

export const Route = createFileRoute('/')({
  head: () => ({
    ...pageHead('ColdWear kesztyű: tartsd melegen a kezed, ne állj meg a hideg miatt.', 'ColdWear téli kesztyű érintőképes ujjbegyekkel, csúszásgátló tenyérrel és vízlepergető felülettel. Méretválasztó és 14 napos pénzvisszafizetési garancia.', '/', SHARE_IMAGE),
    scripts: [jsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'ColdWear kesztyű',
      description: 'Érintőképes, szélálló téli kesztyű csúszásgátló tenyérrel és vízlepergető felülettel.',
      brand: { '@type': 'Brand', name: 'ColdWear' },
      url: `${SITE_URL}/`,
      image: SHARE_IMAGE,
    })],
  }),
  component: ThermoProductPage,
});
