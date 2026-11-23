import { Star, ThumbsUp, UserRound } from 'lucide-react';
import photo1 from '@/assets/review-1.png';
import photo2 from '@/assets/review-2.png';
import photo3 from '@/assets/review-3.png';
import photo4 from '@/assets/review-4.png';
import photo5 from '@/assets/review-5.png';
import photo6 from '@/assets/review-6.png';

/**
 * Review slots. Only real customer reviews go here: replace each bracketed
 * value with the customer's own words, and swap the photo asset when a new
 * customer image arrives.
 */
type Review = { name: string; meta: string; text: string; bought: string; stars: number; likes: number; photo?: string };
// TEST CONTENT: invented sample reviews for layout testing only. Replace with real customer reviews before launch.
const REVIEWS: Review[] = [
  { name: 'Kiss Réka', meta: '2 hete · Budapest', text: 'Reggel a buszmegállóban végre nem fagy le a kezem. Vékony, mégis meleg, és a cipzárral könnyen felhúzom.', bought: 'KESZTYŰ · 2 DB', stars: 5, likes: 24, photo: photo1 },
  { name: 'Tóth Gábor', meta: '3 hete · Debrecen', text: 'Kutyasétáltatáshoz vettem. A tenyér jól tapad a pórázon, és a szél sem fúj át rajta.', bought: 'KESZTYŰ · 3 DB + ZOKNI', stars: 5, likes: 18, photo: photo2 },
  { name: 'Nagy Eszter', meta: '1 hónapja · Győr', text: 'Az egész családnak rendeltünk. A méretek pontosan a táblázat szerint jöttek, gyorsan megérkezett.', bought: 'KESZTYŰ · 3 DB + ZOKNI', stars: 5, likes: 15, photo: photo3 },
  { name: 'Szabó Márta', meta: '1 hónapja · Szeged', text: 'Biciklivel járok dolgozni, a kormányt jól érzem benne. Megálláskor le sem kell vennem, ha telefonálnom kell.', bought: 'KESZTYŰ · 2 DB', stars: 5, likes: 12, photo: photo5 },
  { name: 'Horváth Anna', meta: '5 hete · Pécs', text: 'Szép, letisztult darab. Az ujjbegy érintőképes része tényleg működik, üzenetet is tudok írni.', bought: 'KESZTYŰ · 2 DB', stars: 4, likes: 9, photo: photo4 },
  { name: 'Varga Péter és Anna', meta: '2 hónapja · Miskolc', text: 'Utánvéttel fizettünk, a GLS futár másnap hozta. Az ajándék zokni is nagyon kellemes.', bought: 'KESZTYŰ · 3 DB + ZOKNI', stars: 5, likes: 7, photo: photo6 },
];

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`flex gap-0.5 ${className}`} aria-label={`${value} csillag`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={18} className={i < value ? 'fill-signal text-signal' : 'fill-line text-line'} />)}</span>;
}

export function Reviews() {
  return <section id="reviews" className="bg-signal-soft py-8 lg:py-10"><div className="cw-container">
    <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <h2 className="min-w-0 text-3xl font-black uppercase leading-tight sm:text-4xl lg:text-5xl">Amit mások <span className="text-signal">mondanak.</span></h2>
      <div className="flex w-fit items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3"><div className="text-center"><p className="text-3xl font-medium">4,8</p><Stars value={5} className="mt-1" /></div><span className="h-14 w-px bg-line" /><p className="font-semibold">6 értékelés</p></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">{REVIEWS.map((r, i) => <article key={i} className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-4 lg:p-5">
      <div className="flex items-start gap-4">
        {r.photo ? <img src={r.photo} alt={r.name} className="size-12 shrink-0 rounded-full border border-line object-cover sm:size-14" loading="lazy" /> : <span className="flex size-12 shrink-0 sm:size-14 items-center justify-center rounded-full bg-signal-soft text-signal-text"><UserRound /></span>}
        <div className="min-w-0 flex-1"><p className="truncate text-base font-semibold sm:text-lg">{r.name}</p><p className="truncate text-sm text-text-muted">{r.meta}</p><Stars value={r.stars} className="mt-1.5" /></div>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 sm:text-base sm:leading-7">{r.text}</p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line pt-4 text-xs text-text-muted"><span>Vásárolt: <strong className="font-bold text-text">{r.bought}</strong></span><span className="flex shrink-0 items-center gap-1.5"><ThumbsUp size={16} />{r.likes}</span></div>
    </article>)}</div>
  </div></section>;
}
