import { useState } from 'react';
import { Check, Footprints, Hand, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/track';
import { GLOVE_SIZES, SOCK_SIZES, fmt, gloveSizeFor, sockSizeFor } from '@/lib/sizing';

function goBundle() {
  document.getElementById('bundle_selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function pick(kind: 'glove' | 'sock', size: string) {
  window.dispatchEvent(new CustomEvent('cw:size', { detail: { kind, size } }));
  track('size_select', { pair: kind === 'sock' ? 'sock' : 'calculator', size });
  goBundle();
}

const STEPS = [
  'Fogj egy puha mérőszalagot (vagy egy madzagot és vonalzót).',
  'Tekerd körbe a tenyered a hüvelykujj alatt, a legszélesebb ponton.',
  'Olvasd le a cm-t, és állítsd be lent – a méretet mi mondjuk meg.',
];

function GloveCalc() {
  const [cm, setCm] = useState(19.5);
  const size = gloveSizeFor(cm);
  const set = (v: number) => setCm(Math.min(25, Math.max(16, Math.round(v * 2) / 2)));
  const pct = ((cm - 16) / 9) * 100;
  return (
    <div>
      <ol className="mb-6 space-y-3">
        {STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm leading-6">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-signal text-xs font-bold text-signal-text">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-line bg-bg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-text-muted">Tenyérkörméreted</span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Csökkentés" onClick={() => set(cm - 0.5)} className="flex size-9 items-center justify-center rounded-full border border-line hover:border-signal"><Minus size={16} /></button>
            <span className="w-24 text-center text-2xl font-extrabold tabular-nums">{fmt(cm)} cm</span>
            <button type="button" aria-label="Növelés" onClick={() => set(cm + 0.5)} className="flex size-9 items-center justify-center rounded-full border border-line hover:border-signal"><Plus size={16} /></button>
          </div>
        </div>
        <input
          type="range" min={16} max={25} step={0.5} value={cm}
          onChange={(e) => set(Number(e.target.value))}
          aria-label="Tenyérkörméret centiméterben"
          className="mt-5 w-full accent-[var(--color-signal)]"
          style={{ background: `linear-gradient(to right, var(--color-signal) ${pct}%, var(--color-line) ${pct}%)`, height: 6, borderRadius: 999, appearance: 'none' }}
        />
        <div className="mt-2 flex justify-between text-xs text-text-muted"><span>16 cm</span><span>25 cm</span></div>

        <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl bg-signal-soft p-5 text-center sm:flex-row sm:text-left">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-signal text-3xl font-extrabold text-on-signal">{size}</span>
          <div className="flex-1">
            <p className="text-lg font-extrabold">A te méreted: {size}</p>
            <p className="mt-1 text-sm text-text-muted">
              {cm < 17 ? 'Kisebb a tartománynál – az S lesz a legszorosabb.' : cm > 24 ? 'Nagyobb a tartománynál – az XXL a legbővebb méretünk.' : 'Két méret határán mindig a nagyobbat ajánljuk.'}
            </p>
          </div>
          <Button type="button" onClick={() => pick('glove', size)} className="h-12 rounded-full px-6 font-extrabold">
            <Check /> {size} kiválasztása
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[420px] text-sm">
          <thead><tr className="border-b border-line bg-bg text-left">
            <th className="px-4 py-3 font-bold">Méret</th>
            <th className="px-4 py-3 font-bold">Tenyérkörméret</th>
            <th className="px-4 py-3 font-bold">Tenyérszélesség</th>
          </tr></thead>
          <tbody>
            {GLOVE_SIZES.map((g) => {
              const on = g.size === size;
              return (
                <tr key={g.size} onClick={() => set((g.palm[0] + g.palm[1]) / 2)} className={`cursor-pointer border-b border-line transition-colors last:border-0 ${on ? 'bg-signal-soft' : 'hover:bg-bg'}`}>
                  <td className={`px-4 py-3 font-extrabold ${on ? 'text-signal-text' : ''}`}>{g.size}</td>
                  <td className="px-4 py-3 tabular-nums">{fmt(g.palm[0])}–{fmt(g.palm[1])} cm</td>
                  <td className="px-4 py-3 tabular-nums text-text-muted">{fmt(g.width[0])}–{fmt(g.width[1])} cm</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SockCalc() {
  const [shoe, setShoe] = useState<number | null>(null);
  const size = shoe ? sockSizeFor(shoe) : undefined;
  return (
    <div>
      <p className="mb-4 text-sm leading-6">Koppints a cipőméretedre – megmutatjuk, melyik zokni illik rád.</p>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }, (_, i) => 35 + i).map((n) => {
          const group = sockSizeFor(n) === size && size;
          return (
            <button key={n} type="button" onClick={() => setShoe(n)} aria-pressed={shoe === n}
              className={`h-12 rounded-xl border font-bold tabular-nums transition-colors ${shoe === n ? 'border-signal bg-signal text-on-signal' : group ? 'border-signal bg-signal-soft' : 'border-line bg-bg hover:border-signal/60'}`}>
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {SOCK_SIZES.map((s) => {
          const on = s.size === size;
          return (
            <div key={s.size} className={`rounded-2xl border p-4 text-center transition-colors ${on ? 'border-signal bg-signal-soft ring-1 ring-signal' : 'border-line bg-bg'}`}>
              <p className="text-xl font-extrabold">{s.size}</p>
              <p className="mt-1 text-xs text-text-muted">cipőméret {s.shoes[0]}–{s.shoes[3]}</p>
            </div>
          );
        })}
      </div>
      {size && (
        <Button type="button" onClick={() => pick('sock', size)} className="mt-5 h-12 w-full rounded-full font-extrabold">
          <Check /> {size} zokni kiválasztása
        </Button>
      )}
      <p className="mt-3 text-xs text-text-muted">A zokni a 3 kesztyűs csomag ajándéka.</p>
    </div>
  );
}

export function SizeChart() {
  const [tab, setTab] = useState<'glove' | 'sock'>('glove');
  return (
    <section className="cw-section" id="size_chart">
      <div className="cw-container grid gap-10 md:grid-cols-[0.8fr_1.2fr] [&>*]:min-w-0">
        <div>
          <h2 className="cw-heading mb-5">Pont a kezedre.</h2>
          <p className="cw-body max-w-md">30 másodperc, egy mérőszalag – és biztosan a jó méretet rendeled.</p>
          <svg viewBox="0 0 160 180" className="mt-8 h-44 w-40 text-text" fill="none" aria-label="Tenyérkörméret mérése a hüvelykujj alatt">
            <path d="M50 155c-8-18-16-30-25-46-8-14 1-23 10-13l15 16V40c0-12 17-12 17 0v42-61c0-12 17-12 17 0v61-57c0-12 17-12 17 0v57-40c0-12 17-12 17 0v71c0 18-8 28-8 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M44 103h81" stroke="var(--color-signal)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" />
            <path d="M44 96v14M125 96v14" stroke="var(--color-signal)" strokeWidth="2" strokeLinecap="round" />
            <path d="M51 156h62" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="mt-3 max-w-xs text-sm text-text-muted">A narancs vonalnál mérj, a hüvelykujj nélkül. A szalag simuljon, de ne szorítson.</p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-bg p-1" role="tablist">
            {([['glove', 'Kesztyű', Hand], ['sock', 'Zokni', Footprints]] as const).map(([key, label, Icon]) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key}
                onClick={() => { setTab(key); track('size_chart_open', { tab: key }); }}
                className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors ${tab === key ? 'bg-signal text-on-signal' : 'text-text-muted hover:text-text'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          {tab === 'glove' ? <GloveCalc /> : <SockCalc />}
        </div>
      </div>

      <div className="cw-container mt-12">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-signal px-6 py-8 text-center text-on-signal sm:px-10 md:flex-row md:justify-between md:text-left">
          <p className="text-xl font-extrabold leading-tight md:text-2xl">Megvan a méreted? Válaszd ki a csomagod.</p>
          <Button type="button" onClick={() => { track('cta_click', { location: 'size_chart' }); goBundle(); }} className="h-14 shrink-0 rounded-full border border-bg/40 bg-bg px-8 text-base font-extrabold tracking-wide text-text hover:bg-bg/90">CSOMAG KIVÁLASZTÁSA</Button>
        </div>
      </div>
    </section>
  );
}
