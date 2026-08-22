/**
 * GlobeTrotter MongoDB Connection and Collections
 * Connects to local MongoDB and provides collections with indexes.
 */

import { MongoClient, Db, Collection, ObjectId } from "mongodb";

export type UserDocument = {
  _id?: ObjectId;
  id: string;
  name: string;
  email: string;
  role: "traveler" | "admin";
  avatar?: string;
  bio?: string;
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
  createdAt: Date;
  updatedAt: Date;
};

export type SavedDestinationDocument = {
  _id?: ObjectId;
  id: string;
  userId: string;
  name: string;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  createdAt: Date;
};

export type TripPhotoDocument = {
  _id?: ObjectId;
  id: string;
  userId: string;
  tripId: string;
  filename: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  caption?: string;
  isPrivate: boolean;
  createdAt: Date;
};

export type TripDocument = {
  _id?: ObjectId;
  id: string;
  userId: string;
  name: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
  duration: string;
  description: string;
  story?: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Draft" | "Planned" | "Active";
  budget: number;
  estimatedCost: number;
  travelStyle: string;
  travelStyles?: string[];
  startLocation?: string;
  endLocation?: string;
  baseExpenses?: Record<string, number>;
  stops: any[];
  route?: {
    distance?: number;
    duration?: number;
    legs?: any[];
  };
  sharing?: {
    enabled: boolean;
    shareCode: string | null;
    createdAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type PlaceDetailDocument = {
  _id?: ObjectId;
  placeKey: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  about: string;
  whyVisit: string[];
  highlights: string[];
  famousFor: string[];
  food: string[];
  activities: string[];
  nearbyPlaces: Array<{
    name: string;
    slug: string;
    distance?: string;
    description?: string;
  }>;
  bestTimeToVisit: string;
  recommendedDuration: string;
  travelTips: string[];
  budgetLevel: string;
  source: "gemini" | "curated";
  createdAt: Date;
  updatedAt: Date;
};

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/globetrotter";

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  if (db && client) {
    return { db, client };
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db();
    console.log(`[MongoDB] Connected successfully to ${MONGODB_URI}`);

    // Create indexes
    await db.collection("users").createIndex({ id: 1 }, { unique: true });
    await db.collection("users").createIndex({ email: 1 });
    await db.collection("saved_destinations").createIndex({ userId: 1 });
    await db.collection("saved_destinations").createIndex({ id: 1 }, { unique: true });
    await db.collection("trip_photos").createIndex({ userId: 1, tripId: 1 });
    await db.collection("trip_photos").createIndex({ id: 1 }, { unique: true });
    await db.collection("trips").createIndex({ id: 1 }, { unique: true });
    await db.collection("trips").createIndex({ userId: 1 });
    await db.collection("trips").createIndex({ "sharing.shareCode": 1 }, { sparse: true });
    await db.collection("place_details").createIndex({ slug: 1 }, { unique: true });
    await db.collection("place_details").createIndex({ placeKey: 1 });

    return { db, client };
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error);
    throw error;
  }
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<UserDocument>("users");
}

export async function getSavedDestinationsCollection(): Promise<Collection<SavedDestinationDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<SavedDestinationDocument>("saved_destinations");
}

export async function getTripPhotosCollection(): Promise<Collection<TripPhotoDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<TripPhotoDocument>("trip_photos");
}

export async function getTripsCollection(): Promise<Collection<TripDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<TripDocument>("trips");
}

export async function getPlaceDetailsCollection(): Promise<Collection<PlaceDetailDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<PlaceDetailDocument>("place_details");
}
