/** Storybook Atlas utility UI: reusable local-demo dialogs and states, ready for future API-backed flows. */
import { AlertTriangle, ArrowRight, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function DemoDialog({ open, title, body, confirmLabel, danger = false, onConfirm, onClose }: { open: boolean; title: string; body: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) confirmRef.current?.focus(); }, [open]);
  if (!open) return null;
  return <div className="demo-dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="demo-dialog" role="alertdialog" aria-modal="true" aria-labelledby="demo-dialog-title" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}><button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={19} /></button><span className="demo-dialog-icon"><AlertTriangle size={18} /></span><h2 id="demo-dialog-title">{title}</h2><p>{body}</p><div><button className="outlined-action" onClick={onClose}>Keep it</button><button ref={confirmRef} className={danger ? "danger-button" : "coral-button"} onClick={onConfirm}>{confirmLabel}</button></div></section></div>;
}

export function LoadingJournal({ label = "Opening the next page…" }: { label?: string }) { return <div className="journal-loading" aria-live="polite"><i /><i /><i /><span>{label}</span></div>; }

export function ErrorJournal({ title, body, onRetry }: { title: string; body: string; onRetry: () => void }) { return <section className="error-journal" role="status"><AlertTriangle size={22} /><div><h3>{title}</h3><p>{body}</p></div><button className="outlined-action" onClick={onRetry}>Try again <ArrowRight size={15} /></button></section>; }

export function GlobalSearchDialog({ open, onClose, onRoute }: { open: boolean; onClose: () => void; onRoute: (path: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  if (!open) return null;
  const destinations = [["Goa", "/trips/goa-adventure"], ["Jaipur", "/destinations"], ["Udaipur", "/destinations"]] as const;
  const activities = [["Sunset Cruise", "/activities"], ["Kala Ghoda Breakfast", "/activities"], ["Marine Drive Sunset", "/activities"]] as const;
  return <div className="demo-dialog-backdrop search-backdrop" role="presentation" onMouseDown={onClose}><section className="global-search-dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-title" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}><div className="global-search-input"><Search size={19} /><input ref={inputRef} aria-label="Search trips, destinations, and activities" placeholder="Search your atlas…" /><kbd>Esc</kbd></div><h2 id="global-search-title">Find a page in your atlas</h2><SearchGroup label="Destinations" items={destinations} onRoute={onRoute} /><SearchGroup label="Activities" items={activities} onRoute={onRoute} /><SearchGroup label="Trips" items={[["Goa Adventure", "/trips/goa-adventure"], ["My Trips", "/trips"]]} onRoute={onRoute} /></section></div>;
}

function SearchGroup({ label, items, onRoute }: { label: string; items: readonly (readonly [string, string])[]; onRoute: (path: string) => void }) { return <div className="search-group"><span>{label}</span>{items.map(([name, path]) => <button key={name} onClick={() => onRoute(path)}>{name}<ArrowRight size={15} /></button>)}</div>; }
