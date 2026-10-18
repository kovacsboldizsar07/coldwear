import waterGifAsset from '@/assets/water-gif.gif.asset.json';

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
          </div>
          <div className="overflow-hidden rounded-2xl border border-signal/45 bg-surface">
            <img
              src={waterGifAsset.url}
              alt="A víz lepereg a kesztyű felületéről"
              className="block h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
