# GlobeTrotter Product & Technical Architecture

## Product Flow

GlobeTrotter is a multi-city planning product, not a booking catalogue. Its primary user journey is:

> **Discover → Plan → Organize → Budget → Visualize → Share**

The core travel hierarchy is immutable across frontend and future backend boundaries:

```text
Trip
└── Trip Stop
    └── Itinerary Day
        └── Activity
```

The current build is a responsive front-end MVP that demonstrates this connected flow around a Goa Adventure scenario. Production persistence, authentication, and integrations are deliberately held behind service boundaries for a future Odoo implementation.

## Frontend Structure

```text
client/src/
├── components/
│   ├── AppShell.tsx        # Navigation and responsive product frame
│   └── Map.tsx             # Provider-ready Google Maps component supplied by the template
├── domain/
│   └── trip.ts             # Shared travel domain types and UI demo data
├── pages/
│   └── Home.tsx            # Connected dashboard, planner, discovery, budget, map and share surfaces
├── App.tsx                 # Route shell
└── index.css               # Storybook Atlas design system
```

## Future Odoo Module Boundary

```text
globetrotter/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── trip.py
│   ├── trip_stop.py
│   ├── itinerary_day.py
│   ├── activity.py
│   ├── budget.py
│   ├── expense.py
│   └── shared_trip.py
├── controllers/
│   ├── trip.py
│   ├── discovery.py
│   ├── budget.py
│   └── share.py
├── security/
├── views/
└── data/
```

The frontend should call typed endpoints by domain: `/api/trips`, `/api/trip-stops`, `/api/itinerary`, `/api/budget`, `/api/discovery`, and `/api/shared-trips`. Authentication, validation, and role checks remain Odoo responsibilities.

## Relational Model

| Entity | Purpose | Primary relationships |
| --- | --- | --- |
| `res.users` / UserPreference | Traveler account and preferences | One user has many trips; one preference profile |
| Trip | Journey container with dates, status, and budget target | One trip has many stops, days, expenses; one budget and optional share |
| TripStop | Ordered city visit with local dates | Belongs to one trip and one city; has itinerary days |
| ItineraryDay | A dated plan for a stop | Belongs to one trip and one stop; has ordered trip activities |
| Activity / TripActivity | Discoverable activity and an itinerary assignment | Activity has many assignments; assignment belongs to one day |
| Expense / Budget | Cost entries and calculated planning summary | Both belong to one trip |
| SharedTrip | Public/read-only sharing record | Optional one-to-one record with Trip |

## Budget Calculation Layer

The service calculates totals by category before the UI renders any warning:

```text
estimatedTotal = transport + accommodation + food + activities + miscellaneous
remaining = totalBudget - estimatedTotal
budgetUsedPercent = estimatedTotal / totalBudget × 100
averageDailyCost = estimatedTotal / dayCount
```

An AI itinerary suggestion is always an untrusted draft: **AI response → schema validation → business logic → persisted data**. The AI must never write directly to an Odoo model.

## Current Frontend MVP Scope

The in-browser demo supports visual navigation across dashboard, itinerary planning, city discovery, budget, route/calendar, and sharing states; it also includes immediate UI feedback for adding a stop, adding an activity, and copying a share link. Data persistence, user accounts, real map tiles, and backend APIs are intentionally not fabricated in the frontend.
