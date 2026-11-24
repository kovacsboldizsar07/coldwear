# ColdWear

A ColdWear webshop (https://coldwear.hu) forráskódja. TanStack Start + React + Tailwind, a kosár és a fizetés Shopify Storefront API-n megy, az analitika és a Meta CAPI sor a saját Supabase projektben van. A szerver Cloudflare Workers-en fut.

## Helyi fejlesztés

```sh
npm install
cp .dev.vars.example .dev.vars   # töltsd ki a titkokat
npm run dev                      # http://localhost:8080
npm test
```

A `.env` csak publikus értékeket tartalmaz (Supabase URL és publishable key), ezek bekerülnek a böngészős buildbe is.

## Deploy

A Cloudflare Workers a GitHub `main` ágából automatikusan buildel és deployol (Workers Builds):

- Build parancs: `npm run build`
- Deploy parancs: `npx wrangler deploy`

A `vite build` a nitro `cloudflare-module` presettel a `.output/` mappába buildel, és generálja a wrangler konfigot is (worker neve: `coldwear`).

Kézi deploy: `npm run deploy` (előtte `npx wrangler login`).

## Környezeti változók (Cloudflare → Worker → Settings → Variables and Secrets)

| Név | Mire kell |
| --- | --- |
| `SUPABASE_URL` | Supabase projekt URL (szerver oldal) |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (szerver oldal) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret / service role key (titok) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify Storefront API token (titok) |
| `SHOPIFY_WEBHOOK_SECRET` | Shopify webhook aláíró kulcs (titok) |
| `META_PIXEL_ID` | Meta pixel azonosító |
| `CF_WEB_ANALYTICS_TOKEN` | Cloudflare Web Analytics site token (süti nélküli látogatásszámláló; üresen a beacon nem töltődik be) |
| `META_CAPI_TOKEN` | Meta Conversions API token (titok) |
| `META_CAPI_TEST_EVENT_CODE` | opcionális, Meta Test Events kód |
| `CW_COLLECT_SIGNING_SECRET` | véletlen, hosszú titok a hozzájárulás-aláíráshoz |

## Adatbázis

A séma a `drizzle/migrations/` mappában van (0000–0002). Új projektre: futtasd le őket sorrendben a Supabase SQL editorban, vagy `DATABASE_URL=... npx drizzle-kit migrate`.

Admin felhasználó: hozd létre a Supabase Auth-ban, majd `insert into public.user_roles(user_id, role) values ('<user id>', 'admin');`
