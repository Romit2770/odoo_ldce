# GlobeTrotter – Empowering Personalized Travel Planning

> **Lead Architect Design Document & Foundation Setup (Phase 1)**
> Built for the Odoo Hackathon. Designed for enterprise-grade scalability, modular feature separation, and seamless Odoo / PostgreSQL relational backend integration.

---

## 1. Project Purpose & Problem Statement

Modern travel planning is fragmented across map tools, spreadsheets, and booking apps. **GlobeTrotter** solves this by providing a unified, personalized platform where travelers can:

- Construct multi-city journeys with ordered destination stops and precise calendar dates.
- Structure day-by-day itineraries with scheduled activities, locations, and time blocks.
- Search and discover verified destinations and curated activities.
- Calculate real-time estimated and actual budgets with multi-category breakdown (Transport, Accommodation, Food, Activities, Miscellaneous).
- Visualize journeys on an interactive timeline/calendar and multi-stop route map.
- Publish itineraries publicly with clone-enabled links for community travelers.
- Administer the platform via a dedicated system console for destinations, activities, users, and analytics.

---

## 2. Core Domain Data Model Hierarchy

> **CRITICAL DOMAIN PRINCIPLE:** "Section" is **NOT** used as a primary domain concept. The relational hierarchy strictly follows:

```
Trip
└── Trip Stop (City / Destination visited with arrival/departure dates)
    └── Itinerary Day (Specific calendar day with day number)
        └── Activity / TripActivity (Specific scheduled experience with time & cost)
```

### Relational Entities:
1. **Trip**: The overarching journey container with title, date range, total budget, and status.
2. **TripStop**: A city/destination destination visited in sequence during the trip with stay duration.
3. **ItineraryDay**: A single calendar day belonging to a specific Trip Stop.
4. **Activity / TripActivity**: Curated catalog activities or custom planned experiences on an itinerary day.
5. **Expense & Budget**: Real-time spending trackers grouped by category.
6. **City**: Master destination metadata (cost index, season, coordinates).
7. **SharedTrip**: Public read-only permalink container with clone counters.
8. **User & UserPreference**: Personalization settings (currency, travel style, alerts).

---

## 3. Technology Stack

### Frontend:
- **Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + PostCSS
- **Design System / UI**: shadcn/ui pattern primitives with Radix UI + Lucide React
- **Routing**: React Router v7
- **Server State & Caching**: TanStack Query v5
- **Form Management & Validation**: React Hook Form + Zod
- **Data Visualizations**: Recharts
- **Calendar Engine**: FullCalendar

### Backend Direction:
- **Target Backend**: Odoo + Python + Odoo ORM
- **Database Engine**: PostgreSQL (Strictly Relational)
- **Maps Abstraction**: Pluggable provider layer (OpenStreetMap / Mapbox / Google Maps)
- **AI Abstraction**: Pluggable recommendation layer (Gemini / OpenAI / Custom)

---

## 4. Folder Structure (Feature-Based Architecture)

```
src/
├── app/
│   ├── router/            # Central React Router configuration
│   ├── providers/         # QueryProvider, AuthProvider, TooltipProvider
│   └── store/             # Local and persisted state stores
│
├── assets/                # Static icons, logos, and images
│
├── components/
│   ├── ui/                # shadcn primitives: Button, Input, Select, Card, Badge, Tabs, Dialog, Sheet, etc.
│   ├── layout/            # Navbar, Sidebar, MobileNavigation, AppLayout, AuthLayout, AdminLayout
│   ├── common/            # MapView abstraction, LoadingSpinner, EmptyState, ProtectedRoute
│   └── feedback/          # ErrorBoundary, Toast system
│
├── features/
│   ├── auth/              # Login, Register, Forgot Password, Zod schemas
│   ├── dashboard/         # Traveler dashboard, trip highlights, metric cards
│   ├── trips/             # Multi-city trip creation, trip registry, details, sharing
│   ├── itinerary/         # Day-by-day itinerary builder, activity timelines
│   ├── destinations/      # City discovery and destination catalog
│   ├── activities/        # Activity explorer and categorized search
│   ├── budget/            # Budget breakdown, category tracking, expense logging
│   ├── calendar/          # Trip timeline and calendar views
│   ├── community/         # Public discover feed, shared itinerary viewer, cloning
│   ├── profile/           # User profile, travel style preferences, settings
│   └── admin/             # Console for users, trips, cities, activities, analytics
│
├── hooks/                 # useDebounce, useMediaQuery, custom lifecycle hooks
├── lib/                   # cn utility, queryClient instance
├── services/
│   ├── api/               # Typed service placeholders (trips, stops, cities, activities, budget, admin)
│   ├── auth/              # Auth service with role support
│   ├── storage/           # LocalStorage wrapper
│   ├── ai/                # AI recommendation abstraction
│   └── maps/              # Map distance and route calculation abstraction
├── types/                 # Comprehensive TypeScript domain interfaces
├── utils/                 # Currency, date, and budget formatters
├── constants/             # App configs, navigation definitions
└── styles/                # Tailwind root styling
```

---

## 5. Application Routes

| Route | Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | GlobeTrotter Landing page with feature highlights |
| `/discover` | Public | Community shared itineraries feed |
| `/shared/:shareId` | Public | Read-only shared trip viewer with cloning |
| `/login` | Public | User authentication login |
| `/register` | Public | Account creation |
| `/forgot-password` | Public | Password recovery flow |
| `/dashboard` | Authenticated | Traveler overview dashboard and active trips |
| `/trips` | Authenticated | All personal trips (upcoming, ongoing, completed) |
| `/trips/new` | Authenticated | Multi-city trip wizard with stop sequencing |
| `/trips/:tripId` | Authenticated | Trip details and hierarchical overview |
| `/trips/:tripId/itinerary` | Authenticated | Day-by-day itinerary builder & activity planner |
| `/trips/:tripId/calendar` | Authenticated | Calendar and timeline schedule |
| `/trips/:tripId/budget` | Authenticated | Real-time budget tracker and expense log |
| `/trips/:tripId/share` | Authenticated | Trip sharing and permalink manager |
| `/destinations` | Authenticated | City catalog with cost and season data |
| `/activities` | Authenticated | Categorized activity search |
| `/profile` | Authenticated | User account details |
| `/settings` | Authenticated | Travel style and currency preferences |
| `/admin` | Admin | Administration console overview |
| `/admin/users` | Admin | Users registry and role administration |
| `/admin/trips` | Admin | Global trips registry |
| `/admin/cities` | Admin | Curated destination management |
| `/admin/activities` | Admin | Master activities management |
| `/admin/analytics` | Admin | Growth and engagement metrics |

---

## 6. Development Phases

- **Phase 1 (Completed)**: Architecture, scalable folder tree, domain models, typed API layer, UI primitives, layout structures, routing, and build validation.
- **Phase 2 (Next)**: Deep UI/UX refinement for the multi-stop wizard, interactive drag-and-drop itinerary reordering, and budget calculators.
- **Phase 3**: Odoo backend integration via Python / Odoo ORM models and PostgreSQL endpoints.
- **Phase 4**: Mapbox / Google Maps SDK binding and AI recommendation assistant integration.
