/** Storybook Atlas UI reminder: reusable product UI uses tangible tickets, route labels, clear actions, and supportive empty states. */

import { ArrowRight, Compass, Route, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, accent, description, action }: { eyebrow: string; title: string; accent?: string; description: string; action?: ReactNode }) {
  return <section className="product-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title} {accent && <em>{accent}</em>}</h1><p>{description}</p></div>{action && <div className="product-intro-action">{action}</div>}</section>;
}

export function RouteConnector({ label }: { label: string }) {
  return <div className="route-connector product-connector" aria-hidden="true"><i /><span>{label}</span><i /></div>;
}

export function EmptyJournal({ title, body, actionLabel, actionPath }: { title: string; body: string; actionLabel: string; actionPath: string }) {
  const [, setLocation] = useLocation();
  return <section className="empty-journal"><div className="empty-orbit"><Route size={31} /></div><span className="eyebrow">Nothing to unpack</span><h2>{title}</h2><p>{body}</p><button className="coral-button" onClick={() => setLocation(actionPath)}><Compass size={17} /> {actionLabel}</button></section>;
}

export function LoadingTicket({ label = "Putting your travel notes in order…" }: { label?: string }) {
  return <section className="loading-ticket" aria-live="polite"><Sparkles size={18} /><span>{label}</span><div><i /><i /><i /></div></section>;
}

export function TripTabs({ active }: { active: "overview" | "itinerary" | "calendar" | "budget" | "map" | "share" }) {
  const [, setLocation] = useLocation();
  const tabs = [
    ["overview", "Overview", "/trips/goa-adventure"],
    ["itinerary", "Itinerary", "/trips/goa-adventure/itinerary"],
    ["calendar", "Calendar", "/trips/goa-adventure/calendar"],
    ["budget", "Budget", "/trips/goa-adventure/budget"],
    ["map", "Map", "/trips/goa-adventure/map"],
    ["share", "Share", "/trips/goa-adventure/share"],
  ] as const;
  return <nav className="trip-tabs" aria-label="Goa Adventure sections">{tabs.map(([id, label, path]) => <button key={id} className={id === active ? "active" : ""} onClick={() => setLocation(path)}>{label}</button>)}</nav>;
}

export function BackToTrips() {
  const [, setLocation] = useLocation();
  return <button className="soft-link" onClick={() => setLocation("/trips")}><ArrowRight size={15} style={{ transform: "rotate(180deg)" }} /> My trips</button>;
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || "upcoming";
  const colorMap: Record<string, string> = {
    upcoming: "status-upcoming",
    planned: "status-upcoming",
    ongoing: "status-ongoing",
    active: "status-ongoing",
    completed: "status-completed",
    draft: "status-draft",
  };
  const className = `status-pill ${colorMap[normalized] || "status-upcoming"}`;
  return <span className={className}>{status}</span>;
}
