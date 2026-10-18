import waterGifAsset from '@/assets/water-gif.gif.asset.json';

export function Water() {
  return (
    <section className="cw-section" id="water">
      <div className="cw-container">
        <div className="grid items-center gap-6 rounded-3xl bg-signal-soft p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:p-8 [&>*]:min-w-0">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">Az eső sem akadály!</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
              A külső anyag vízlepergető felülettel készül. A csepp nem nyomódik át a szöveten, hanem a felszínén marad, majd lepereg. Havas esőben, latyakban és frissen hullott hóban is szárazon tartja a kezed.
            </p>
          </div>
          <div className="mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl border border-signal/45 bg-surface">
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
