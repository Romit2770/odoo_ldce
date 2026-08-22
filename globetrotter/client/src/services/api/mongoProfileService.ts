/**
 * GlobeTrotter MongoDB Profile, Preferences, Destinations & Private Photos Service
 */

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "traveler" | "admin";
  avatar: string;
  bio: string;
  preferences: {
    currency: string;
    language: string;
    travelStyle: string;
    travelStyles: string[];
    foodPreferences: string[];
    budgetPreference: string;
    preferredActivities: string[];
    emailNotifications?: boolean;
    tripReminders?: boolean;
    budgetAlerts?: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    tripVisibility: "public" | "private";
    photoVisibility: "public" | "private";
  };
  savedDestinationsCount: number;
  tripsCount: number;
};

export type SavedDestination = {
  id: string;
  userId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  createdAt: string;
};

export type TripPhoto = {
  id: string;
  tripId: string;
  filename: string;
  originalName: string;
  caption: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: string;
};

function getAuthHeaders(user?: { id?: string; email?: string; name?: string } | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user?.id) headers["x-user-id"] = user.id;
  if (user?.email) headers["x-user-email"] = user.email;
  if (user?.name) headers["x-user-name"] = user.name;
  return headers;
}

export const mongoProfileService = {
  // 1. Profile
  async getProfile(user?: { id?: string; email?: string; name?: string } | null): Promise<UserProfile> {
    const res = await fetch("/api/profile", {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load profile from database.");
    return res.json();
  },

  async updateProfile(
    data: { name?: string; bio?: string; avatar?: string; email?: string },
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<UserProfile> {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: getAuthHeaders(user),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save profile changes.");
    const json = await res.json();
    return json.user;
  },

  // 2. Preferences
  async getPreferences(user?: { id?: string; email?: string; name?: string } | null) {
    const res = await fetch("/api/preferences", {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load preferences from database.");
    return res.json();
  },

  async updatePreferences(
    preferences: Partial<UserProfile["preferences"]>,
    user?: { id?: string; email?: string; name?: string } | null
  ) {
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: getAuthHeaders(user),
      body: JSON.stringify(preferences),
    });
    if (!res.ok) throw new Error("Failed to save preferences.");
    return res.json();
  },

  // 3. Saved Destinations
  async getSavedDestinations(
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<SavedDestination[]> {
    const res = await fetch("/api/destinations", {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load saved destinations.");
    return res.json();
  },

  async saveDestination(
    dest: Partial<SavedDestination>,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<SavedDestination> {
    const res = await fetch("/api/destinations", {
      method: "POST",
      headers: getAuthHeaders(user),
      body: JSON.stringify(dest),
    });
    if (!res.ok) throw new Error("Failed to save destination pin.");
    const json = await res.json();
    return json.destination;
  },

  async removeDestination(
    destId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<void> {
    const res = await fetch(`/api/destinations/${destId}`, {
      method: "DELETE",
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to remove destination.");
  },

  // 4. Privacy
  async getPrivacy(user?: { id?: string; email?: string; name?: string } | null) {
    const res = await fetch("/api/privacy", {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load privacy settings.");
    return res.json();
  },

  async updatePrivacy(
    privacy: Partial<UserProfile["privacy"]>,
    user?: { id?: string; email?: string; name?: string } | null
  ) {
    const res = await fetch("/api/privacy", {
      method: "PATCH",
      headers: getAuthHeaders(user),
      body: JSON.stringify(privacy),
    });
    if (!res.ok) throw new Error("Failed to save privacy settings.");
    return res.json();
  },

  // 5. Private Trip Photos
  async getTripsWithPhotoCounts(
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<
    {
      id: string;
      name: string;
      dateRange: string;
      duration: string;
      startLocation?: string;
      endLocation?: string;
      route: string;
      stopsCount: number;
      photoCount: number;
    }[]
  > {
    const res = await fetch("/api/user/trips-with-photo-counts", {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load trips with photo counts.");
    return res.json();
  },

  async getTripPhotos(
    tripId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<TripPhoto[]> {
    const res = await fetch(`/api/trips/${tripId}/photos`, {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load private trip photos.");
    return res.json();
  },

  async uploadTripPhotos(
    tripId: string,
    files: File[],
    caption = "",
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<TripPhoto[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("photos", file);
    }
    if (caption) formData.append("caption", caption);

    const headers: Record<string, string> = {};
    if (user?.id) headers["x-user-id"] = user.id;
    if (user?.email) headers["x-user-email"] = user.email;
    if (user?.name) headers["x-user-name"] = user.name;

    const res = await fetch(`/api/trips/${tripId}/photos`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload trip photos.");
    const json = await res.json();
    return json.photos || (json.photo ? [json.photo] : []);
  },

  async uploadTripPhoto(
    tripId: string,
    file: File,
    caption = "",
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<TripPhoto> {
    const photos = await mongoProfileService.uploadTripPhotos(tripId, [file], caption, user);
    return photos[0];
  },

  async deleteTripPhoto(
    tripId: string,
    photoId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<void> {
    const res = await fetch(`/api/trips/${tripId}/photos/${photoId}`, {
      method: "DELETE",
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to delete trip photo.");
  },

  // Authenticated binary photo loader (Returns Object URL)
  async fetchPhotoBlobUrl(
    photoUrl: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<string> {
    const res = await fetch(photoUrl, {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load image`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};
