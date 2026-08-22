# Musafir — Har safar, ek kahani
### Personal Travel Atlas & Multi-City Planner

> **Read this first if you are the next ChatGPT, coding agent, or developer working on Musafir.**

## Current Status

**Musafir (formerly GlobeTrotter) — Phase 1 & Branding Update is complete.**
The repository contains both the polished React/TypeScript Storybook Atlas frontend and the native Odoo module (`addons/globetrotter`) with PostgreSQL persistence, full relational models, RESTful API controllers, security groups, demo seed data, and a typed API client service layer.

| Component | Status | Details |
| --- | --- | --- |
| **Brand & Visual Identity** | Complete | Rebranded to **Musafir** ("Har safar, ek kahani") with official colorful logo, transparent masking, and discover dashboard. |
| **Authentication & Entry Flow** | Complete | Polished Storybook Atlas `/login`, `/register`, `/forgot-password`, `/onboarding` (4-step setup), and Demo Workspace (*Traveler* / *Admin*). |
| **Odoo Backend Module** | Complete | Located in `addons/globetrotter`, defining 12 relational models & business logic. |
| **PostgreSQL Schema** | Complete | Normalized relational hierarchy: `Trip → TripStop → ItineraryDay → TripActivity`, `Budget`, `Expense`, `SharedTrip`. |
| **API Controllers** | Complete | 11 RESTful controllers with standardized JSON responses & error handling. |
| **Security & RBAC** | Complete | Traveler & Admin security groups with server-enforced record rules. |
| **Frontend Typed API Layer** | Complete | `client/src/services/` with comprehensive domain API services. |
| **Demo Data** | Complete | Seeded destinations (Goa, Mumbai, Jaipur, etc.), activities, and 5-day Goa Adventure trip. |
| **Visual Identity** | Preserved | 100% Storybook Atlas UI design, Atlas Comes Alive, and responsive layouts. |

---

## Product Purpose

Musafir is a personal, multi-city travel-planning application. Its primary product journey is:

```text
Discover → Plan → Organize → Budget → Visualize → Share
```

The core travel model is deliberately explicit and must be retained:

```text
Trip
└── Trip Stop
    └── Itinerary Day
        └── Activity
```

The primary demo trip is **Goa Adventure**, covering **Mumbai → Goa** over five days. All traveler screens use this trip as connected local-demo data.

## Visual Identity: Storybook Atlas

**Do not redesign GlobeTrotter as a generic SaaS dashboard.** The application uses a visual system called **Storybook Atlas**: a functional travel product that feels like a living personal atlas.

| Token or motif | Meaning |
| --- | --- |
| **Ink Navy** `#23304A` | Outlines, typography, card shadows, wayfinding, and dependable contrast. |
| **Globe Coral** `#FF6550` | Primary actions, active route energy, and headline emphasis. |
| **Marigold** `#FFC53D` | Stamps, planning prompts, ideas, and positive status. |
| **Sea-glass Teal** `#2CB9AA` | Places, stable travel context, progress, and secondary information. |
| **Baloo 2 + DM Sans** | Expressive editorial display headings paired with practical planning text. |
| **Paper/ticket surfaces** | Thick ink borders, slight offset shadows, tactile cards, seams, and stamp labels. |
| **Route connectors** | Dotted paths, pins, travel-scroll lines, paper scraps, and route motifs that connect screens into one journey. |

The **admin experience is intentionally different from the traveler experience**, but it still belongs to the same Storybook Atlas product. It uses a denser operational layout with the GlobeTrotter mark, parchment paper surfaces, ink borders, coral route traces, stamped labels, and a clear return to the Traveler Dashboard.

---

## What Is Implemented

### Traveler Product

| Area | Route | Current frontend behaviour |
| --- | --- | --- |
| Dashboard | `/` and `/dashboard` | Welcome state, Goa Adventure hero, route, planning progress, budget snapshot, next best actions, upcoming trips, inspiration, and travel-route motifs. |
| My Trips | `/trips` | Search, status filters, local delete confirmation, duplicate feedback, trip cards, progress, budget, status, and empty state. |
| Create Trip | `/trips/new` | Four-step local wizard: **Basics → Destinations → Activities → Review**. Updates trip basics and opens the trip overview. |
| Discover | `/discover` | Combined inspiration hub for cities and activities. |
| Destinations | `/destinations` | Searchable city cards, local saved-place toggles, and add-to-trip action. |
| Activities | `/activities` | Search/category filtering, activity cards, and day-picker modal that adds activities into the itinerary. |
| Trip Overview | `/trips/:tripId` | Trip summary, route, budget stats, upcoming activities, timeline, Atlas Comes Alive hero, real-photo story gallery, and planning CTA. |
| Itinerary | `/trips/:tripId/itinerary` | Ordered stops, collapsible day lanes, activity add/duplicate/delete, activity drag/drop between days, and stop reordering. |
| Calendar | `/trips/:tripId/calendar` | Calendar and expandable day/timeline views built from the shared trip state. |
| Budget Buddy | `/trips/:tripId/budget` | Estimated spend, remaining budget, category breakdown, daily spend, buffet toggle, and local manual-expense modal/list. |
| Map | `/trips/:tripId/map` | Illustrated Mumbai-to-Goa map with markers, route line, stop notes, and future provider-replacement boundary. |
| Sharing | `/trips/:tripId/share` | Travel-pass sharing UI, local link-copy feedback, privacy-oriented share language, and public-preview path. |
| Public Trip | `/shared/:shareId` | Read-only public itinerary concept with a local copy-trip action. |
| Profile | `/profile` | Mock traveler profile, travel bio, saved-place count, and local feedback. |
| Settings | `/settings` | Mock currency, language, travel-style, and budget-preference controls. |
| Authentication | `/login`, `/register`, `/forgot-password` | Production-quality visual flows with local success feedback; no real account handling. |

### Admin Product

| Area | Route | Current frontend behaviour |
| --- | --- | --- |
| Admin Overview | `/admin` | Platform KPIs, trip growth visual, popular destinations, quick actions, and Storybook Atlas operational styling. |
| User Management | `/admin/users` | Mock user records, search/filter controls, management table pattern, and future-data note. |
| Trip Management | `/admin/trips` | Mock trip records with traveler, route, status, and budget columns. |
| Destination Management | `/admin/cities` | Mock city-management table. |
| Activity Management | `/admin/activities` | Mock activity-management table. |
| Analytics | `/admin/analytics` | Mock KPIs, user/trip activity visual, and category ranking. |

Admin is **not visible in the traveler sidebar**, by design. The admin console is a distinct future role-based route area.

---

## Shared Local State and Interactions

`client/src/contexts/TripPlannerContext.tsx` is the current local-demo state boundary. It is the most important file to understand before connecting any backend.

| Local action | Screens affected |
| --- | --- |
| Add an activity | Itinerary, trip overview, budget, calendar, map/timeline, and sharing. |
| Delete or duplicate an activity | Itinerary and connected budget/calendar views. |
| Move an activity between days | Itinerary order and connected cost/date views. |
| Reorder stops | Route rail, overview, itinerary, map, and trip summary. |
| Add/remove a stop | Route and itinerary structure. |
| Toggle beach buffet | Budget totals and cost trail. |
| Add manual expense | Budget Buddy’s local expense list. |
| Update trip basics | Create Trip wizard and trip overview. |
| Save a destination | Discover/Destinations and Profile’s saved-place count. |
| Set mock role | Future role-based UI preparation only; never rely on it for security. |

The application also includes a reusable **Global Atlas Search** dialog inside `AppShell`, reusable confirmation/error/loading UI primitives in `components/DemoUi.tsx`, Sonner toast feedback, and contextual empty-state copy.

---

## Atlas Comes Alive

The Goa Trip Overview contains GlobeTrotter’s signature interaction:

```text
Illustrated Goa atlas scene
        ↓ hover / focus / tap
Real Goa photograph
        ↓
“Goa — in real life” stamp
        ↓
Editorial photo story
        ↓
Add Goa experiences to my trip
```

The experience is **preloaded and deterministic**. It does not call an AI service and must remain fast and maintainable.

| File | Purpose |
| --- | --- |
| `client/src/components/travel/AtlasRevealImage.tsx` | Layered illustrated-to-real-photo reveal with hover, focus, click/tap, delayed leave reset, pointer parallax, reduced-motion support, keyboard support, and photo failure fallback. |
| `client/src/components/travel/DestinationPhotoGallery.tsx` | Reusable editorial photo gallery with itinerary CTA. |
| `client/src/domain/destinationPhotoStories.ts` | Typed, data-driven destination photo configuration. |

To add a new destination later, add a new `DestinationPhotoStory` configuration and reuse these components. Do **not** hard-code city image data into pages.

The current Goa assets are stored through project-managed `/manus-storage/` paths. They were sourced from Unsplash/Pexels search results and framed as collected atlas/postcard material.

---

## Key Files and Responsibilities

```text
client/src/
├── App.tsx                         # Routing, providers, traveler/admin route separation
├── index.css                        # Storybook Atlas tokens, layouts, responsive behaviour, visual motifs
├── components/
│   ├── AppShell.tsx                 # Traveler sidebar, top bar, mobile navigation, Global Atlas Search
│   ├── ProductUi.tsx                # Shared traveler page primitives and trip tabs
│   ├── DemoUi.tsx                   # Confirmation, loading, error, and search dialogs
│   ├── Map.tsx                      # Future provider-ready map component
│   └── travel/
│       ├── AtlasRevealImage.tsx
│       └── DestinationPhotoGallery.tsx
├── contexts/
│   └── TripPlannerContext.tsx       # Connected local trip, saved-place, expense, and demo-role state
├── domain/
│   ├── trip.ts                      # Travel types and demo trip/city/activity data
│   └── destinationPhotoStories.ts   # Destination image-story configuration
├── lib/
│   └── tripMath.ts                  # Pure trip and budget calculations
└── pages/
    ├── ProductPages.tsx             # Traveler, auth, sharing, account, and legacy admin-related pages
    ├── AdminConsole.tsx             # Separate admin console and management/analytics views
    └── Home.tsx                     # Dashboard alias

Documentation:
├── README.md                        # This self-contained continuation guide
├── ANTIGRAVITY_HANDOFF.md           # Odoo/API/persistence migration details
├── ATLAS_COMES_ALIVE.md             # Photo-interaction implementation details
├── REFINEMENT_NOTES.md              # Previous UI/UX refinement notes
├── ARCHITECTURE.md                  # Early product and backend boundary notes
├── ideas.md                         # Storybook Atlas design direction and accepted style rules
└── todo.md                          # Completed implementation/documentation checklist
```

## Run and Validate

```bash
pnpm install
pnpm dev
pnpm check
```

`pnpm check` has been run successfully after the final frontend completion pass. Representative desktop, tablet, and mobile views were also reviewed, including traveler dashboard, trips, itinerary, Goa overview, Budget Buddy, Discover, admin overview, admin users, and admin analytics.

## Do Not Break These Contracts

1. Keep the **Storybook Atlas** visual identity, including route motifs, paper surfaces, thick ink outlines, coral/teal/marigold meaning, and travel-journal voice.
2. Keep the travel hierarchy: `Trip → TripStop → ItineraryDay → Activity`.
3. Keep traveler and admin navigation separate. Do not put `Admin` in the ordinary traveler sidebar.
4. Preserve `TripPlannerContext`, `tripMath`, `AtlasRevealImage`, `DestinationPhotoGallery`, `AppShell`, `AdminConsolePage`, and `DemoUi` as the primary transition points.
5. Keep data configuration outside visual components. In particular, preserve separate destination-photo configuration.
6. Do not add a booking marketplace, payment checkout, insurance, visa, or wallet feature. The product is for **travel planning**, not travel booking.
7. Do not add fake API calls. Use the current local state until real Odoo endpoints are ready.

## Antigravity: Recommended Next Steps

The safest continuation order is shown below.

| Priority | Work to add | Why it comes next |
| --- | --- | --- |
| 1 | Odoo models and PostgreSQL persistence for User, UserPreference, Trip, TripStop, ItineraryDay, Activity/TripActivity, City, Expense, Budget, SharedTrip, Notification, and AuditLog | Makes the existing product model durable. |
| 2 | Real session/authentication and server-side traveler/admin authorization | Makes the existing UI routes secure. |
| 3 | Typed API/service layer for trips, itinerary, discovery, budget, profile, sharing, and admin | Replaces local context state without rebuilding page UX. |
| 4 | Live city/activity catalog and managed image attribution | Replaces demo discovery data. |
| 5 | Map provider integration | Replaces the illustrated provider-ready map without changing trip-route UI. |
| 6 | Persistent share links, copy-trip records, and collaboration permissions | Completes the sharing journey. |
| 7 | Notifications and optional validated AI itinerary suggestions | Adds later-stage intelligence after ownership and persistence are stable. |

For API boundaries, persistence specifics, role requirements, and migration tasks, read [`ANTIGRAVITY_HANDOFF.md`](./ANTIGRAVITY_HANDOFF.md) next.

## Final Handoff Summary

GlobeTrotter has reached a **finished frontend prototype** stage. It already demonstrates the full user journey from discovering a destination to planning, budgeting, visualizing, sharing, and entering an operational admin console. The next collaborator should concentrate on **backend integration and persistence**, not visual redesign or frontend reconstruction.
