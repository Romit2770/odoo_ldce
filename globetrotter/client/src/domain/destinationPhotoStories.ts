/**
 * Storybook Atlas destination imagery is kept as content data so photo experiences
 * can be reused for future cities without placing asset details inside UI components.
 * Assets are project-managed and bundled with Vite.
 */

import goaVignette from "@/assets/illustrations/globetrotter-goa-vignette.png";
import goaRealBeach from "@/assets/destinations/goa/goa-real-beach.jpg";
import palolemBeach from "@/assets/destinations/goa/palolem-beach.jpg";
import fortAguada from "@/assets/destinations/goa/fort-aguada.jpg";
import goaCoast from "@/assets/destinations/goa/goa-coast.jpg";
import goaPalms from "@/assets/destinations/goa/goa-palms.jpg";

export type DestinationGalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  source: "Unsplash" | "Pexels";
  size: "feature" | "tall" | "wide" | "square";
};

export type DestinationPhotoStory = {
  id: string;
  name: string;
  illustrationSrc: string;
  realImageSrc: string;
  revealAlt: string;
  revealCaption: string;
  gallery: DestinationGalleryPhoto[];
};

export const goaPhotoStory: DestinationPhotoStory = {
  id: "goa",
  name: "Goa",
  illustrationSrc: goaVignette,
  realImageSrc: goaRealBeach,
  revealAlt: "A real Goa beach with bright water, palms, and a coastal shoreline",
  revealCaption: "Goa — in real life",
  gallery: [
    { id: "baga", src: goaRealBeach, alt: "Palm-lined Goa beach beside turquoise water", title: "Baga Beach", category: "Beach & Nightlife", source: "Unsplash", size: "feature" },
    { id: "palolem", src: palolemBeach, alt: "Quiet coast and sea at Palolem Beach", title: "Palolem Beach", category: "Slow Coastal Days", source: "Unsplash", size: "wide" },
    { id: "aguada", src: fortAguada, alt: "Fort Aguada lighthouse and red stone grounds", title: "Fort Aguada", category: "History & Views", source: "Pexels", size: "tall" },
    { id: "coast", src: goaCoast, alt: "A lush coastal viewpoint in Goa", title: "Coastal Lookout", category: "Nature & Sunsets", source: "Unsplash", size: "square" },
    { id: "palms", src: goaPalms, alt: "Goa palms around a quiet tropical shoreline", title: "Palm Cove", category: "A Little Escape", source: "Unsplash", size: "wide" },
  ],
};

export function getPlaceImage(slugOrKey: string): string {
  const norm = (slugOrKey || "").toLowerCase().trim();
  if (norm.includes("baga")) return goaRealBeach;
  if (norm.includes("palolem")) return palolemBeach;
  if (norm.includes("aguada")) return fortAguada;
  if (norm.includes("coast") || norm.includes("lookout")) return goaCoast;
  if (norm.includes("palm") || norm.includes("cove")) return goaPalms;
  return goaRealBeach;
}
