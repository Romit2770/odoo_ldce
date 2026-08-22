# GlobeTrotter REST API Documentation

All API responses follow a standardized JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Human readable explanation",
    "code": "ERROR_CODE"
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new traveler account and creates default travel preferences.

**Payload:**
```json
{
  "name": "Jane Traveler",
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```

### `POST /api/auth/login`
Authenticates a user and establishes an HTTP session cookie.

**Payload:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```

### `POST /api/auth/logout`
Terminates the current session.

### `GET /api/auth/me`
Returns current user profile, preferences, and permissions.

---

## 2. Trips Endpoints

### `GET /api/trips`
Lists trips belonging to the authenticated traveler (or demo seed trips in preview).

**Query Parameters:**
- `status`: Optional filter (`Upcoming`, `Ongoing`, `Completed`, `Draft`)

### `GET /api/trips/:id`
Fetches a single trip with full route stops, days, activities, and budget statistics.

### `POST /api/trips`
Creates a new multi-city trip.

**Payload:**
```json
{
  "name": "Rajasthan Forts Trail",
  "startDate": "2026-10-01",
  "endDate": "2026-10-08",
  "budget": 35000,
  "travelStyle": "Culture",
  "description": "Exploring Jaipur, Jodhpur, and Udaipur."
}
```

### `PUT /api/trips/:id`
Updates trip properties (`name`, `budget`, `description`, `travelStyle`, etc.).

### `DELETE /api/trips/:id`
Deletes a trip and cascades removal of stops and scheduled activities.

---

## 3. Itinerary & Activities Endpoints

### `POST /api/trips/:id/activities`
Schedules an activity into a specific itinerary day.

**Payload:**
```json
{
  "stopId": "1",
  "dayId": "3",
  "name": "Sunset Shack Dinner",
  "time": "19:00",
  "duration": "2h",
  "cost": 1200,
  "category": "Food",
  "location": "Anjuna Beach",
  "description": "Fresh seafood and ocean breeze"
}
```

### `PUT /api/trip-activities/:id`
Updates an existing scheduled activity.

### `DELETE /api/trip-activities/:id`
Removes an activity from an itinerary day.

### `POST /api/trip-activities/:id/duplicate`
Duplicates a scheduled activity on the same day.

### `POST /api/trip-activities/:id/move`
Moves an activity from one itinerary day to another.

**Payload:**
```json
{
  "targetDayId": "4",
  "targetIndex": 0
}
```

---

## 4. Destinations & Discovery Endpoints

### `GET /api/destinations`
Returns curated destination cities with search & filter support.

### `POST /api/destinations/:id/toggle-save`
Toggles saving a destination to the user's saved places list.

### `GET /api/activities`
Returns master catalog activities. Filter by `?city=goa&category=Adventure`.

---

## 5. Budget & Expenses Endpoints

### `GET /api/trips/:id/budget`
Returns total allocated budget, category breakdowns, estimated costs, and actual spend.

### `POST /api/trips/:id/budget/toggle-buffet`
Toggles the Goa beach buffet (+₹1,200) calculation flag.

### `GET /api/trips/:id/expenses`
Lists all logged expenses for the trip.

### `POST /api/trips/:id/expenses`
Records a new actual expense.

**Payload:**
```json
{
  "category": "Food",
  "description": "Lunch at spice plantation",
  "amount": 750,
  "date": "2026-08-14",
  "notes": "Cash payment"
}
```

---

## 6. Sharing & Public Views Endpoints

### `POST /api/trips/:id/share`
Generates or retrieves a unique share link (`/shared/:shareId`).

### `GET /api/shared/:shareId`
Publicly retrieves read-only itinerary data for a shared trip.

### `POST /api/shared/:shareId/clone`
Clones a shared itinerary into the logged-in traveler's account as a fresh copy.

---

## 7. Admin Endpoints (Requires Admin Role)

- `GET /api/admin/overview`: Platform KPIs, user counts, trip growth.
- `GET /api/admin/users`: User management table.
- `GET /api/admin/trips`: Global trip monitoring.
- `GET /api/admin/cities` & `POST /api/admin/cities`: Destination catalog management.
- `GET /api/admin/activities` & `POST /api/admin/activities`: Master activities management.
- `GET /api/admin/analytics`: Financial statistics, category rankings, and trip statuses.
- `GET /api/admin/audit-logs`: System audit trail.
