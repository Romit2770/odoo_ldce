# Atlas Comes Alive: Goa Photo Experience

> **Purpose:** Turn the existing illustrated Goa trip scene into an interactive bridge from the GlobeTrotter atlas to real destination photography, without changing the existing travel-product architecture.

## Experience Flow

The interaction lives on `/trips/goa-adventure`. The page loads with the **illustrated Goa scene**. On desktop, hover or keyboard focus reveals a preloaded real Goa photograph beneath the illustration. On touch devices, a tap toggles the same reveal. The visual sequence is entirely client-side and deterministic.

```text
Illustrated Goa atlas
        ↓ hover / focus / tap
Real Goa photograph + “Goa — in real life” stamp
        ↓
Goa beyond the postcard gallery
        ↓
Add Goa experiences to my trip
```

## Components and Data

| File | Responsibility |
| --- | --- |
| `client/src/components/travel/AtlasRevealImage.tsx` | Reusable layered illustration/photo reveal with hover, focus, tap, pointer parallax, delayed leave reset, photo-failure fallback, and reduced-motion support. |
| `client/src/components/travel/DestinationPhotoGallery.tsx` | Reusable editorial gallery and itinerary-connected CTA. |
| `client/src/domain/destinationPhotoStories.ts` | Typed destination story configuration with illustration, primary real photograph, gallery items, labels, categories, and image-source metadata. |
| `client/src/pages/ProductPages.tsx` | Composes the Goa Trip Overview with `AtlasRevealImage` and `DestinationPhotoGallery`. |
| `client/src/index.css` | Storybook Atlas reveal, stamp, gallery, reduced-motion, tablet, and mobile styling. |

## Image Sources Used

The Goa photographs were selected from publicly usable free-stock search results, copied into project-managed static storage, and uploaded as project assets. No destination image is generated at runtime.

| Image | Subject | Source |
| --- | --- | --- |
| `goa-real-beach_2b46eba5.jpg` | Baga Beach / primary real-photo reveal | Unsplash |
| `palolem-beach_b83a31a7.jpg` | Palolem Beach | Unsplash |
| `fort-aguada_f288875b.jpg` | Fort Aguada | Pexels |
| `goa-coast_b82e0ce1.jpg` | Coastal Lookout | Unsplash |
| `goa-palms_f01cf4a9.jpg` | Palm Cove | Unsplash |

## Accessibility and Resilience

The reveal container is keyboard reachable, has an accessible label and pressed state, responds to **Enter** and **Space**, and uses a delayed reset to avoid hover flicker. It offers click/tap toggling on touch devices. Users who prefer reduced motion receive a simple crossfade with transitions reduced to near-instant. If the real image fails to load, the illustrated Goa scene remains visible rather than exposing a broken image.

## Continuing the Feature

To add another city, create a new `DestinationPhotoStory` configuration, provide its illustration and licensed photos, and compose the same two components on that city’s trip overview. The UI does not need to know asset details, so future work can remain data-driven when the project is moved to Antigravity or connected to Odoo.

## Current Limitations

The gallery is a visual storytelling feature. It does not yet include a dedicated photo detail modal, attribution UI, remote CMS, offline image cache, or direct activity assignment per photo. The current CTA opens the existing activity discovery screen, where travellers can use the established itinerary-add flow.
