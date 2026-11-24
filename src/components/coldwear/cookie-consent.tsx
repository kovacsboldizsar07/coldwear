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
 return <>{banner&&!settings&&<div className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 backdrop-blur-[2px] animate-in fade-in-0 duration-300 sm:items-center sm:p-6">
  <section role="dialog" aria-modal="true" aria-labelledby="cw-cookie-title" className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-surface shadow-2xl animate-in slide-in-from-bottom-8 duration-500 sm:max-w-[460px] sm:rounded-3xl">
   <div className="h-1.5 bg-gradient-to-r from-signal via-signal-text to-signal"/>
   <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pb-7 sm:pt-6">
    <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-signal/15 text-signal-text"><Cookie className="size-7 animate-[cw-wiggle_2.4s_ease-in-out_1s_2]" strokeWidth={1.75}/></span><h2 id="cw-cookie-title" className="text-xl font-extrabold leading-6 tracking-tight sm:text-2xl">Kérhetünk egy sütit?</h2></div>
    <p className="mt-3 text-sm leading-6 text-text-muted">A sütikkel látjuk, mi működik az oldalon, és így <strong className="font-semibold text-text">neked szóló ajánlatokat</strong> mutathatunk a hirdetésekben. Te döntesz, a webshop nélkülük is ugyanúgy működik.</p>
    <ul className="mt-3 grid gap-1.5 text-[13px] text-text-muted"><li className="flex items-center gap-2"><ShieldCheck className="size-4 shrink-0 text-go"/>Nem adjuk el az adataidat</li><li className="flex items-center gap-2"><SlidersHorizontal className="size-4 shrink-0 text-go"/>Bármikor módosíthatod a lábléc „Süti beállítások” linkjével</li></ul>
    <div className="mt-5 grid gap-2.5 sm:grid-cols-2"><Button disabled={saving} className="h-auto min-h-13 rounded-2xl px-3 py-3 text-[15px] font-extrabold normal-case shadow-lg shadow-signal/25" onClick={()=>void save(true,true)}>{saving?<Loader2 className="size-4 animate-spin"/>:null}Elfogadom</Button><Button disabled={saving} className="h-auto min-h-13 rounded-2xl bg-text px-3 py-3 text-[15px] font-extrabold normal-case text-surface hover:bg-text/90" onClick={()=>void save(false,false)}>Csak a szükségesek</Button></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs"><button type="button" disabled={saving} onClick={openSettings} className="inline-flex items-center gap-1 font-semibold text-text underline underline-offset-2"><SlidersHorizontal className="size-3.5"/>Beállítások</button><span className="flex gap-3 text-text-muted"><Link to="/sutik" className="underline">Süti tájékoztató</Link><Link to="/adatvedelem" className="underline">Adatvédelem</Link></span></div>
   </div>
  </section>
 </div>}
 <Dialog open={settings} onOpenChange={open=>{if(!saving)setSettings(open)}}><DialogContent className="max-h-[85dvh] max-w-[calc(100%-32px)] overflow-y-auto rounded-2xl bg-surface sm:max-w-lg"><DialogTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-signal-text"/>Süti beállítások</DialogTitle><DialogDescription>A választásod hat hónapig érvényes. A láblécben bármikor módosíthatod, a vásárlást nem befolyásolja.</DialogDescription>
 <div className="divide-y divide-line"><div className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-bold">Szükséges</p><p className="mt-1 text-xs text-text-muted">Kosár és a választásod megjegyzése.</p></div><span className="shrink-0 text-xs font-semibold text-go">Mindig aktív</span></div>
 <div className="flex items-center justify-between gap-4 py-4"><label htmlFor="cw-statistics" className="min-w-0"><span className="text-sm font-bold">Statisztika</span><span className="mt-1 block text-xs text-text-muted">Oldalmegtekintések és használat mérése.</span></label><Switch id="cw-statistics" checked={statistics} disabled={saving} onCheckedChange={setStatistics}/></div>
 <div className="flex items-center justify-between gap-4 py-4"><label htmlFor="cw-marketing" className="min-w-0"><span className="text-sm font-bold">Marketing</span><span className="mt-1 block text-xs text-text-muted">Meta hirdetésmérés és optimalizálás.</span></label><Switch id="cw-marketing" checked={marketing} disabled={saving} onCheckedChange={setMarketing}/></div></div>
 <p className="text-xs leading-5 text-text-muted">{MARKETING_NOTICE_TEXT}</p><div className="flex flex-wrap gap-4 text-xs"><Link to="/adatvedelem" className="underline">Adatvédelem</Link><Link to="/sutik" className="underline">Süti tájékoztató</Link></div><Button disabled={saving} className="min-h-11 rounded-xl normal-case" onClick={()=>void save(statistics,marketing)}>{saving&&<Loader2 className="animate-spin"/>}Választás mentése</Button></DialogContent></Dialog></>;
}
