import type { PlaceDetail } from "@/domain/placeDetail";

export const placeService = {
  async getPlaceDetail(slug: string): Promise<PlaceDetail> {
    const res = await fetch(`/api/places/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      throw new Error(`Failed to load place details: ${res.statusText}`);
    }
    return res.json();
  },
};
