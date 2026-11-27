// Winter surprise gift offer (until 10 December 2026, midnight Budapest time).
// Shared by the storefront and the server: while it runs, the 3-pair package is 3 gloves + gift (no sock),
// priced by the Shopify code CW-CSOMAG3-AJANDEK; afterwards the old 3 gloves + sock package (CW-CSOMAG3) returns.
export const GIFT_END = new Date('2026-12-10T23:59:59+01:00');
export function giftActive(now = new Date()) {
  return now < GIFT_END;
}
export function giftMinimum(count: number) {
  return count >= 3 ? 10_000 : 5_000;
}
