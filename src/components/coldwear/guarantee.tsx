import badge from '@/assets/guarantee-badge.png.asset.json';

export function Guarantee() {
  return <section id="guarantee" className="py-8 lg:py-10"><div className="cw-container">
    <div className="grid items-center gap-5 rounded-3xl bg-text p-5 text-bg sm:grid-cols-[auto_minmax(0,1fr)] sm:p-6 lg:gap-8 lg:p-8">
      <img src={badge.url} alt="14 napos pénzvisszafizetési garancia jelvény" loading="lazy" className="mx-auto w-28 rounded-full lg:w-36" />

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-signal">14 napos pénzvisszafizetési garancia</p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight lg:text-3xl">Hordd két hétig. Ha nem válik be, visszaadjuk a pénzed.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-on-block-muted">Az átvételtől számított 14 napon belül jelezd nekünk, és visszautaljuk a vételárat.</p>
      </div>
    </div>
  </div></section>;
}
