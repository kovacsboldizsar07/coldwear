import { Star, ThumbsUp, UserRound } from 'lucide-react';

/**
 * Review slots. Only real customer reviews go here: replace each bracketed
 * value with the customer's own words, and add the photo URL when supplied.
 */
type Review = { name: string; meta: string; text: string; bought: string; stars: number; photo?: string };
const REVIEWS: Review[] = Array.from({ length: 6 }, (_, i) => ({
  name: `[Vásárló neve ${i + 1}]`,
  meta: '[mikor] · [település]',
  text: '[A vásárló saját szavaival írt, valódi véleménye.]',
  bought: '[KESZTYŰ · 2 DB]',
  stars: 5,
}));

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`flex gap-0.5 ${className}`} aria-label={`${value} csillag`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={18} className={i < value ? 'fill-signal text-signal' : 'fill-line text-line'} />)}</span>;
}

export function Reviews() {
  return <section id="reviews" className="bg-signal-soft py-16 md:py-24"><div className="cw-container">
    <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
      <h2 className="text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">Amit mások <span className="text-signal">mondanak.</span></h2>
      <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface px-6 py-4"><div className="text-center"><p className="text-4xl font-medium">[4,9]</p><Stars value={5} className="mt-1" /></div><span className="h-14 w-px bg-line" /><p className="font-semibold">[értékelések száma]</p></div>
    </div>
    <div className="grid gap-6 md:grid-cols-3">{REVIEWS.map((r, i) => <article key={i} className="flex flex-col rounded-2xl border border-line bg-surface p-7">
      <div className="flex items-start gap-4">
        {r.photo ? <img src={r.photo} alt={r.name} className="size-16 shrink-0 rounded-full object-cover" loading="lazy" /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal-text"><UserRound /></span>}
        <div className="flex-1"><p className="text-lg font-semibold">{r.name}</p><p className="text-sm text-text-muted">{r.meta}</p></div>
        <Stars value={r.stars} />
      </div>
      <p className="mt-6 flex-1 text-lg leading-8">{r.text}</p>
      <div className="mt-6 flex items-center justify-between border-t border-line pt-5 text-sm text-text-muted"><span>Vásárolt: <strong className="font-bold text-text">{r.bought}</strong></span><span className="flex items-center gap-1.5"><ThumbsUp size={16} />[0]</span></div>
    </article>)}</div>
  </div></section>;
}
