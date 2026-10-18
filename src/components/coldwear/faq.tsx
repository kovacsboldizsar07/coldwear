import { Link } from '@tanstack/react-router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_GROUPS = [
  {
    title: 'Használat és védelem',
    items: [
      { question: 'Milyen hidegre ajánlott a kesztyű?', answer: '−10 °C-ig ajánlott, leginkább a magyar téli időre. A hőérzet függ a széltől, a mozgástól, a kint töltött időtől és attól is, mennyire vagy fázós.' },
      { question: 'Mire használhatom?', answer: 'Téli sétához, hétköznapi közlekedéshez, kerékpározáshoz és vezetéshez. A vékonyabb kialakítás segíti a fogást, a polár belső pedig melegen tart. Nem munkavédelmi vagy speciális sportkesztyű.' },
      { question: 'Tudom benne használni a telefonomat?', answer: 'Igen, az érintőképes ujjbegyekkel kezelheted a kijelzőt anélkül, hogy levennéd. A pontos működés a méret illeszkedésétől és a kijelzővédőtől is függhet. Vezetés közben ne használd a telefonodat.' },
      { question: 'Vízálló vagy vízlepergető?', answer: 'Vízlepergető. Ez nem jelent teljes vízállóságot, ezért vízbe merítéshez vagy tartós áztatáshoz nem ajánlott.' },
      { question: 'Mire jó a csúszásgátló tenyér és a cipzár?', answer: 'A tenyér mintázata segíti a biztosabb fogást. A csuklón lévő cipzár megkönnyíti a felvételt, becsukva pedig szorosabb illeszkedést ad.' },
    ],
  },
  {
    title: 'Méret és csomagválasztás',
    items: [
      { question: 'Hogyan válasszam ki a kesztyű méretét?', answer: 'Mérd meg a tenyered körméretét a hüvelykujj nélkül, a képen jelölt helyen. A mérőszalag simuljon a kezedre, de ne szorítsa. A mérettáblázat és a méretkalkulátor segít a választásban.' },
      { question: 'Mi legyen, ha két méret határán vagyok?', answer: 'A kalkulátor a határértéken a nagyobb méretet ajánlja. Ellenőrizd a tenyérszélességet is a táblázatban: a kesztyű legyen kényelmes, de az ujjbegyeknél ne maradjon sok üres hely.' },
      { question: 'Választhatok eltérő méreteket egy csomagban?', answer: 'Igen. A csomagválasztóban minden kesztyűpár méretét külön állíthatod be, így másoknak is rendelhetsz ugyanabban a csomagban. Kosárba helyezés előtt ellenőrizd az összes kiválasztott méretet.' },
      { question: 'Hogyan kapom meg az ajándék zoknit?', answer: 'Válaszd a három kesztyűs csomagot, majd add meg az ajándék zokni méretét is. A csomagválasztóban és a kosárban ellenőrizheted a csomag tartalmát és az alkalmazott kedvezményt.' },
      { question: 'Hogyan válasszak zokniméretet?', answer: 'A cipőméreted alapján válaszd ki a megfelelő mérettartományt. A rendeléskor elérhető méreteket a zokniméret-választó mutatja, a mérettáblázatban pedig külön zoknirészt találsz.' },
      { question: 'Kell kuponkódot beírnom a csomaghoz?', answer: 'A csomagkedvezményt a kosár automatikusan kezeli a benne lévő termékek alapján. A fizetés előtt mindig ellenőrizd a kedvezményt és a végösszeget. Ha változtatod a kosár tartalmát, a kedvezmény is módosulhat.' },
    ],
  },
  {
    title: 'Szállítás és fizetés',
    items: [
      { question: 'Mennyi a szállítás, és mikor lehet ingyenes?', answer: 'Az ingyenes szállítás feltétele legalább 3 termék, a zoknit is beleszámítva, vagy legalább 17 000 Ft kedvezmények utáni termékösszeg. A kosár jelzi, mennyi hiányzik a feltételhez. A tényleges szállítási díjat és az alkalmazott szállítási kedvezményt a fizetési oldalon ellenőrizd.' },
      { question: 'Mikor és hogyan érkezik meg a rendelésem?', answer: 'A feltüntetett szállítási idő 1–2 munkanap, GLS kézbesítéssel. Ez tájékoztató idő, nem garantált határidő. Az elérhető kézbesítési módokat és a szállítási díjat a fizetési oldalon látod.' },
      { question: 'Hogyan tudok fizetni? Van utánvét?', answer: 'A rendeléshez ténylegesen elérhető fizetési módokat a fizetési oldalon találod. Ha az utánvét választható, annak díját és feltételeit is ott ellenőrizd a rendelés véglegesítése előtt.' },
      { question: 'Hol ellenőrizhetem a rendelés részleteit?', answer: 'Rendelés előtt a kosárban ellenőrizheted a termékeket, méreteket és kedvezményeket. A szállítási díjjal együtt számított végösszeget a fizetési oldal mutatja. Rendelés után őrizd meg a visszaigazolást és a rendelési azonosítót.' },
    ],
  },
  {
    title: 'Tisztítás és garancia',
    items: [
      { question: 'Hogyan tisztítsam a kesztyűt?', answer: 'Elsőként mindig a termék kezelési címkéjét kövesd. Kisebb szennyeződést nedves szivaccsal tisztíts. Ha a címke engedi, kézzel, langyos, legfeljebb 30 °C-os vízben, kímélő mosószerrel mosd. Gépi mosást csak akkor válassz, ha a címke megengedi, kímélő programon, zárt cipzárral és mosózsákban.' },
      { question: 'Száríthatom radiátoron vagy szárítógépben?', answer: 'Ne tedd radiátorra vagy szárítógépbe, és ne vasald. Ne csavard ki: óvatosan nyomkodd ki a vizet, majd fektetve, szobahőmérsékleten hagyd teljesen megszáradni. Öblítőt és fehérítőt se használj.' },
      { question: 'Mit jelent a 14 napos pénzvisszafizetési garancia?', answer: 'Az átvételtől számított 14 napon belül jelezheted, ha nem vált be a kesztyű. A visszaküldés menetét, költségét és a visszatérítés feltételeit a Visszaküldés és elállás oldalon találod.' },
      { question: 'Mit tegyek, ha gond van a rendeléssel?', answer: 'Írd meg nekünk a problémát. Add meg a rendelési azonosítót, és írd le röviden, mi történt. Hibás vagy sérült terméknél egy fotó is segíthet az ügyintézésben.' },
    ],
  },
];

export function ProductFaq() {
  return (
    <section id="faq" className="py-10 md:py-14" aria-labelledby="faq-heading">
      <div className="cw-container">
        <h2 id="faq-heading" className="cw-heading">Gyakori kérdések</h2>
        <div className="mt-8 grid items-start gap-x-12 gap-y-8 lg:grid-cols-2">
          {FAQ_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className="min-w-0">
              <h3 className="mb-3 text-lg font-extrabold text-signal-text">{group.title}</h3>
              <Accordion type="multiple" className="overflow-hidden rounded-2xl border border-line bg-surface">
                {group.items.map((item, itemIndex) => (
                  <AccordionItem key={item.question} value={`${groupIndex}-${itemIndex}`} className="border-line px-4 last:border-b-0 sm:px-6">
                    <AccordionTrigger className="gap-4 py-5 text-base font-bold leading-6 hover:no-underline [&>svg]:text-signal-text">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-base leading-7 text-text-muted">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-sm font-semibold">
          <Link to="/szallitas" className="text-signal-text underline underline-offset-4">Szállítás és fizetés</Link>
          <Link to="/visszakuldes" className="text-signal-text underline underline-offset-4">Visszaküldés és elállás</Link>
        </div>
      </div>
    </section>
  );
}