import { Droplets } from 'lucide-react';

const CHIPS = ['Esőben', 'Havas esőben', 'Latyakban'];

export function Water() {
  return (
    <section className="cw-section" id="water">
      <div className="cw-container">
        <div className="grid items-center gap-8 rounded-3xl bg-block p-6 text-on-block sm:p-8 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12 [&>*]:min-w-0">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-signal">Vízlepergető felület</p>
            <h2 className="cw-heading mt-3">Az eső nem itatja át.</h2>
            <p className="cw-body mt-4 max-w-md text-on-block-muted">A külső anyag vízlepergető felülettel készül. A csepp nem nyomódik át a szöveten, hanem a felszínén marad, majd lepereg. Havas esőben, latyakban és frissen hullott hóban is szárazon tartja a kezed.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <span key={c} className="rounded-full border border-signal/45 px-4 py-2 text-sm font-bold">{c}</span>
              ))}
            </div>
            <p className="mt-6 border-t border-on-block/15 pt-5 text-sm leading-6 text-on-block-muted">A vízlepergető felület nem vízállóságot jelent: merülni nem való, és a mosásokkal idővel gyengül. Egy szövetimpregnáló spray visszahozza.</p>
          </div>
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-signal/50 bg-on-block/5 p-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-signal/45 text-signal"><Droplets size={26} /></span>
            <div>
              <p className="text-lg font-extrabold">GIF jön ide</p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-on-block-muted">A víz lefolyik a felületről. Töltsd fel, és a helyére tesszük.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
