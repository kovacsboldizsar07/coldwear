import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Menu,ShoppingBag,Truck,X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { useCart } from '@/stores/cart';
import { initializeTracking,track } from '@/lib/track';
import { CartDrawer } from './cart-drawer';
import { CookieConsent } from './cookie-consent';
import logo from '@/assets/coldwear-logo.png.asset.json';
export function StoreShell({children}:{children:ReactNode}){
 const [message,setMessage]=useState(0),[menu,setMenu]=useState(false),[hydrated,setHydrated]=useState(false);const location=useLocation();const count=useCart(s=>s.cart?.totalQuantity||0);const setOpen=useCart(s=>s.setOpen);
 useEffect(()=>{initializeTracking();setHydrated(true);void Promise.resolve(useCart.persist.rehydrate()).then(()=>useCart.getState().sync());const sync=()=>{if(document.visibilityState==='visible')void useCart.getState().sync()};document.addEventListener('visibilitychange',sync);const consentSync=()=>{void useCart.getState().sync()};window.addEventListener('cw-consent',consentSync);const interval=setInterval(()=>setMessage(m=>(m+1)%2),4000);return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',sync);window.removeEventListener('cw-consent',consentSync)}},[]);
 useEffect(()=>{if(hydrated)track('PageView');setMenu(false)},[location.pathname]);
 const scroll=(id:string)=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:'smooth'})};
 return <><div className="bg-signal text-on-signal"><div className="cw-container flex h-9 font-bold items-center justify-center gap-2"><Truck size={14} strokeWidth={1.5}/><span className="cw-label text-[10px] sm:text-[11px]">{['Ingyenes szállítás 3 terméktől','1–2 munkanap alatt nálad, GLS'][message]}</span></div></div>
 <header className="cw-nav"><div className="cw-container flex h-[82px] items-center justify-between gap-4"><Link to="/" className="flex shrink-0 items-center" aria-label="ColdWear főoldal"><img src={logo.url} alt="" className="h-7 w-auto sm:h-9 lg:h-10"/></Link>
 <nav className="hidden items-center gap-5 md:flex" aria-label="Főmenü"><Link to="/" className="text-sm font-semibold">Thermo kesztyű</Link><Link to="/" hash="size_chart" className="text-sm font-semibold">Mérettáblázat</Link><Link to="/visszakuldes" className="text-sm font-semibold">Garancia</Link></nav>
 <div className="flex items-center gap-2"><Button variant="outline" aria-label="Kosár megnyitása" onClick={()=>setOpen(true)} className="h-11 gap-2 border-line px-3"><ShoppingBag strokeWidth={1.5}/><span className="hidden text-sm sm:inline">Kosár</span><span className="font-mono text-xs">({hydrated?count:0})</span></Button><Button variant="ghost" size="icon" aria-label="Menü" className="md:hidden" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</Button></div></div>
 {menu&&<nav className="cw-container flex flex-col gap-3 border-t border-line py-5"><Link to="/">Thermo kesztyű</Link><Link to="/szallitas">Szállítás</Link></nav>}</header>
 <main>{children}</main>
 <footer className="border-t border-line pb-24 pt-14 md:pb-8"><div className="cw-container"><div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]"><div><Link to="/" className="inline-flex" aria-label="ColdWear főoldal"><img src={logo.url} alt="" className="h-6 w-auto"/></Link><p className="cw-body mt-3 max-w-xs text-sm">Kesztyű és zokni a téli hétköznapokhoz.<br/>A hideg maradjon kint.</p></div><div className="flex flex-col gap-3 text-sm"><p className="cw-label mb-1 text-text-muted">Segítünk</p><Link to="/szallitas">Szállítás és fizetés</Link><Link to="/visszakuldes">Visszaküldés</Link></div><div className="flex flex-col gap-3 text-sm"><p className="cw-label mb-1 text-text-muted">Tudnivalók</p><Link to="/aszf">Általános szerződési feltételek</Link><Link to="/adatvedelem">Adatvédelem</Link><Link to="/sutik">Süti tájékoztató</Link><Button variant="link" className="h-auto justify-start p-0 text-text" onClick={()=>window.dispatchEvent(new Event('cw-cookie-settings'))}>Süti beállítások</Button></div></div><div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-xs text-text-muted"><span>© 2026 ColdWear</span><span>GLS · Online bankkártya · Utánvét</span></div></div></footer>
 <CartDrawer/>{hydrated&&<CookieConsent/>}<Toaster position="top-center"/></>;
}
