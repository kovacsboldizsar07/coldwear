import { Droplets } from 'lucide-react';

const CHIPS = ['Esőben', 'Havas esőben', 'Latyakban'];

export function Water() {
  return (
    <section className="cw-section" id="water">
      <div className="cw-container">
        <div className="grid items-center gap-8 rounded-3xl bg-signal-soft p-6 sm:p-8 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12 [&>*]:min-w-0">
          <div>
            <p className="max-w-md text-lg font-bold leading-8 text-foreground sm:text-xl sm:leading-9">
              A külső anyag vízlepergető felülettel készül. A csepp nem nyomódik át a szöveten, hanem a felszínén marad, majd lepereg. Havas esőben, latyakban és frissen hullott hóban is szárazon tartja a kezed.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <span key={c} className="rounded-full border border-signal/35 bg-surface px-4 py-2 text-sm font-bold text-signal-text">{c}</span>
              ))}
            </div>
            <p className="mt-6 max-w-md border-t border-signal/25 pt-5 text-sm leading-6 text-text-muted">A vízlepergető felület nem vízállóságot jelent: merülni nem való, és a mosásokkal idővel gyengül. Egy szövetimpregnáló spray visszahozza.</p>
          </div>
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-signal/45 bg-surface p-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-signal text-on-signal"><Droplets size={26} /></span>
            <div>
              <p className="text-lg font-extrabold">GIF jön ide</p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-text-muted">A víz lefolyik a felületről. Töltsd fel, és a helyére tesszük.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
