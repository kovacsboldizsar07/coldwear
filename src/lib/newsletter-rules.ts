/** Exit popup offer: free shipping in exchange for a newsletter sign-up. Shared by browser and server. */
export const NEWSLETTER_CONSENT_VERSION = "coldwear-newsletter-2026-11-24";
export const NEWSLETTER_CONSENT_TEXT =
  "Feliratkozom a ColdWear hírlevelére: hozzájárulok, hogy a Lovery Gifts Kft. az e-mail címemet ajánlatok, kuponok és újdonságok küldésére kezelje. Bármikor leiratkozhatok a levelek alján lévő linkkel vagy a coldwear26@gmail.com címen.";
/** Shown only after a successful sign-up; the code itself must exist in Shopify (free shipping, combinable with product discounts). */
export const DEFAULT_SIGNUP_COUPON = "INGYENSZALLITAS";
export const SIGNUP_STORAGE_KEY = "cw_signup";
export const EXIT_POPUP_SEEN_KEY = "cw_exit_seen";
/** Days before the popup may show again after it was dismissed without signing up. */
export const EXIT_POPUP_COOLDOWN_DAYS = 7;
export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
export function exitPopupAllowed(seenAt: number | null, now = Date.now()) {
  return !seenAt || now - seenAt > EXIT_POPUP_COOLDOWN_DAYS * 86_400_000;
}
