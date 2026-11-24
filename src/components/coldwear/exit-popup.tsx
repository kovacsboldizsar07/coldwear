import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Check, Copy, Loader2, Mail, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { currentConsent, track } from "@/lib/track";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import {
  EXIT_POPUP_SEEN_KEY,
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
  SIGNUP_STORAGE_KEY,
  exitPopupAllowed,
} from "@/lib/newsletter-rules";

const MIN_DWELL_MS = 8_000;
const MOBILE_FALLBACK_MS = 40_000;
const HIDDEN_PATHS = ["/admin", "/aszf", "/adatvedelem", "/sutik"];

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: popup may show again */
  }
}

/** Free-shipping coupon for a newsletter sign-up, shown once when the visitor is about to leave. */
export function ExitPopup() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fired = useRef(false);
  const hiddenHere = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (hiddenHere || fired.current || read(SIGNUP_STORAGE_KEY)) return;
    const seen = Number(read(EXIT_POPUP_SEEN_KEY)) || null;
    if (!exitPopupAllowed(seen)) return;
    const startedAt = Date.now();
    const trigger = () => {
      if (fired.current || Date.now() - startedAt < MIN_DWELL_MS) return;
      // Never stack on top of the cookie choice or an open cart/dialog.
      if (!currentConsent() || document.querySelector('[role="dialog"]')) return;
      fired.current = true;
      write(EXIT_POPUP_SEEN_KEY, String(Date.now()));
      setOpen(true);
    };
    // Desktop: pointer leaves through the top edge (towards tabs / address bar).
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 8) trigger();
    };
    // Phones: a fast scroll back up after reading, or a long visit without a purchase.
    let lastY = window.scrollY,
      lastT = Date.now(),
      maxY = 0;
    const onScroll = () => {
      const y = window.scrollY,
        t = Date.now();
      maxY = Math.max(maxY, y);
      const speed = (lastY - y) / Math.max(1, t - lastT);
      if (maxY > 1200 && speed > 2.2 && y > 200) trigger();
      lastY = y;
      lastT = t;
    };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const timer = coarse ? window.setTimeout(trigger, MOBILE_FALLBACK_MS) : undefined;
    document.addEventListener("mouseout", onMouseOut);
    if (coarse) window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [hiddenHere]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !consent) return;
    setBusy(true);
    try {
      const result = await subscribeNewsletter({
        data: {
          email,
          consent: true,
          consentVersion: NEWSLETTER_CONSENT_VERSION,
          pagePath: location.pathname,
          website,
        },
      });
      write(SIGNUP_STORAGE_KEY, JSON.stringify({ code: result.code, at: Date.now() }));
      setCode(result.code);
      track("Lead", { content_name: "exit_popup_free_shipping" });
    } catch {
      toast.error("A feliratkozás most nem sikerült. Ellenőrizd az e-mail címet, és próbáld újra.");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the code stays visible to type by hand */
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92dvh] max-w-[calc(100%-24px)] gap-0 overflow-hidden overflow-y-auto rounded-3xl border-0 bg-surface p-0 sm:max-w-[440px] [&>button:last-child]:hidden">
        <div className="relative bg-block px-6 pb-6 pt-7 text-center text-on-block">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Bezárás"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/10 text-on-block hover:bg-white/20"
          >
            <X className="size-4" />
          </button>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-signal text-on-signal shadow-lg shadow-signal/30">
            <Truck className="size-7" strokeWidth={1.75} />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-signal">
            Várj egy percet!
          </p>
          <DialogTitle className="mt-1 text-3xl font-extrabold leading-8 tracking-tight">
            Ingyenes szállítás
            <br />
            az első rendelésedre
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-5 text-on-block/80">
            Iratkozz fel, és azonnal megkapod a kuponkódot. 990 Ft-ot spórolsz vele.
          </DialogDescription>
        </div>
        {code ? (
          <div className="px-6 pb-7 pt-6 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-bold text-go">
              <Check className="size-4" />
              Sikeres feliratkozás!
            </p>
            <p className="mt-3 text-sm text-text-muted">A kuponkódod (a pénztárban add meg):</p>
            <button
              type="button"
              onClick={() => void copy()}
              className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-signal bg-signal/10 px-4 py-4 font-mono text-2xl font-extrabold tracking-wider text-text"
            >
              {code}
              {copied ? (
                <Check className="size-5 text-go" />
              ) : (
                <Copy className="size-5 text-text-muted" />
              )}
            </button>
            <p className="mt-2 text-xs text-text-muted">
              {copied ? "Kimásolva!" : "Koppints a kódra a másoláshoz."}
            </p>
            <Button
              className="mt-5 h-13 w-full rounded-2xl text-[15px] font-extrabold normal-case"
              onClick={() => setOpen(false)}
            >
              Vissza a vásárláshoz
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="px-6 pb-6 pt-5">
            <label htmlFor="cw-exit-email" className="sr-only">
              E-mail cím
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
              <input
                id="cw-exit-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="E-mail címed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-13 w-full rounded-2xl border border-line bg-bg pl-12 pr-4 text-base outline-none focus:border-signal focus:ring-2 focus:ring-signal/30"
              />
            </div>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-text-muted">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                {NEWSLETTER_CONSENT_TEXT}{" "}
                <Link to="/adatvedelem" className="underline" onClick={() => setOpen(false)}>
                  Adatvédelmi tájékoztató
                </Link>
              </span>
            </label>
            <Button
              type="submit"
              disabled={busy || !consent}
              className="mt-4 h-13 w-full rounded-2xl text-[15px] font-extrabold normal-case shadow-lg shadow-signal/25"
            >
              {busy && <Loader2 className="animate-spin" />}Kérem a kupont
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-center text-xs font-semibold text-text-muted underline underline-offset-2"
            >
              Most nem, köszönöm
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
