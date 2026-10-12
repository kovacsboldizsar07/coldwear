import { ShieldCheck } from 'lucide-react';

export function Guarantee() {
  return <section id="guarantee" className="py-16 md:py-20"><div className="cw-container">
    <div className="grid items-center gap-8 rounded-3xl bg-text p-8 text-bg md:grid-cols-[auto_1fr] md:gap-12 md:p-12">
      <div className="mx-auto flex size-48 flex-col items-center justify-center rounded-full border border-dashed border-signal p-3 text-center text-signal"><div className="flex size-full flex-col items-center justify-center rounded-full border border-signal/40">
        <ShieldCheck size={40} strokeWidth={1.5} />
        <span className="mt-2 text-xs font-bold">[garancia badge]</span>
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-signal">14 napos pénzvisszafizetési garancia</p>
        <h2 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">Hordd két hétig. Ha nem válik be, visszaadjuk a pénzed.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-on-block-muted">Az átvételtől számított 14 napon belül jelezd nekünk, és visszautaljuk a vételárat. Ha csak a méret nem jó, ingyen cseréljük. [A visszaküldés pontos feltételei]</p>
      </div>
    </div>
  </div></section>;
}
