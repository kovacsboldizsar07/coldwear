import { Button } from '@/components/ui/button';
import { Snowflake, Thermometer, Flame } from 'lucide-react';
import { track } from '@/lib/track';

const STEPS = [
  { icon: Thermometer, t: 'Amíg nem fázik', b: 'Ilyenkor a kesztyű nem hiányzik. Jónak tűnik, hogy majd ráérek.' },
  { icon: Snowflake, t: 'Az első fagyos reggel', b: 'Jég a kormány, a képernyő nem engedi a kesztyűs ujjat, a kezed nem csinál semmit.' },
  { icon: Flame, t: 'A tél közepén', b: 'Akkor már nem a kesztyűn gondolkodsz, hanem hogy hogyan melegítsd fel a kezed.' },
];

export function Winter() {
  return (
    <section className="cw-section" id="winter">
      <div className="cw-container">
        <div className="grid items-center gap-6 rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8 lg:p-8 [&>*]:min-w-0">
          <div>
            <p className="cw-label text-signal-text">Gondolkodj előre</p>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
              Ne akkor vegyél kesztyűt, amikor már lefagyott a kezed.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
              A tél nem kérdez rá, hogy készültél-e. Az első fagyos reggel csak úgy jön, és akkor már késő kesztyűt keresni.
            </p>
            <Button
              type="button"
              className="mt-5 h-12 w-full rounded-full px-6 sm:w-auto font-extrabold"
              onClick={() => {
                track('cta_click', { location: 'winter' });
                document.getElementById('bundle_selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              Most rendeljem meg
            </Button>
          </div>
          <ol className="hidden gap-3 lg:grid">
            {STEPS.map((s) => (
              <li key={s.t} className="flex gap-3 rounded-2xl border border-line bg-bg p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal-text">
                  <s.icon size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold leading-tight">{s.t}</p>
                  <p className="mt-1 text-sm leading-6 text-text-muted">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
