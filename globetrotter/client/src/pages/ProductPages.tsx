/**
 * Storybook Atlas UI reminder: each page belongs to one travel-planning journey.
 * Use practical planning controls inside a warm illustrated atlas, never a generic dashboard.
 */

import { BackToTrips, EmptyJournal, PageIntro, RouteConnector, TripTabs } from "@/components/ProductUi";
import { DemoDialog } from "@/components/DemoUi";
import { AtlasRevealImage } from "@/components/travel/AtlasRevealImage";
import { DestinationPhotoGallery } from "@/components/travel/DestinationPhotoGallery";
import { StorybookAtlasMap } from "@/components/travel/StorybookAtlasMap";
import { DestinationPickerMap } from "@/components/travel/DestinationPickerMap";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { useAuth } from "@/contexts/AuthContext";
import { extractFirstName } from "@/lib/nameFormatter";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";
import { DestinationsManager } from "@/components/destinations/DestinationsManager";
import { TripsListView } from "@/components/trips/TripsListView";
import { PublicSharePage } from "@/components/trips/PublicSharePage";
import { mongoTripService } from "@/services/api/mongoTripService";
import { goaPhotoStory } from "@/domain/destinationPhotoStories";
import { activityIdeas, cityCatalog, sampleTripSummaries, type ActivityIdea, type TripStatus } from "@/domain/trip";
import { formatRupees, getAllActivities, getAllDays, getEstimatedCost, getExpenseBreakdown, getPlanningProgress } from "@/lib/tripMath";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { useMemo, useState, useEffect, type DragEvent } from "react";
import {
  ArrowRight, CalendarDays, Check, ChevronDown, ChevronRight, CircleDollarSign, ClipboardCopy, Compass,
  Copy, Crown, GripVertical, Heart, LayoutList, MapPin, MoreHorizontal, Pencil, PlaneTakeoff, Plus,
  Route, Search, Settings2, Share2, Sparkles, Trash2, UserRound, WalletCards, WandSparkles,
} from "lucide-react";

import brandLogo from "@/assets/branding/globetrotter-logo.png";
import HERO_ART from "@/assets/illustrations/globetrotter-hero-atlas.png";
import GOA_ART from "@/assets/illustrations/globetrotter-goa-vignette.png";
import STAMPS_ART from "@/assets/illustrations/globetrotter-city-stamps.png";

function StatusPill({ status }: { status: TripStatus }) { return <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>; }

function TripStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="trip-stat"><span className="trip-stat-icon">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>; }

/*
export function DashboardPage() {
  const { trip, estimatedCost } = useTripPlanner();
  const [, setLocation] = useLocation();
  const progress = getPlanningProgress(trip);
  const remaining = trip.budget - estimatedCost;
  const activityCount = getAllActivities(trip).length;
  return <div className="page-stack dashboard-page">
    <PageIntro eyebrow="Tuesday, 22 August" title="Good morning, Mita." accent="Where will your next story take you?" description="Your Goa route is warm, organised, and nearly ready for the good kind of detour." action={<div className="intro-actions"><button className="coral-button" onClick={() => setLocation("/trips/new")}><PlaneTakeoff size={17} /> Plan a new trip</button><button className="outlined-action" onClick={() => setLocation("/destinations")}><Compass size={17} /> Explore destinations</button></div>} />
    <section className="dashboard-grid refined-dashboard-grid"><article className="hero-trip-card"><div className="hero-copy"><div className="ticket-label"><Crown size={15} /> Next big story</div><h2>{trip.name}<br /><span>is taking shape.</span></h2><p>{trip.description}</p><div className="hero-metadata"><span><CalendarDays size={15} /> {trip.dateRange}</span><span><MapPin size={15} /> {trip.stops.map((stop) => stop.city).join(" → ")}</span></div><button className="coral-button" onClick={() => setLocation(`/trips/${trip.id}`)}>Open trip overview <ArrowRight size={18} /></button></div><img src={HERO_ART} alt="Illustrated tropical travel route with a car, paper plane, palms, and scenic destinations" className="hero-art" /><div className="hero-stamp">5<br /><span>days</span></div></article>
      <aside className="trip-pulse-card"><div className="panel-heading"><div><span className="eyebrow">Journey pulse</span><h3>Ready for takeoff</h3></div><button aria-label="Trip options"><MoreHorizontal size={20} /></button></div><div className="route-snapshot"><span className="route-dot start">1</span><span className="route-dash" /><span className="route-dot end">2</span><div><strong>{trip.stops[0]?.city}</strong><small>{trip.stops[0]?.dateRange}</small></div><div><strong>{trip.stops.at(-1)?.city}</strong><small>{trip.stops.at(-1)?.dateRange}</small></div></div><div className="pulse-divider" /><div className="progress-ring-block"><div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><div><strong>{progress}%</strong><span>planned</span></div></div><div className="progress-ring-copy"><strong>Route outlined</strong><span>{activityCount} planned moments across {trip.stops.length} stops</span></div></div><div className="pulse-divider" /><button className="budget-mini actionable-mini" onClick={() => setLocation(`/trips/${trip.id}/budget")}><div className="coin-icon"><CircleDollarSign size={18} /></div><div><span>Budget breathing room</span><strong>{formatRupees(remaining)} left to play with</strong></div><ChevronRight size={17} /></button></aside></section>
    <section className="section-row"><div className="section-heading"><div><span className="eyebrow">Your travel desk</span><h2>Keep the good stuff moving.</h2></div><button onClick={() => setLocation("/trips/goa-adventure/itinerary")} className="text-action">See full plan <ArrowRight size={16} /></button></div><div className="next-step-grid"><button className="next-step-card mustard" onClick={() => setLocation("/destinations")}><span className="step-count">01</span><div className="step-icon"><Plus size={20} /></div><h3>Add a new stop</h3><p>Put the next pin on your route.</p><ArrowRight size={18} /></button><button className="next-step-card teal" onClick={() => setLocation("/activities")}><span className="step-count">02</span><div className="step-icon"><WandSparkles size={20} /></div><h3>Find a standout activity</h3><p>Make the Goa days more you.</p><ArrowRight size={18} /></button><button className="next-step-card coral" onClick={() => setLocation("/trips/goa-adventure/share")}><span className="step-count">03</span><div className="step-icon"><Share2 size={20} /></div><h3>Send the rough cut</h3><p>Invite a travel buddy in early.</p><ArrowRight size={18} /></button></div></section>
    <section className="dashboard-lower-grid"><article className="dashboard-list-card"><div className="panel-heading"><div><span className="eyebrow">Upcoming trips</span><h3>Your next pages</h3></div><button className="text-action" onClick={() => setLocation("/trips")}>All trips <ArrowRight size={14} /></button></div>{sampleTripSummaries.slice(0, 2).map((tripCard) => <button className="mini-trip-row" key={tripCard.id} onClick={() => setLocation(tripCard.id === "goa-adventure" ? "/trips/goa-adventure" : "/trips")}><span className={`mini-trip-art ${tripCard.accent}`}><Route size={16} /></span><div><strong>{tripCard.name}</strong><span>{tripCard.route} · {tripCard.dateRange}</span></div><StatusPill status={tripCard.status} /><ChevronRight size={16} /></button>)}</article><article className="dashboard-budget-card"><span className="eyebrow">Budget snapshot</span><h3>{formatRupees(estimatedCost)} <em>planned</em></h3><div className="mini-budget-track"><i style={{ width: `${Math.min(100, Math.round((estimatedCost / trip.budget) * 100))}%` }} /></div><p><strong>{formatRupees(remaining)}</strong> is still open for tiny pleasures, quiet taxis, or one bigger moment.</p><button className="outlined-action" onClick={() => setLocation("/trips/goa-adventure/budget")}>Visit Budget Buddy <ArrowRight size={15} /></button></article></section>
    <section className="stories-strip"><div className="stories-content"><div><span className="eyebrow">Passport ideas</span><h2>Borrow a little magic from other routes.</h2><p>Explore thoughtful travel prompts tuned to the styles you’ve saved.</p><button className="ink-button" onClick={() => setLocation("/discover")}>Browse discoveries <ArrowRight size={16} /></button></div><img src={STAMPS_ART} alt="Illustrated city route symbols for travel inspiration" /></div></section>
  </div>;
}

export function TripsPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TripStatus | "All">("All");
  const [trips, setTrips] = useState(sampleTripSummaries);
  const filtered = trips.filter((trip) => (filter === "All" || trip.status === filter) && `${trip.name} ${trip.route}`.toLowerCase().includes(query.toLowerCase()));
  const deleteTrip = (id: string) => { setTrips((items) => items.filter((trip) => trip.id !== id)); toast.success("Trip tucked away from this demo journal."); };
  return <div className="page-stack trips-page"><PageIntro eyebrow="My trips" title="Every good story" accent="needs a route." description="Keep upcoming, ongoing, completed, and still-scribbled adventures together in one tidy travel desk." action={<button className="coral-button" onClick={() => setLocation("/trips/new")}><Plus size={17} /> Plan a trip</button>} /><section className="trip-filter-bar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your travel journal" aria-label="Search trips" /></label><div className="filter-chips">{(["All", "Upcoming", "Ongoing", "Completed", "Draft"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="sort-button"><Settings2 size={16} /> Newest first</button></section><RouteConnector label="routes waiting for you" /><section className="trip-card-grid">{filtered.length === 0 ? <EmptyJournal title="Your travel journal is waiting for its first story." body="Try a different filter, or begin with a route that feels like you." actionLabel="Plan a trip" actionPath="/trips/new" /> : filtered.map((trip) => <article className={`trip-management-card ${trip.accent}`} key={trip.id}><div className="trip-cover"><span className="ticket-label"><Route size={14} /> {trip.route}</span><span className="cover-number">{trip.progress}%</span></div><div className="trip-card-body"><div className="trip-card-title"><div><h2>{trip.name}</h2><p>{trip.dateRange} · {trip.route.split("→").length} cities</p></div><StatusPill status={trip.status} /></div><div className="trip-progress-row"><span>Route progress</span><div><i style={{ width: `${trip.progress}%` }} /></div><b>{trip.progress}%</b></div><div className="trip-card-meta"><span><CalendarDays size={14} /> {trip.id === "goa-adventure" ? "5 days" : "5 days"}</span><span><WalletCards size={14} /> {formatRupees(trip.budget)}</span></div><div className="trip-card-actions"><button className="outlined-action" onClick={() => setLocation(trip.id === "goa-adventure" ? `/trips/${trip.id}` : "/trips/new")}>View</button><button className="icon-text-button" onClick={() => toast.success("A copy has been started as a fresh draft.")}><Copy size={15} /> Duplicate</button><button className="icon-text-button danger" onClick={() => deleteTrip(trip.id)}><Trash2 size={15} /> Delete</button></div></div></article>)}</section></div>;
}

*/

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }
  return "Good Evening";
}

export function DashboardPage() {
  const { trip, estimatedCost } = useTripPlanner();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const progress = getPlanningProgress(trip);
  const remaining = trip.budget - estimatedCost;
  const activityCount = getAllActivities(trip).length;

  const timeGreeting = getTimeGreeting();
  const firstName = extractFirstName(user?.name);
  const greetingTitle = `${timeGreeting}, ${firstName}.`;

  return (
    <div className="page-stack dashboard-page">
      <PageIntro
        eyebrow="Tuesday, 22 August"
        title={greetingTitle}
        accent="Where will your next story take you?"
        description="Your Goa route is warm, organised, and nearly ready for the good kind of detour."
        action={<div className="intro-actions"><button className="coral-button" onClick={() => setLocation("/trips/new")}><PlaneTakeoff size={17} /> Plan a new trip</button><button className="outlined-action" onClick={() => setLocation("/destinations")}><Compass size={17} /> Explore destinations</button></div>}
      />
      <section className="dashboard-grid refined-dashboard-grid">
        <article className="hero-trip-card">
          <div className="hero-copy">
            <div className="ticket-label"><Crown size={15} /> Next big story</div>
            <h2>{trip.name}<br /><span>is taking shape.</span></h2>
            <p>{trip.description}</p>
            <div className="hero-metadata"><span><CalendarDays size={15} /> {trip.dateRange}</span><span><MapPin size={15} /> Mumbai → Goa</span></div>
            <button className="coral-button" onClick={() => setLocation("/trips/goa-adventure")}>Open trip overview <ArrowRight size={18} /></button>
          </div>
          <img src={HERO_ART} alt="Illustrated tropical travel route with a car, paper plane, palms, and scenic destinations" className="hero-art" />
          <div className="hero-stamp">5<br /><span>days</span></div>
        </article>
        <aside className="trip-pulse-card">
          <div className="panel-heading"><div><span className="eyebrow">Journey pulse</span><h3>Ready for takeoff</h3></div><button aria-label="Trip options"><MoreHorizontal size={20} /></button></div>
          <div className="route-snapshot"><span className="route-dot start">1</span><span className="route-dash" /><span className="route-dot end">2</span><div><strong>Mumbai</strong><small>12–13 Aug</small></div><div><strong>Goa</strong><small>14–16 Aug</small></div></div>
          <div className="pulse-divider" />
          <div className="progress-ring-block"><div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><div><strong>{progress}%</strong><span>planned</span></div></div><div className="progress-ring-copy"><strong>Route outlined</strong><span>{activityCount} planned moments across {trip.stops.length} stops</span></div></div>
          <div className="pulse-divider" />
          <button className="budget-mini actionable-mini" onClick={() => setLocation("/trips/goa-adventure/budget")}><div className="coin-icon"><CircleDollarSign size={18} /></div><div><span>Budget breathing room</span><strong>{formatRupees(remaining)} left to play with</strong></div><ChevronRight size={17} /></button>
        </aside>
      </section>
      <section className="section-row"><div className="section-heading"><div><span className="eyebrow">Your travel desk</span><h2>Keep the good stuff moving.</h2></div><button onClick={() => setLocation("/trips/goa-adventure/itinerary")} className="text-action">See full plan <ArrowRight size={16} /></button></div><div className="next-step-grid"><button className="next-step-card mustard" onClick={() => setLocation("/destinations")}><span className="step-count">01</span><div className="step-icon"><Plus size={20} /></div><h3>Add a new stop</h3><p>Put the next pin on your route.</p><ArrowRight size={18} /></button><button className="next-step-card teal" onClick={() => setLocation("/activities")}><span className="step-count">02</span><div className="step-icon"><WandSparkles size={20} /></div><h3>Find a standout activity</h3><p>Make the Goa days more you.</p><ArrowRight size={18} /></button><button className="next-step-card coral" onClick={() => setLocation("/trips/goa-adventure/share")}><span className="step-count">03</span><div className="step-icon"><Share2 size={20} /></div><h3>Send the rough cut</h3><p>Invite a travel buddy in early.</p><ArrowRight size={18} /></button></div></section>
      <section className="dashboard-lower-grid"><article className="dashboard-list-card"><div className="panel-heading"><div><span className="eyebrow">Upcoming trips</span><h3>Your next pages</h3></div><button className="text-action" onClick={() => setLocation("/trips")}>All trips <ArrowRight size={14} /></button></div><button className="mini-trip-row" onClick={() => setLocation("/trips/goa-adventure")}><span className="mini-trip-art teal"><Route size={16} /></span><div><strong>Goa Adventure</strong><span>Mumbai → Goa · 12–16 Aug</span></div><StatusPill status="Upcoming" /><ChevronRight size={16} /></button><button className="mini-trip-row" onClick={() => setLocation("/trips")}><span className="mini-trip-art coral"><Route size={16} /></span><div><strong>Jaipur Notebook</strong><span>Jaipur → Udaipur · 14–18 Nov</span></div><StatusPill status="Draft" /><ChevronRight size={16} /></button></article><article className="dashboard-budget-card"><span className="eyebrow">Budget snapshot</span><h3>{formatRupees(estimatedCost)} <em>planned</em></h3><div className="mini-budget-track"><i style={{ width: `${Math.min(100, Math.round((estimatedCost / trip.budget) * 100))}%` }} /></div><p><strong>{formatRupees(remaining)}</strong> is still open for tiny pleasures, quiet taxis, or one bigger moment.</p><button className="outlined-action" onClick={() => setLocation("/trips/goa-adventure/budget")}>Visit Budget Buddy <ArrowRight size={15} /></button></article></section>
      <section className="stories-strip"><div className="stories-content"><div><span className="eyebrow">Passport ideas</span><h2>Borrow a little magic from other routes.</h2><p>Explore thoughtful travel prompts tuned to the styles you’ve saved.</p><button className="ink-button" onClick={() => setLocation("/discover")}>Browse discoveries <ArrowRight size={16} /></button></div><img src={STAMPS_ART} alt="Illustrated city route symbols for travel inspiration" /></div></section>
    </div>
  );
}

/*
export function TripWizardPage() {
  const [, setLocation] = useLocation();
  const { trip, updateTripBasics, addStop } = useTripPlanner();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(trip.name);
  const [budget, setBudget] = useState(String(trip.budget));
  const [style, setStyle] = useState(trip.travelStyle);
  const [description, setDescription] = useState(trip.description);
  const [selectedCities, setSelectedCities] = useState<string[]>(trip.stops.map((stop) => stop.city));
  const steps = ["Basics", "Destinations", "Activities", "Review"];
  const finish = () => { updateTripBasics({ name: name.trim() || "Goa Adventure", budget: Number(budget) || 25000, description, travelStyle: style }); toast.success("Your trip basics are saved. The route is ready to shape."); setLocation(`/trips/${trip.id}`); };
  const selectCity = (city: string) => { setSelectedCities((current) => current.includes(city) ? current.filter((item) => item !== city) : [...current, city]); };
  const addNewCity = (cityId: string) => { const city = cityCatalog.find((item) => item.id === cityId); if (!city || selectedCities.includes(city.name)) return; selectCity(city.name); addStop({ city: city.name, country: city.country, region: city.region, dateRange: "17–18 Aug", arrival: "Mon, 17 Aug", departure: "Tue, 18 Aug" }); toast.success(`${city.name} is now a draft destination.`); };
  return <div className="page-stack wizard-page"><PageIntro eyebrow="Plan a new trip" title="Sketch the basics." accent="The details can wander later." description="This guided route keeps the big decisions clear without making trip planning feel like paperwork." action={<button className="soft-link" onClick={() => setLocation("/trips")}>← Back to my trips</button>} /><section className="wizard-shell"><div className="wizard-progress">{steps.map((label, index) => <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} onClick={() => setStep(index + 1)}><b>{step > index + 1 ? <Check size={14} /> : `0${index + 1}`}</b><span>{label}</span></button>)}</div><div className="wizard-stage">{step === 1 && <><span className="ticket-label"><Sparkles size={14} /> Step one</span><h2>Give the journey a name.</h2><p>A great route starts with an intention. You can keep it practical or write something worth remembering.</p><div className="field-grid"><label><span>Trip name</span><input value={name} onChange={(event) => setName(event.target.value)} /></label><label><span>Total budget</span><input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} /></label><label><span>Start date</span><input defaultValue="12 Aug 2026" /></label><label><span>End date</span><input defaultValue="16 Aug 2026" /></label></div><label className="wide-field"><span>What kind of story is this?</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label><div className="style-picker">{(["Adventure", "Relaxation", "Culture", "Food", "Nature", "Budget"] as const).map((item) => <button key={item} className={style === item ? "active" : ""} onClick={() => setStyle(item)}>{item}</button>)}</div></>}{step === 2 && <><span className="ticket-label"><MapPin size={14} /> Step two</span><h2>Lay out the journey.</h2><p>Your stops will become the spine of the itinerary, budget, calendar, and map.</p><div className="wizard-route-list">{selectedCities.map((city, index) => <div key={city}><span>{String(index + 1).padStart(2, "0")}</span><strong>{city}</strong><button onClick={() => selectCity(city)} aria-label={`Remove ${city}`}><Trash2 size={16} /></button></div>)}</div><div className="city-choice-row">{cityCatalog.map((city) => <button key={city.id} className={selectedCities.includes(city.name) ? "selected" : ""} onClick={() => addNewCity(city.id)}><MapPin size={16} /> {city.name}<small>{city.region}</small></button>)}</div></>}{step === 3 && <><span className="ticket-label"><WandSparkles size={14} /> Step three</span><h2>Seed the good bits.</h2><p>Pick an activity to start with. You can place, edit, or move it later inside the itinerary.</p><div className="wizard-activity-grid">{activityIdeas.slice(0, 3).map((idea) => <div key={idea.name}><span>{idea.icon}</span><div><strong>{idea.name}</strong><small>{idea.duration} · {formatRupees(idea.cost)}</small></div><Check size={18} /></div>)}</div></>}{step === 4 && <><span className="ticket-label"><ClipboardCopy size={14} /> Step four</span><h2>One last look.</h2><p>Here’s the shape of the journey you are about to open.</p><div className="wizard-review"><div><span>Trip</span><strong>{name || "Goa Adventure"}</strong></div><div><span>Budget</span><strong>{formatRupees(Number(budget) || 25000)}</strong></div><div><span>Style</span><strong>{style}</strong></div><div><span>Stops</span><strong>{selectedCities.join(" → ")}</strong></div></div></>}<div className="wizard-footer"><button className="outlined-action" disabled={step === 1} onClick={() => setStep((value) => value - 1)}>Back</button>{step < 4 ? <button className="coral-button" onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={17} /></button> : <button className="coral-button" onClick={finish}>Open my trip <PlaneTakeoff size={17} /></button>}</div></div></section></div>;
}

*/

export function TripWizardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { trip, setTrip, updateTripBasics, addStop, removeStop, reorderStopIndex } = useTripPlanner();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(trip.name);
  const [budget, setBudget] = useState(String(trip.budget));
  const [style, setStyle] = useState(trip.travelStyle);
  const [description, setDescription] = useState(trip.description);
  const [isSaving, setIsSaving] = useState(false);
  const steps = ["Basics", "Destinations", "Activities", "Review"];

  const finish = async () => {
    setIsSaving(true);
    const newTripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTripData = {
      ...trip,
      id: newTripId,
      name: name.trim() || "My New Journey",
      budget: Number(budget) || 25000,
      description,
      story: description,
      travelStyle: style,
      status: "Planned" as const,
    };

    try {
      const created = await mongoTripService.createTrip(newTripData, user);
      setTrip(created);
      toast.success(`"${created.name}" created and saved to MongoDB!`);
      setLocation("/trips");
    } catch (err: any) {
      console.warn("Trip creation error:", err);
      updateTripBasics(newTripData);
      toast.success(`"${newTripData.name}" created!`);
      setLocation("/trips");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRouteString = trip.stops.map((s) => s.city).join(" → ");

  return (
    <div className="page-stack wizard-page">
      <PageIntro
        eyebrow="Plan a new trip"
        title="Sketch the basics."
        accent="The details can wander later."
        description="This guided route keeps the big decisions clear without making trip planning feel like paperwork."
        action={
          <button className="soft-link" onClick={() => setLocation("/trips")}>
            ← Back to my trips
          </button>
        }
      />
      <section className="wizard-shell">
        <div className="wizard-progress">
          {steps.map((label, index) => (
            <button
              key={label}
              className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""}
              onClick={() => setStep(index + 1)}
            >
              <b>{step > index + 1 ? <Check size={14} /> : `0${index + 1}`}</b>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="wizard-stage">
          {step === 1 && (
            <>
              <span className="ticket-label">
                <Sparkles size={14} /> Step one
              </span>
              <h2>Give the journey a name.</h2>
              <p>
                A great route starts with an intention. You can keep it practical or write something
                worth remembering.
              </p>
              <div className="field-grid">
                <label>
                  <span>Trip name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label>
                  <span>Total budget</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                  />
                </label>
                <label>
                  <span>Start date</span>
                  <input defaultValue="12 Aug 2026" />
                </label>
                <label>
                  <span>End date</span>
                  <input defaultValue="16 Aug 2026" />
                </label>
              </div>
              <label className="wide-field">
                <span>What kind of story is this?</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <div className="style-picker">
                {(
                  [
                    "Adventure",
                    "Relaxation",
                    "Culture",
                    "Food",
                    "Nature",
                    "Budget",
                  ] as const
                ).map((item) => (
                  <button
                    key={item}
                    className={style === item ? "active" : ""}
                    onClick={() => setStyle(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <span className="ticket-label">
                <MapPin size={14} /> Step two
              </span>
              <h2>Lay out the journey on the map.</h2>
              <p>
                Search any city or place worldwide, view real road route connections, and organize
                your stops.
              </p>
              <DestinationPickerMap
                stops={trip.stops}
                onAddStop={addStop}
                onRemoveStop={removeStop}
                onReorderStops={reorderStopIndex}
              />
            </>
          )}

          {step === 3 && (
            <>
              <span className="ticket-label">
                <WandSparkles size={14} /> Step three
              </span>
              <h2>Seed the good bits.</h2>
              <p>
                Pick an activity to start with. You can place, edit, or move it later inside the
                itinerary.
              </p>
              <div className="wizard-activity-grid">
                {activityIdeas.slice(0, 3).map((idea) => (
                  <div key={idea.name}>
                    <span>{idea.icon}</span>
                    <div>
                      <strong>{idea.name}</strong>
                      <small>
                        {idea.duration} · {formatRupees(idea.cost)}
                      </small>
                    </div>
                    <Check size={18} />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <span className="ticket-label">
                <ClipboardCopy size={14} /> Step four
              </span>
              <h2>One last look.</h2>
              <p>Here’s the shape of the journey you are about to open.</p>
              <div className="wizard-review">
                <div>
                  <span>Trip</span>
                  <strong>{name || "Goa Adventure"}</strong>
                </div>
                <div>
                  <span>Budget</span>
                  <strong>{formatRupees(Number(budget) || 25000)}</strong>
                </div>
                <div>
                  <span>Style</span>
                  <strong>{style}</strong>
                </div>
                <div>
                  <span>Stops</span>
                  <strong>{selectedRouteString || "Mumbai → Goa"}</strong>
                </div>
              </div>
            </>
          )}

          <div className="wizard-footer">
            <button
              className="outlined-action"
              disabled={step === 1}
              onClick={() => setStep((value) => value - 1)}
            >
              Back
            </button>
            {step < 4 ? (
              <button className="coral-button" onClick={() => setStep((value) => value + 1)}>
                Continue <ArrowRight size={17} />
              </button>
            ) : (
              <button className="coral-button" onClick={finish}>
                Open my trip <PlaneTakeoff size={17} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function TripsPage() {
  return <TripsListView />;
}

export function DiscoverPage() {
  return <DiscoverFeed />;
}

export function DestinationsPage() {
  return <DestinationsManager />;
}

export function ActivitiesPage() {
  const { addActivity, trip } = useTripPlanner();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | ActivityIdea["category"]>("All");
  const [picker, setPicker] = useState<ActivityIdea | null>(null);

  const activities = activityIdeas.filter(
    (idea) =>
      (category === "All" || idea.category === category) &&
      `${idea.name} ${idea.description}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-stack discover-page">
      <PageIntro
        eyebrow="Activity Discovery"
        title="Find things to do,"
        accent="then make them yours."
        description="Search curated moments that fit your itinerary, from street food walks to sunset viewpoints."
        action={
          <span className="ticket-label">
            <Sparkles size={14} /> {activities.length} experiences
          </span>
        }
      />
      <section className="discovery-controls">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activities or experiences..."
            aria-label="Search activities"
          />
        </label>
        <div className="filter-chips">
          {(["All", "Adventure", "Culture", "Food", "Nature"] as const).map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <RouteConnector label="follow the moments" />
      <section className="activity-discovery-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Curated moments</span>
            <h2>Leave room for the good stuff.</h2>
          </div>
          <span className="soft-count">{activities.length} finds</span>
        </div>
        <div className="activity-discovery-grid">
          {activities.map((idea) => (
            <article className="activity-discovery-card" key={idea.name}>
              <span className="idea-emoji">{idea.icon}</span>
              <div className="activity-discovery-main">
                <span className="eyebrow">
                  {idea.category} · {idea.rating} ★
                </span>
                <h3>{idea.name}</h3>
                <p>{idea.description}</p>
                <div>
                  <span>
                    <MapPin size={13} /> {idea.location}
                  </span>
                  <span>
                    <CalendarDays size={13} /> {idea.duration}
                  </span>
                  <b>{formatRupees(idea.cost)}</b>
                </div>
              </div>
              <button
                className="add-circle"
                onClick={() => setPicker(idea)}
                aria-label={`Add ${idea.name} to itinerary`}
              >
                <Plus size={18} />
              </button>
            </article>
          ))}
        </div>
        {activities.length === 0 && (
          <EmptyJournal
            title="Nothing here yet."
            body="Try another category, or let the next place surprise you."
            actionLabel="Discover all"
            actionPath="/activities"
          />
        )}
      </section>
      {picker && (
        <div className="modal-backdrop" role="presentation">
          <section className="travel-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              onClick={() => setPicker(null)}
              aria-label="Close activity picker"
            >
              ×
            </button>
            <span className="ticket-label">
              <Plus size={13} /> Add to itinerary
            </span>
            <h2>Place {picker.name} in the story.</h2>
            <p>
              Choose where it belongs. Your budget, calendar, and itinerary will update
              together.
            </p>
            <div className="picker-day-list">
              {trip.stops.flatMap((stop) =>
                stop.days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => {
                      addActivity(stop.id, day.id, picker);
                      setPicker(null);
                      toast.success(`${picker.name} added to Day ${day.dayNumber}.`);
                    }}
                  >
                    <span>{day.city}</span>
                    <strong>
                      Day {day.dayNumber} · {day.date}
                    </strong>
                    <ChevronRight size={17} />
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function LegacyTripOverviewPage() {
  const { trip, estimatedCost } = useTripPlanner();
  const [, setLocation] = useLocation();
  const activities = getAllActivities(trip);
  return <div className="page-stack trip-overview-page"><BackToTrips /><PageIntro eyebrow="Trip overview" title={trip.name} accent="is ready for a closer look." description={trip.description} action={<div className="intro-actions"><button className="outlined-action" onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}><LayoutList size={17} /> Itinerary</button><button className="coral-button" onClick={() => setLocation(`/trips/${trip.id}/share`)}><Share2 size={17} /> Share</button></div>} /><TripTabs active="overview" /><section className="overview-hero"><img src={GOA_ART} alt="Illustrated Goa coast and fort" /><div><span className="ticket-label"><Route size={14} /> {trip.stops.map((stop) => stop.city).join(" → ")}</span><h2>{trip.dateRange}</h2><p>{trip.duration} · {trip.stops.length} city stops · {activities.length} planned moments</p><div className="overview-stat-row"><TripStat label="total budget" value={formatRupees(trip.budget)} icon={<WalletCards size={16} />} /><TripStat label="estimated" value={formatRupees(estimatedCost)} icon={<CircleDollarSign size={16} />} /><TripStat label="remaining" value={formatRupees(trip.budget - estimatedCost)} icon={<Sparkles size={16} />} /></div></div></section><section className="overview-grid"><article className="ink-card journey-overview-card"><div className="panel-heading"><div><span className="eyebrow">Journey timeline</span><h3>Every pin in order</h3></div><button className="text-action" onClick={() => setLocation(`/trips/${trip.id}/map`)}>Map <ArrowRight size={14} /></button></div><div className="overview-route">{trip.stops.map((stop, index) => <div key={stop.id}><span style={{ background: stop.color }}>{String(index + 1).padStart(2, "0")}</span><div><strong>{stop.city}</strong><small>{stop.country} · {stop.dateRange}</small></div>{index < trip.stops.length - 1 && <i />}</div>)}</div></article><article className="ink-card upcoming-card"><div className="panel-heading"><div><span className="eyebrow">Upcoming moments</span><h3>Next on the page</h3></div><button className="text-action" onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}>Edit <Pencil size={14} /></button></div>{activities.slice(0, 3).map((activity) => <div className="upcoming-row" key={activity.id}><span>{activity.time}</span><div><strong>{activity.name}</strong><small>{activity.location} · {activity.duration}</small></div><b>{activity.cost ? formatRupees(activity.cost) : "Free"}</b></div>)}</article></section></div>;
}

export function TripOverviewPage() {
  const { trip, setTrip, estimatedCost } = useTripPlanner();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/trips/:tripId");

  useEffect(() => {
    if (params?.tripId && params.tripId !== trip.id) {
      mongoTripService
        .getTripById(params.tripId, user)
        .then((data) => setTrip(data))
        .catch(() => {});
    }
  }, [params?.tripId, user]);

  const activities = getAllActivities(trip);
  return <div className="page-stack trip-overview-page atlas-overview-page"><BackToTrips /><PageIntro eyebrow="Trip overview" title={trip.name} accent="is ready for a closer look." description={trip.description} action={<div className="intro-actions"><button className="outlined-action" onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}><LayoutList size={17} /> Itinerary</button><button className="coral-button" onClick={() => setLocation(`/trips/${trip.id}/share`)}><Share2 size={17} /> Share</button></div>} /><TripTabs active="overview" /><section className="atlas-overview-hero"><AtlasRevealImage destinationName={goaPhotoStory.name} illustrationSrc={goaPhotoStory.illustrationSrc} realImageSrc={goaPhotoStory.realImageSrc} alt="Illustrated Goa coast and fort in the GlobeTrotter atlas" caption={goaPhotoStory.revealCaption} /><div className="atlas-overview-copy"><span className="ticket-label"><Route size={14} /> {trip.stops.map((stop) => stop.city).join(" → ")}</span><h2>{trip.dateRange}</h2><p>{trip.duration} · {trip.stops.length} city stops · {activities.length} planned moments</p><div className="overview-stat-row"><TripStat label="total budget" value={formatRupees(trip.budget)} icon={<WalletCards size={16} />} /><TripStat label="estimated" value={formatRupees(estimatedCost)} icon={<CircleDollarSign size={16} />} /><TripStat label="remaining" value={formatRupees(trip.budget - estimatedCost)} icon={<Sparkles size={16} />} /></div><p className="atlas-overview-note"><Sparkles size={14} /> Hover, focus, or tap the atlas scene to reveal Goa in real life.</p></div></section><section className="overview-grid"><article className="ink-card journey-overview-card"><div className="panel-heading"><div><span className="eyebrow">Journey timeline</span><h3>Every pin in order</h3></div><button className="text-action" onClick={() => setLocation(`/trips/${trip.id}/map`)}>Map <ArrowRight size={14} /></button></div><div className="overview-route">{trip.stops.map((stop, index) => <div key={stop.id}><span style={{ background: stop.color }}>{String(index + 1).padStart(2, "0")}</span><div><strong>{stop.city}</strong><small>{stop.country} · {stop.dateRange}</small></div>{index < trip.stops.length - 1 && <i />}</div>)}</div></article><article className="ink-card upcoming-card"><div className="panel-heading"><div><span className="eyebrow">Upcoming moments</span><h3>Next on the page</h3></div><button className="text-action" onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}>Edit <Pencil size={14} /></button></div>{activities.slice(0, 3).map((activity) => <div className="upcoming-row" key={activity.id}><span>{activity.time}</span><div><strong>{activity.name}</strong><small>{activity.location} · {activity.duration}</small></div><b>{activity.cost ? formatRupees(activity.cost) : "Free"}</b></div>)}</article></section><DestinationPhotoGallery story={goaPhotoStory} onAddExperiences={() => setLocation("/activities")} /></div>;
}

export function ItineraryPage() {
  const { trip, setTrip, estimatedCost, moveActivity, deleteActivity, duplicateActivity, reorderStops, removeStop } = useTripPlanner();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/trips/:tripId/itinerary");

  useEffect(() => {
    if (params?.tripId && params.tripId !== trip.id) {
      mongoTripService
        .getTripById(params.tripId, user)
        .then((data) => setTrip(data))
        .catch(() => {});
    }
  }, [params?.tripId, user]);

  const [dragging, setDragging] = useState<{ dayId: string; activityId: string } | null>(null);
  const [openDays, setOpenDays] = useState<string[]>(getAllDays(trip).map((day) => day.id));
  const toggleDay = (dayId: string) => setOpenDays((open) => open.includes(dayId) ? open.filter((id) => id !== dayId) : [...open, dayId]);
  const handleActivityDrop = (event: DragEvent<HTMLDivElement>, targetDayId: string) => { event.preventDefault(); if (!dragging) return; moveActivity(dragging.dayId, dragging.activityId, targetDayId); setDragging(null); toast.success("Activity moved. Your budget and calendar have followed along."); };
  const handleStopDrop = (event: DragEvent<HTMLButtonElement>, targetStopId: string) => { event.preventDefault(); const source = event.dataTransfer.getData("stop-id"); if (source && source !== targetStopId) { reorderStops(source, targetStopId); toast.success("Stops reordered across your trip."); } };
  return <div className="page-stack itinerary-page"><BackToTrips /><PageIntro eyebrow="Trip builder" title={trip.name} accent="— shape the days, not just the dates." description="Drag activities between days, duplicate a useful moment, or trim a plan that is trying to do too much." action={<div className="intro-actions"><button className="outlined-action" onClick={() => setLocation(`/trips/${trip.id}/calendar`)}><CalendarDays size={17} /> Calendar</button><button className="coral-button" onClick={() => setLocation("/activities")}><Plus size={17} /> Add activity</button></div>} /><TripTabs active="itinerary" /><section className="itinerary-workspace"><aside className="stop-rail ink-card"><div className="panel-heading"><div><span className="eyebrow">{trip.stops.length} stops</span><h3>The route</h3></div><Route size={19} /></div><div className="vertical-route">{trip.stops.map((stop, index) => <button draggable key={stop.id} onDragStart={(event) => event.dataTransfer.setData("stop-id", stop.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleStopDrop(event, stop.id)} className="stop-item drag-stop"><span className="stop-pin" style={{ backgroundColor: stop.color }}>{index + 1}</span><div><strong>{stop.city}</strong><span>{stop.dateRange}</span></div><GripVertical size={15} /></button>)}</div><button className="add-stop-link" onClick={() => setLocation("/destinations")}><Plus size={17} /> Add destination</button></aside><div className="itinerary-canvas">{trip.stops.map((stop, stopIndex) => <section className="stop-board" key={stop.id}><div className="stop-board-head"><div className="city-marker" style={{ backgroundColor: stop.color }}>{stop.city.slice(0, 1)}</div><div><span className="eyebrow">Stop {String(stopIndex + 1).padStart(2, "0")} · {stop.dateRange}</span><h2>{stop.city}, <em>{stop.country}</em></h2></div><button className="more-button" aria-label={`Remove ${stop.city}`} onClick={() => { removeStop(stop.id); toast.success(`${stop.city} removed from this route.`); }}><Trash2 size={17} /></button></div>{stop.days.map((day) => <div className={`day-lane ${openDays.includes(day.id) ? "open" : "closed"}`} key={day.id}><button className="day-label day-toggle" onClick={() => toggleDay(day.id)}><span>Day {day.dayNumber}</span><strong>{day.date}</strong><small>{day.city}</small><ChevronDown size={16} /></button>{openDays.includes(day.id) && <div className="activity-stack drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleActivityDrop(event, day.id)}>{day.activities.map((activity) => <div className="activity-ticket draggable-activity" key={activity.id} draggable onDragStart={() => setDragging({ dayId: day.id, activityId: activity.id })} onDragEnd={() => setDragging(null)}><GripVertical className="drag-handle" size={15} /><span className="activity-time">{activity.time}</span><div><strong>{activity.name}</strong><span>{activity.category} · {activity.location} · {activity.duration}</span></div><b>{activity.cost ? formatRupees(activity.cost) : "Free"}</b><div className="activity-actions"><button aria-label={`Duplicate ${activity.name}`} onClick={() => { duplicateActivity(day.id, activity.id); toast.success("A copy is ready to edit."); }}><Copy size={14} /></button><button aria-label={`Remove ${activity.name}`} onClick={() => { deleteActivity(day.id, activity.id); toast.success("Activity removed. The budget has updated."); }}><Trash2 size={14} /></button></div></div>)}<button className="drop-hint" onClick={() => setLocation("/activities")}><Plus size={15} /> Add to Day {day.dayNumber} or drop an activity here</button></div>}</div>)}</section>)}</div><aside className="trip-summary-rail"><div className="summary-ticket"><span className="ticket-label"><WalletCards size={14} /> Trip snapshot</span><h3>{formatRupees(estimatedCost)}</h3><p>Estimated across {getAllActivities(trip).length} moments.</p><div className="mini-budget-track"><i style={{ width: `${Math.round((estimatedCost / trip.budget) * 100)}%` }} /></div><strong>{formatRupees(trip.budget - estimatedCost)} breathing room</strong><button className="text-action" onClick={() => setLocation(`/trips/${trip.id}/budget`)}>Open budget <ArrowRight size={15} /></button></div><div className="itinerary-tip"><Sparkles size={17} /><p><strong>Drag tip:</strong> carry an activity to a different day and GlobeTrotter keeps your cost trail in sync.</p></div></aside></section></div>;
}

export function BudgetPage() {
  const { trip, buffetIncluded, toggleBuffet, estimatedCost, expenses, addExpense } = useTripPlanner();
  const [, setLocation] = useLocation();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState({ category: "Food", description: "", amount: "", date: "15 Aug", notes: "" });
  const breakdown = getExpenseBreakdown(trip, buffetIncluded);
  const remaining = trip.budget - estimatedCost;
  const percent = Math.round((estimatedCost / trip.budget) * 100);
  const colors = { Transport: "#FF6550", Accommodation: "#2CB9AA", Food: "#FFC53D", Activities: "#23304A", Miscellaneous: "#D0DDE8" } as const;
  const daily = getAllDays(trip).map((day) => day.activities.reduce((sum, activity) => sum + activity.cost, 0));
  const saveExpense = (event: React.FormEvent) => { event.preventDefault(); const amount = Number(expenseDraft.amount); if (!expenseDraft.description.trim() || !amount) { toast.error("Give this expense a name and a valid amount."); return; } addExpense({ ...expenseDraft, amount }); setExpenseOpen(false); setExpenseDraft({ category: "Food", description: "", amount: "", date: "15 Aug", notes: "" }); toast.success("Expense added to your local cost trail."); };
  return <div className="page-stack budget-page"><BackToTrips /><PageIntro eyebrow="Budget buddy" title="Your money has" accent="a map, too." description="Every activity on the itinerary updates this friendly cost trail, so the useful numbers never drift away from the plan." action={<div className="intro-actions"><button className="outlined-action" onClick={() => setExpenseOpen(true)}><Plus size={17} /> Add expense</button><button className="outlined-action" onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}><LayoutList size={17} /> Back to itinerary</button></div>} /><TripTabs active="budget" /><section className="budget-overview"><article className="budget-big-card"><span className="ticket-label"><WalletCards size={15} /> Total budget</span><div className="budget-number"><strong>{formatRupees(trip.budget)}</strong><span>Goa Adventure travel pot</span></div><div className="budget-meter"><span style={{ width: `${Math.min(100, percent)}%` }} /></div><div className="budget-stat-row"><span><b>{formatRupees(estimatedCost)}</b> estimated</span><span><b>{formatRupees(remaining)}</b> remaining</span><span><b>{percent}%</b> used</span></div></article><article className="budget-summary-card"><span className="eyebrow">A note from Budget Buddy</span><h2>{remaining >= 0 ? <>Nice! You’re <em>{formatRupees(remaining)} under budget.</em></> : <>You’re <em>{formatRupees(Math.abs(remaining))} over budget.</em></>}</h2><p>{remaining >= 0 ? "That leaves space for one more memory without turning the trip into a spreadsheet." : "Try trimming a moment or editing a cost to bring the plan back into the green."}</p><button className="outlined-action" onClick={() => { toggleBuffet(); toast.success(buffetIncluded ? "Beach buffet removed from the cost trail." : "Beach buffet included. Your total just updated."); }}>{buffetIncluded ? <><Check size={16} /> Beach buffet included</> : <><Plus size={16} /> Add beach buffet · ₹700</>}</button></article></section><RouteConnector label="follow the cost trail" /><section className="budget-detail-grid"><article className="ink-card chart-card"><div className="panel-heading"><div><span className="eyebrow">Where it goes</span><h3>Cost trail</h3></div><CircleDollarSign size={20} /></div><div className="donut-chart dynamic-donut" style={{ "--food": `${Math.round((breakdown.Food / estimatedCost) * 100)}%`, "--stay": `${Math.round((breakdown.Accommodation / estimatedCost) * 100)}%`, "--activities": `${Math.round((breakdown.Activities / estimatedCost) * 100)}%` } as React.CSSProperties}><div><strong>{percent}%</strong><span>spoken for</span></div></div><div className="legend-list">{(Object.entries(breakdown) as [keyof typeof breakdown, number][]).map(([label, value]) => <div key={label}><i style={{ background: colors[label] }} /><span>{label}</span><b>{formatRupees(value)}</b></div>)}</div></article><article className="ink-card day-cost-card"><div className="panel-heading"><div><span className="eyebrow">Daily spending</span><h3>Small steps, clear picture</h3></div><CalendarDays size={20} /></div><div className="bar-chart">{daily.map((cost, index) => <div key={index}><span style={{ height: `${Math.max(16, Math.round((cost / Math.max(...daily, 1)) * 100))}%` }} /><b>D{index + 1}</b><small>{formatRupees(cost)}</small></div>)}</div><div className="cost-tip"><Sparkles size={17} /><p><strong>Trip tip:</strong> The itinerary is the source of truth here—add, remove, or move a paid activity and the full cost trail responds.</p></div>{expenses.length > 0 && <div className="manual-expense-list">{expenses.map((expense) => <p key={expense.id}><span>{expense.category} · {expense.description}</span><strong>{formatRupees(expense.amount)}</strong></p>)}</div>}</article></section>{expenseOpen && <div className="modal-backdrop"><form className="travel-modal expense-modal" onSubmit={saveExpense}><button className="modal-close" type="button" onClick={() => setExpenseOpen(false)} aria-label="Close expense form">×</button><span className="ticket-label"><Plus size={13} /> Add expense</span><h2>Give the cost trail the whole story.</h2><p>Local only for now—this is ready for future Odoo expense records.</p><div className="field-grid"><label><span>Category</span><select value={expenseDraft.category} onChange={(event) => setExpenseDraft({ ...expenseDraft, category: event.target.value })}><option>Food</option><option>Transport</option><option>Accommodation</option><option>Activities</option><option>Miscellaneous</option></select></label><label><span>Amount</span><input required type="number" min="1" value={expenseDraft.amount} onChange={(event) => setExpenseDraft({ ...expenseDraft, amount: event.target.value })} /></label><label><span>Description</span><input required value={expenseDraft.description} onChange={(event) => setExpenseDraft({ ...expenseDraft, description: event.target.value })} /></label><label><span>Date</span><input value={expenseDraft.date} onChange={(event) => setExpenseDraft({ ...expenseDraft, date: event.target.value })} /></label></div><label className="wide-field"><span>Notes</span><textarea value={expenseDraft.notes} onChange={(event) => setExpenseDraft({ ...expenseDraft, notes: event.target.value })} /></label><div className="form-footer"><button type="button" className="outlined-action" onClick={() => setExpenseOpen(false)}>Cancel</button><button className="coral-button" type="submit">Add to budget</button></div></form></div>}</div>;
}

export function MapCalendarPage() {
  const { trip } = useTripPlanner();
  const [pathname, setLocation] = useLocation();
  const [mode, setMode] = useState(pathname.includes("calendar") ? "calendar" : "map");
  const [activeStopId, setActiveStopId] = useState<string | undefined>(trip.stops[0]?.id);
  const days = getAllDays(trip);

  return (
    <div className="page-stack map-page">
      <BackToTrips />
      <PageIntro
        eyebrow="Map & calendar"
        title="See the trip"
        accent="all at once."
        description="Switch between the route and the rhythm of the days, then return to the itinerary when a detail needs a tweak."
        action={
          <button
            className="outlined-action"
            onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}
          >
            <LayoutList size={17} /> View itinerary
          </button>
        }
      />
      <TripTabs active={pathname.includes("calendar") ? "calendar" : "map"} />
      <div className="view-toggle">
        <button
          className={mode === "map" ? "active" : ""}
          onClick={() => setMode("map")}
        >
          <MapPin size={16} /> Route map
        </button>
        <button
          className={mode === "calendar" ? "active" : ""}
          onClick={() => setMode("calendar")}
        >
          <CalendarDays size={16} /> Calendar & timeline
        </button>
      </div>
      <RouteConnector
        label={mode === "map" ? "follow the dotted line" : "make space for the day"}
      />
      {mode === "map" ? (
        <section className="map-calendar-grid">
          {/* Dual-State Storybook Atlas Interactive Map */}
          <StorybookAtlasMap
            stops={trip.stops}
            tripName={trip.name}
            activeStopId={activeStopId}
            onSelectStop={setActiveStopId}
          />

          {/* Connected Stop Notes Card */}
          <article className="map-stop-card">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Stop notes</span>
                <h3>Turn the route into days</h3>
              </div>
              <Compass size={20} />
            </div>
            {trip.stops.map((stop, index) => (
              <div
                className={`map-stop-note ${activeStopId === stop.id ? "is-focused-stop" : ""}`}
                key={stop.id}
                onClick={() => setActiveStopId(stop.id)}
                style={{ cursor: "pointer" }}
              >
                <span style={{ background: stop.color }}>{index + 1}</span>
                <div>
                  <strong>{stop.city}</strong>
                  <small>
                    {stop.dateRange} · {stop.days.length} days
                  </small>
                </div>
                <ChevronRight size={16} />
              </div>
            ))}
            <button className="outlined-action" onClick={() => setMode("calendar")}>
              Open calendar <ArrowRight size={15} />
            </button>
          </article>
        </section>
      ) : (
        <section className="calendar-timeline-layout">
          <article className="calendar-card expanded-calendar">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">August 2026</span>
                <h3>Trip calendar</h3>
              </div>
              <button aria-label="Calendar options">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="calendar-weekdays">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <span key={`${day}-${i}`}>{day}</span>
              ))}
            </div>
            <div className="calendar-dates">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                <span
                  key={date}
                  className={date >= 12 && date <= 16 ? `trip-date d${date}` : ""}
                >
                  {date}
                  {date === 12 && <small>Mumbai</small>}
                  {date === 14 && <small>Goa</small>}
                </span>
              ))}
            </div>
            <div className="calendar-note">
              <CalendarDays size={16} />
              <span>
                Five days, {trip.stops.length} stops, {getAllActivities(trip).length} planned
                moments.
              </span>
            </div>
          </article>
          <article className="timeline-card">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Timeline</span>
                <h3>What is happening when?</h3>
              </div>
              <button
                className="text-action"
                onClick={() => setLocation(`/trips/${trip.id}/itinerary`)}
              >
                Edit <Pencil size={14} />
              </button>
            </div>
            {days.map((day) => (
              <details key={day.id} open>
                <summary>
                  <span>Day {day.dayNumber}</span>
                  <strong>
                    {day.date} · {day.city}
                  </strong>
                  <ChevronDown size={16} />
                </summary>
                <div>
                  {day.activities.map((activity) => (
                    <p key={activity.id}>
                      <b>{activity.time}</b>
                      <span>{activity.name}</span>
                      <small>
                        {activity.duration} · {formatRupees(activity.cost)}
                      </small>
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </article>
        </section>
      )}
    </div>
  );
}

export function SharePage() {
  return <PublicSharePage />;
}

export function ProfileSettingsPage() {
  return <ProfileSettingsView />;
}

export function AuthPage({ mode }: { mode: "login" | "register" | "forgot" }) {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const config = mode === "login" ? { eyebrow: "Welcome back", title: "Pick up the story", accent: "where you left it.", submit: "Log in" } : mode === "register" ? { eyebrow: "A fresh travel desk", title: "Start planning", accent: "your way.", submit: "Create account" } : { eyebrow: "No worries", title: "Let’s find your", accent: "way back in.", submit: "Send reset link" };
  const submit = (event: React.FormEvent) => { event.preventDefault(); setSubmitted(true); toast.success(mode === "forgot" ? "A mock reset link is on its way." : "You’re in—opening your travel desk."); if (mode !== "forgot") setTimeout(() => setLocation("/dashboard"), 350); };
  return <main className="auth-page"><section className="auth-art"><img src={HERO_ART} alt="Illustrated tropical travel atlas" /><div><img src={brandLogo} alt="GlobeTrotter" /><span>GlobeTrotter</span></div><p>Sketch the route. We’ll keep the details in line.</p></section><section className="auth-form-wrap"><button className="brand-lockup auth-mobile-brand" onClick={() => setLocation("/")}><img src={brandLogo} alt="GlobeTrotter" className="brand-mark" /><span className="brand-name">GlobeTrotter</span></button><form className="auth-form" onSubmit={submit}><span className="eyebrow">{config.eyebrow}</span><h1>{config.title} <em>{config.accent}</em></h1><p>{mode === "forgot" ? "Enter your email and we’ll send a calm, clear way back to your plans." : "Your travel journal is ready when you are."}</p>{mode === "register" && <label><span>Your name</span><input required placeholder="Mita Shah" /></label>}<label><span>Email</span><input required type="email" placeholder="you@example.com" /></label>{mode !== "forgot" && <label><span>Password</span><input required type="password" placeholder="••••••••" /></label>}{mode === "register" && <label><span>Confirm password</span><input required type="password" placeholder="••••••••" /></label>}{mode === "login" && <div className="auth-helper"><label><input type="checkbox" /> Remember me</label><button type="button" onClick={() => setLocation("/forgot-password")}>Forgot password?</button></div>}<button className="coral-button auth-submit" type="submit">{submitted ? <><Check size={17} /> One moment…</> : <>{config.submit} <ArrowRight size={17} /></>}</button>{mode === "login" ? <p className="auth-switch">New here? <button type="button" onClick={() => setLocation("/register")}>Create an account</button></p> : mode === "register" ? <p className="auth-switch">Already have a desk? <button type="button" onClick={() => setLocation("/login")}>Log in</button></p> : <p className="auth-switch"><button type="button" onClick={() => setLocation("/login")}>Back to login</button></p>}</form></section></main>;
}

export function AdminPage() {
  const [, setLocation] = useLocation();
  return <div className="page-stack admin-page"><PageIntro eyebrow="Admin preview" title="A quieter view" accent="of the travel world." description="A visual foundation for future Odoo analytics—kept separate from the traveller experience and not connected to production data." action={<button className="outlined-action" onClick={() => setLocation("/dashboard")}>Back to travel desk</button>} /><section className="admin-stat-grid"><TripStat label="demo users" value="1,248" icon={<UserRound size={17} />} /><TripStat label="trips created" value="3,842" icon={<Route size={17} />} /><TripStat label="popular city" value="Goa" icon={<MapPin size={17} />} /><TripStat label="engagement" value="74%" icon={<Sparkles size={17} />} /></section><section className="admin-grid"><article className="ink-card admin-chart-card"><div className="panel-heading"><div><span className="eyebrow">Trips created</span><h3>Eight weeks of momentum</h3></div><Settings2 size={20} /></div><div className="admin-bars">{[38, 46, 64, 52, 78, 73, 92, 84].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article><article className="ink-card admin-list-card"><div className="panel-heading"><div><span className="eyebrow">Popular places</span><h3>Where plans are landing</h3></div><MapPin size={20} /></div>{["Goa", "Jaipur", "Udaipur", "Kerala"].map((place, index) => <div key={place}><span>{String(index + 1).padStart(2, "0")}</span><strong>{place}</strong><b>{[842, 687, 531, 462][index]} saves</b></div>)}</article></section><section className="ink-card admin-table-card"><div className="panel-heading"><div><span className="eyebrow">Recent trip signals</span><h3>A calm start for admin tooling</h3></div><button className="text-action">View all <ArrowRight size={14} /></button></div><div className="admin-table"><span>Trip</span><span>Traveller</span><span>Status</span><span>Route</span><strong>Goa Adventure</strong><strong>Mita Shah</strong><StatusPill status="Upcoming" /><strong>Mumbai → Goa</strong><strong>Jaipur Notebook</strong><strong>Aarav Mehta</strong><StatusPill status="Draft" /><strong>Jaipur → Udaipur</strong></div></section></div>;
}
