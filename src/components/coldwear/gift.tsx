import { useEffect, useState } from 'react';
import { Gift, PackageCheck, Snowflake, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/track';

// Guaranteed winter surprise gift in every package. The value claims must stay true and provable:
// "min. X Ft" is the gift's regular gross price in the ColdWear webshop, and the shop keeps that listing as proof.
// The offer ends on 10 December 2026 at midnight, Budapest time.
import { GIFT_END, giftActive, giftMinimum } from '@/lib/gift-offer';
export { GIFT_END, giftActive, giftMinimum };
export const GIFT_END_LABEL = 'december 10.';
const ft = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft`;
export function giftLabel(count: number) {
  return `min. ${ft(giftMinimum(count))} értékű téli meglepetés ajándék`;
}

export function giftShortLabel(count: number) {
  return `min. ${ft(giftMinimum(count))} értékű ajándék`;
}

const ITEMS = [
  { emoji: '🧤', t: 'Kesztyű', b: 'Egy másik téli darab, egyméretes.' },
  { emoji: '🧢', t: 'Sapka', b: 'Meleg sapka a hideg reggelekre.' },
  { emoji: '🧦', t: 'Zokni', b: 'Meleg téli zokni.' },
  { emoji: '🧣', t: 'Sál', b: 'Puha sál, ami illik a kesztyűhöz.' },
];

const STEPS = [
  { icon: Gift, t: 'Kiválasztod a csomagot', b: 'Minden csomagban van ajándék: 1 vagy 2 párnál min. 5 000 Ft, 3 párnál min. 10 000 Ft értékben.' },
  { icon: Snowflake, t: 'Mi összeválogatjuk', b: 'Téli ajándékot teszünk a kesztyű mellé.' },
  { icon: PackageCheck, t: 'Egy csomagban érkezik', b: 'A kesztyűvel együtt, külön díj nélkül. Kibontáskor derül ki, mit kaptál.' },
];

function left(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
const two = (n: number) => String(n).padStart(2, '0');

/** Countdown to the end of the gift offer. Null on the server so the first HTML never shows a stale time. */
export function useGiftCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now === null ? null : left(GIFT_END.getTime() - now);
}

/** Top bar while the offer runs: what the offer is and how long it lasts. */
export function GiftCountdownBar() {
  const c = useGiftCountdown();
  return (
    <a href="/#gift" className="block bg-gift text-on-gift" onClick={() => track('gift_bar_click')}>
      <div className="cw-container flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-1.5 text-center text-xs font-semibold sm:text-[13px]">
        <span>🎁 Minden csomaghoz ajándék, min. 5 000 Ft értékben</span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <Timer size={14} className="shrink-0" aria-hidden />
          {c ? (
            <span>
              Még <strong>{c.d} nap {two(c.h)}:{two(c.m)}:{two(c.s)}</strong>
            </span>
          ) : (
            <span>{GIFT_END_LABEL}-ig</span>
          )}
        </span>
      </div>
    </a>
  );
}

/** Small strip in the hero, above the headline. Left-aligned with the headline: no indent, the gift emoji sits in the title. */
export function GiftStrip() {
  return (
    <a
      href="#gift"
      onClick={() => track('gift_strip_click')}
      className="block rounded-2xl border border-gift/30 bg-gift-soft px-4 py-3 text-sm leading-5 transition-colors hover:border-gift/60"
    >
      <strong className="block text-[15px]">🎁 Most minden csomag mellé ajándék jár</strong>
      <span className="mt-0.5 block text-text-muted">Garantált téli meglepetés: min. 5 000 Ft, 3 párnál min. 10 000 Ft értékben.</span>
    </a>
  );
}

/** The block lower on the page: what the surprise can be, how it works, and the fine print. */
export function GiftSection() {
  return (
    <section id="gift" className="cw-section">
      <div className="cw-container">
        <div className="overflow-hidden rounded-3xl bg-gift-block p-5 text-on-block sm:p-6 lg:p-8">
          <h2 className="max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl">
            Minden csomagban van egy ajándék. Hogy mi, az kibontáskor derül ki.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-on-block-muted">
            Az értéke garantált: 1 vagy 2 pár kesztyű mellé legalább 5 000 Ft, 3 pár mellé legalább 10 000 Ft értékű téli darabot teszünk.
          </p>

          <p className="mt-6 text-sm font-bold">Ezek lehetnek a csomagban:</p>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {ITEMS.map((i) => (
              <div key={i.t} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/12">
                <span className="text-3xl" aria-hidden>{i.emoji}</span>
                <p className="mt-2 font-extrabold">{i.t}</p>
                <p className="mt-1 text-xs leading-5 text-on-block-muted">{i.b}</p>
              </div>
            ))}
          </div>

          <ol className="mt-6 grid gap-3 lg:grid-cols-3">
            {STEPS.map((s, n) => (
              <li key={s.t} className="flex gap-3 rounded-2xl bg-bg p-4 text-text">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gift-soft text-gift-text"><s.icon size={18} strokeWidth={1.75} /></span>
                <div className="min-w-0">
                  <p className="font-extrabold leading-tight">{n + 1}. {s.t}</p>
                  <p className="mt-1 text-sm leading-6 text-text-muted">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <Button
              type="button"
              className="h-auto min-h-12 w-full whitespace-normal rounded-full bg-gift px-6 font-extrabold text-on-gift hover:bg-gift/90 sm:w-auto"
              onClick={() => {
                track('cta_click', { location: 'gift' });
                window.dispatchEvent(new CustomEvent('cw:bundle', { detail: { count: 3 } }));
                document.getElementById('bundle_selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              3 pár + 10 000 Ft-os ajándék
            </Button>
          </div>

          <p className="mt-5 text-xs leading-5 text-on-block-muted">
            Az ajándék értéke a ColdWear webshopban feltüntetett szokásos bruttó eladási ár alapján értendő. Az ajánlat a készlet erejéig, de legkésőbb
            2026. december 10. éjfélig leadott rendelésekre érvényes. Az ajándék összeállítását mi választjuk ki. Elállás esetén az ajándékot is vissza kell küldeni.
          </p>
        </div>
      </div>
    </section>
  );
}
