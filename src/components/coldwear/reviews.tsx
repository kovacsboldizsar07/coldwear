import { ShieldCheck, Ruler, Truck } from 'lucide-react';

/**
 * Shown instead of customer reviews until real, verifiable reviews exist.
 * Invented reviews must never go here (consumer protection rules and Meta ad policy).
 * When real reviews arrive, add a reviews block back and show the average under the product title.
 */
const POINTS = [
  { icon: ShieldCheck, t: '14 napos pénzvisszafizetési garancia', b: 'Hordd, próbáld ki. Ha nem válik be, az átvételtől számított 14 napon belül jelezd, és visszautaljuk a vételárat.' },
  { icon: Ruler, t: 'Méret, amit nem kell kitalálni', b: 'A méretkalkulátor a tenyérkörméreted alapján megmondja, melyik méret a tiéd.' },
  { icon: Truck, t: 'Fizetés átvételkor', b: 'GLS futárral 1–2 munkanap alatt nálad, és csak akkor fizetsz, amikor a kezedben van.' },
];

export function NewBrand() {
  return <section id="brand" className="cw-section"><div className="cw-container">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center [&>*]:min-w-0">
      <div>
        <p className="cw-label text-signal-text">Új magyar márka</p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">Most indultunk. Ezért kockázat nélkül próbálhatod ki.</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-text-muted sm:text-base sm:leading-7">Még kevés vásárlói értékelésünk van. Amit addig is vállalunk:</p>
      </div>
      <ul className="grid gap-3">
        {POINTS.map(p => <li key={p.t} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal-text"><p.icon size={18} strokeWidth={1.75} /></span>
          <div className="min-w-0"><p className="font-extrabold leading-tight">{p.t}</p><p className="mt-1 text-sm leading-6 text-text-muted">{p.b}</p></div>
        </li>)}
      </ul>
    </div>
  </div></section>;
}
