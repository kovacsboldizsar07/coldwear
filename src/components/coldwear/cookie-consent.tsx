import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Cookie, SlidersHorizontal, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { currentConsent,saveConsent } from '@/lib/track';
import { toast } from 'sonner';
import { MARKETING_NOTICE_TEXT } from '@/lib/marketing-rules';
export function CookieConsent(){
 const [banner,setBanner]=useState(false),[settings,setSettings]=useState(false),[statistics,setStatistics]=useState(false),[marketing,setMarketing]=useState(false),[saving,setSaving]=useState(false);
 useEffect(()=>{
  setBanner(!currentConsent());
  const refresh=()=>{const choice=currentConsent();setBanner(!choice);setStatistics(Boolean(choice?.statistics));setMarketing(Boolean(choice?.marketing))};
  const reopen=()=>{refresh();setSettings(true)};
  window.addEventListener('cw-cookie-settings',reopen);window.addEventListener('cw-consent',refresh);
  return()=>{window.removeEventListener('cw-cookie-settings',reopen);window.removeEventListener('cw-consent',refresh)};
 },[]);
 function openSettings(){setStatistics(Boolean(currentConsent()?.statistics));setMarketing(Boolean(currentConsent()?.marketing));setSettings(true)}
 async function save(stats:boolean,ads:boolean){if(saving)return;setSaving(true);try{await saveConsent(stats,ads);setBanner(false);setSettings(false)}catch{toast.error(ads?'A hozzájárulás mentése nem sikerült. A marketingmérés nem indult el.':'A mérés leállt; a visszavonás szerveroldali mentését internetkapcsolat után újrapróbáljuk.');}finally{setSaving(false)}}
 return <>{banner&&<section aria-label="Süti választás" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface">
  <div className="cw-container grid max-h-[80dvh] gap-4 overflow-y-auto py-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-8">
   <div className="min-w-0"><div className="mb-2 flex items-center gap-2"><Cookie className="size-5 shrink-0 text-signal-text"/><h2 className="text-lg font-extrabold">Sütik, a te választásod szerint.</h2></div>
    <p className="text-sm leading-6 text-text-muted">A kosárhoz szükséges sütik mindig aktívak. Engedélyeddel mérjük az oldal használatát, és a Metával a hirdetésekből érkező vásárlásokat. A webshop elfogadás nélkül is működik.</p>
    <details className="mt-2 text-xs leading-5 text-text-muted"><summary className="w-fit cursor-pointer font-semibold text-text">Milyen adatokat használunk?</summary><p className="mt-2">{MARKETING_NOTICE_TEXT}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1"><Link to="/sutik" className="underline">Süti tájékoztató</Link><Link to="/adatvedelem" className="underline">Adatvédelem</Link></div></details>
   </div>
   <div className="grid grid-cols-2 gap-2"><Button disabled={saving} variant="outline" className="h-auto min-h-11 rounded-xl border-signal/40 px-2 py-3 text-xs font-bold normal-case text-text sm:text-sm" onClick={()=>void save(true,true)}>{saving?<Loader2 className="size-4 animate-spin"/>:null}Összes elfogadása</Button><Button disabled={saving} variant="outline" className="h-auto min-h-11 rounded-xl border-signal/40 px-2 py-3 text-xs font-bold normal-case text-text sm:text-sm" onClick={()=>void save(false,false)}>Csak a szükségesek</Button><Button disabled={saving} variant="ghost" className="col-span-2 h-9 text-xs normal-case text-text-muted" onClick={openSettings}><SlidersHorizontal className="size-4"/>Testreszabás</Button></div>
  </div>
 </section>}
 <Dialog open={settings} onOpenChange={open=>{if(!saving)setSettings(open)}}><DialogContent className="max-h-[85dvh] max-w-[calc(100%-32px)] overflow-y-auto rounded-2xl bg-surface sm:max-w-lg"><DialogTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-signal-text"/>Süti beállítások</DialogTitle><DialogDescription>A választásod hat hónapig érvényes. A láblécben bármikor módosíthatod, a vásárlást nem befolyásolja.</DialogDescription>
 <div className="divide-y divide-line"><div className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-bold">Szükséges</p><p className="mt-1 text-xs text-text-muted">Kosár és a választásod megjegyzése.</p></div><span className="shrink-0 text-xs font-semibold text-go">Mindig aktív</span></div>
 <div className="flex items-center justify-between gap-4 py-4"><label htmlFor="cw-statistics" className="min-w-0"><span className="text-sm font-bold">Statisztika</span><span className="mt-1 block text-xs text-text-muted">Oldalmegtekintések és használat mérése.</span></label><Switch id="cw-statistics" checked={statistics} disabled={saving} onCheckedChange={setStatistics}/></div>
 <div className="flex items-center justify-between gap-4 py-4"><label htmlFor="cw-marketing" className="min-w-0"><span className="text-sm font-bold">Marketing</span><span className="mt-1 block text-xs text-text-muted">Meta hirdetésmérés és optimalizálás.</span></label><Switch id="cw-marketing" checked={marketing} disabled={saving} onCheckedChange={setMarketing}/></div></div>
 <p className="text-xs leading-5 text-text-muted">{MARKETING_NOTICE_TEXT}</p><div className="flex flex-wrap gap-4 text-xs"><Link to="/adatvedelem" className="underline">Adatvédelem</Link><Link to="/sutik" className="underline">Süti tájékoztató</Link></div><Button disabled={saving} className="min-h-11 rounded-xl normal-case" onClick={()=>void save(statistics,marketing)}>{saving&&<Loader2 className="animate-spin"/>}Választás mentése</Button></DialogContent></Dialog></>;
}
