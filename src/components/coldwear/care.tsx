import { Ban } from 'lucide-react';

const STEPS = [
  ['Zárd be a cipzárt', 'Tedd mosózsákba vagy egy párnahuzatba. Így a cipzár és a szilikon minta nem dörzsölődik fel.'],
  ['30 fok, kímélő program', 'Vagy kézzel, langyos vízben. A centrifugát állítsd alacsonyra, max 800 fordulatra.'],
  ['Kímélő mosószer', 'Öblítőt, fehérítőt és folteltávolítót ne használj. Az öblítő lerakódik a polárra és a vízlepergető felületre.'],
  ['Ne csavard ki', 'Nyomkodd ki belőle a vizet, majd fektetve szárítsd szobahőmérsékleten. A tenyérrel felfelé, hogy a minta ne érjen az asztalhoz.'],
  ['Száradás után igazítsd el', 'Húzd végig az ujjait, és hagyd teljesen megszáradni, mielőtt fiókba teszed.'],
];

const NEVER = ['Szárítógép', 'Radiátor vagy tűzhely', 'Vasalás', 'Vegyitisztítás', 'Forró víz', 'Öblítő és fehérítő'];

export function Care() {
  return (
    <section className="cw-section" id="care">
      <div className="cw-container">
        <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] [&>*]:min-w-0">
            <div>
              <h2 className="cw-heading mb-4">Mosási útmutató.</h2>
              <p className="cw-body max-w-md">A kesztyű mosható. Így csináld, hogy a forma, a szilikon minta és a vízlepergető felület ne sérüljön.</p>
              <ol className="mt-7 space-y-4">
                {STEPS.map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-signal text-xs font-bold text-signal-text">{i + 1}</span>
                    <div>
                      <p className="font-extrabold">{t}</p>
                      <p className="mt-1 text-sm leading-6 text-text-muted">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-line bg-bg p-5 sm:p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-signal-text">Ezt ne tedd</p>
              <ul className="mt-5 space-y-3">
                {NEVER.map((n) => (
                  <li key={n} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-text-muted"><Ban size={14} /></span>
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-line pt-5 text-sm leading-6 text-text-muted">Kis szennyeződés? Elég egy nedves szivacs és egy csepp kímélő szappan. A gyakori mosás gyorsabban kopja a felületet, ezért csak akkor mosd ki, ha már tényleg kell.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
