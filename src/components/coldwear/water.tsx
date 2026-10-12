import { Droplets } from 'lucide-react';

export function Water() {
  return (
    <section className="cw-section" id="water">
      <div className="cw-container">
        <div className="grid items-center gap-8 rounded-3xl bg-signal-soft p-6 sm:p-8 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12 [&>*]:min-w-0">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Az eső sem akadály!</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
              A külső anyag vízlepergető felülettel készül. A csepp nem nyomódik át a szöveten, hanem a felszínén marad, majd lepereg. Havas esőben, latyakban és frissen hullott hóban is szárazon tartja a kezed.
            </p>
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
