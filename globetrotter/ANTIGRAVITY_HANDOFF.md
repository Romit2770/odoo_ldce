# GlobeTrotter: Antigravity Handoff

> **Current status:** **Phase 1 (Odoo Backend + PostgreSQL Foundation) is complete.** The native Odoo module is located in `addons/globetrotter` with 12 domain models, security rules, seed data, unit tests, and 11 RESTful API controllers. The React frontend includes a typed API client layer (`client/src/services/`) and optimistic context synchronization. Next phases will focus on live map provider integration and transactional external workflows.

## 1. Frontend Architecture

The project uses React 19, TypeScript, Wouter, Tailwind CSS, shadcn/ui primitives, Lucide icons, and Sonner notifications. The frontend has deliberately separated travel domain data, shared local state, calculations, destination photography configuration, pages, and reusable UI components.

| Concern | Current implementation | Antigravity guidance |
| --- | --- | --- |
| Travel domain | `client/src/domain/trip.ts` | Replace demo arrays with Odoo-backed DTOs while preserving the `Trip → TripStop → ItineraryDay → Activity` hierarchy. |
| Shared state | `client/src/contexts/TripPlannerContext.tsx` | Replace local reducers/actions with typed client services and server-derived query state. Keep page-facing action names stable where practical. |
| Calculations | `client/src/lib/tripMath.ts` | Keep pure calculations reusable; move authoritative financial calculations to Odoo/backend services. |
| Destination imagery | `client/src/domain/destinationPhotoStories.ts` | Keep photo-story content separate from components. Source URLs and attribution should move to a city/content model or CMS. |
| Routing | `client/src/App.tsx` | Add authenticated route gates and role-aware layouts without changing traveler URLs. |
| Traveler shell | `client/src/components/AppShell.tsx` | Preserve the Travel Desk navigation; do not add Admin to ordinary traveler navigation. |
| Admin UI | `client/src/pages/AdminConsole.tsx` | Replace mock tables/KPIs/charts with Odoo reporting endpoints. The admin shell is intentionally distinct from the traveler shell. |

## 2. Current Routes

| Route group | Current routes |
| --- | --- |
| Authentication UI | `/login`, `/register`, `/forgot-password` |
| Traveler desk | `/`, `/dashboard`, `/trips`, `/trips/new`, `/discover`, `/destinations`, `/activities`, `/profile`, `/settings` |
| Trip workspace | `/trips/:tripId`, `/itinerary`, `/calendar`, `/budget`, `/map`, `/share` |
| Shared itinerary | `/shared/:shareId` |
| Admin console | `/admin`, `/admin/users`, `/admin/trips`, `/admin/cities`, `/admin/activities`, `/admin/analytics` |

## 3. Domain and Future Odoo Entities

The frontend is already organized around entities that should map cleanly to Odoo models.

```text
res.users / User
└── UserPreference

Trip
└── TripStop
    └── ItineraryDay
        └── TripActivity / Activity

City
Expense
Budget
SharedTrip
Notification
AuditLog
```

`TripPlannerContext` currently exposes local actions for activities, stops, trip basics, expenses, saved places, and mock role selection. When migrating, use typed service boundaries such as `tripService`, `itineraryService`, `destinationService`, `budgetService`, `shareService`, `profileService`, `adminService`, and `notificationService`. Do **not** add fake fetch calls before real endpoints exist.

## 4. Frontend Components to Preserve

| Component or module | Reason it should not be rewritten |
| --- | --- |
| `AtlasRevealImage` | Encapsulates the accessible illustration-to-real-photo interaction, including hover, focus, tap, delayed reset, reduced motion, and image fallback. |
| `DestinationPhotoGallery` | Keeps editorial destination photography modular and itinerary-connected. |
| `TripPlannerContext` | Defines useful page-facing local action contracts that can be adapted to service calls. |
| `tripMath` | Provides pure cost, breakdown, day, activity, and progress calculations. |
| `AppShell` | Already carries the Storybook Atlas traveler navigation pattern and mobile navigation. |
| `AdminConsolePage` | Provides distinct system-administration information hierarchy, independent of traveler navigation. |
| `DemoUi` | Reusable confirmation, loading, error, and global-search primitives that can be connected to real service state. |

## 5. Authentication and Role Integration

The current auth routes are UI-only. Future Odoo authentication should provide a session with at least `userId`, `displayName`, `email`, and `role`.

| Role | Default entry | Permissions to enforce server-side |
| --- | --- | --- |
| `traveler` | `/dashboard` | Own profile, own trips, own expenses, own saved places, permitted shared trips. |
| `admin` | `/admin` | Platform users, trips, destinations, activities, moderation, analytics, audit logs, and notifications. |

Use the existing `demoRole` abstraction only as a UI transition point. Never trust it for authorization. Odoo must enforce object ownership and role access at the API/model layer.

## 6. API Boundaries to Add Later

| Frontend concern | Suggested backend boundary |
| --- | --- |
| Authentication | Odoo session/OAuth bridge, current-user endpoint, role claims. |
| Trips and stops | CRUD endpoints for trips, ordered stops, dates, cover information, visibility, and planning status. |
| Itinerary | Day/activity CRUD, time updates, ordering, duplication, movement, notes, and validation. |
| Discovery | Searchable city/activity catalog, saved places, filters, pagination, images, and activity availability. |
| Budget | Expenses, category allocation, estimated vs. actual spend, currency, warnings, and reporting. |
| Sharing | Immutable public share IDs, privacy options, copy-trip workflow, public read-only DTO. |
| Maps | A backend-safe provider proxy or configuration gateway for Google Maps, Mapbox, or OpenStreetMap. |
| Notifications | Server-backed reminders and activity/budget/share notifications. |
| AI | A controlled itinerary-suggestion endpoint with validated request and response schemas. |
| Admin | Aggregated metrics, user/trip/city/activity management, moderation, and audit logs. |

## 7. Persistence and Migration Checklist

1. Create Odoo models and PostgreSQL storage for the entities above, including order fields for stops/days/activities.
2. Define serialized API contracts that preserve the existing frontend domain concepts.
3. Replace `TripPlannerContext` local initialization with query hydration for the active trip and user data.
4. Convert optimistic local actions into mutations with loading, error, retry, and conflict states.
5. Add real login/register/reset flows and server-enforced role-based routing.
6. Implement share permissions and read-only public itinerary access.
7. Connect discovery catalogs, map provider integration, and image attribution through managed backend data.
8. Replace admin mock metrics and tables with role-protected reporting endpoints.
9. Add durable notification preferences and scheduled/transactional notifications.
10. Add an optional AI itinerary endpoint only after permission and persistence boundaries are stable.

## 8. Current Limitations

The app deliberately resets local planning changes on refresh. Mock administrative records, user identities, auth forms, budgets, share links, expense entries, saved places, and role values are **not** persisted. The visual map is provider-ready only. No real email, payment, booking, collaboration, remote photo CMS, or AI generation is included.
