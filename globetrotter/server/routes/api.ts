/**
 * GlobeTrotter MongoDB API Router
 * Handles Profiles, Preferences, Saved Destinations, Privacy, and Private Trip Photos.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getUsersCollection,
  getSavedDestinationsCollection,
  getTripPhotosCollection,
  getTripsCollection,
  type UserDocument,
  type SavedDestinationDocument,
  type TripPhotoDocument,
  type TripDocument,
  type PlaceDetailDocument,
  getPlaceDetailsCollection,
} from "../db/mongodb.js";
import { generateDiscoverRecommendations } from "../services/geminiService.js";
import { getOrGeneratePlaceDetail } from "../services/geminiPlaceService.js";

export const apiRouter = Router();

// Configure Private Storage Directory
const PROJECT_ROOT = process.cwd();
const UPLOAD_ROOT = path.join(PROJECT_ROOT, "uploads", "private");

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Setup Multer Storage for Private Trip Photos
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as any).user?.id || "anonymous";
    const tripId = req.params.tripId || "default";
    const targetDir = path.join(UPLOAD_ROOT, userId, tripId);
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }
  },
});

// Helper: Detect accurate image MIME type
function getMimeType(filePath: string, storedMime?: string): string {
  if (storedMime && storedMime.startsWith("image/")) return storedMime;
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

// Middleware: Authenticate / Resolve Current User
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const headerId =
      (req.headers["x-user-id"] as string) ||
      (req.query.userId as string) ||
      (req.query.u as string) ||
      "";
    const headerEmail =
      (req.headers["x-user-email"] as string) ||
      (req.query.email as string) ||
      "";
    const headerName = (req.headers["x-user-name"] as string) || "";

    const usersCol = await getUsersCollection();

    let user: UserDocument | null = null;

    if (headerId) {
      user = await usersCol.findOne({ id: headerId });
    } else if (headerEmail) {
      user = await usersCol.findOne({ email: headerEmail.toLowerCase() });
    }

    // If no credentials provided, resolve to the primary user in DB
    if (!user && !headerId && !headerEmail) {
      user = await usersCol.findOne({}, { sort: { createdAt: 1 } });
    }

    // Auto-seed default user if database is completely empty
    if (!user) {
      const defaultId = headerId || "usr_romit";
      const defaultEmail =
        headerEmail ||
        (headerName
          ? `${headerName.toLowerCase().replace(/\s+/g, "")}@gmail.com`
          : "romitkakadiya2703@gmail.com");
      const defaultName = headerName || "Romit Kakadiya";

      const newUser: UserDocument = {
        id: defaultId,
        name: defaultName,
        email: defaultEmail,
        role: "traveler",
        avatar: "",
        bio: "I collect coastlines, chai breaks, and itineraries with breathing room.",
        preferences: {
          currency: "INR",
          language: "English",
          travelStyle: "Adventure",
          travelStyles: ["Adventure", "Culture"],
          foodPreferences: ["Local specialties", "Vegetarian-friendly"],
          budgetPreference: "Balanced",
          preferredActivities: ["Heritage walks", "Sunset viewpoints", "Café hopping"],
          emailNotifications: true,
          tripReminders: true,
          budgetAlerts: true,
        },
        privacy: {
          profileVisibility: "public",
          tripVisibility: "private",
          photoVisibility: "private",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await usersCol.insertOne(newUser);
      user = newUser;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]", error);
    res.status(500).json({ error: "Failed to authenticate request with database." });
  }
}

// -------------------------------------------------------------
// 1. Profile APIs
// -------------------------------------------------------------
apiRouter.get("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const destCol = await getSavedDestinationsCollection();

    const savedDestCount = await destCol.countDocuments({ userId: user.id });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      bio: user.bio || "",
      preferences: user.preferences,
      privacy: user.privacy,
      savedDestinationsCount: savedDestCount,
      tripsCount: 1,
    });
  } catch (error) {
    console.error("GET /api/profile error", error);
    res.status(500).json({ error: "Failed to load profile." });
  }
});

apiRouter.patch("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { name, bio, avatar, email } = req.body;

    const usersCol = await getUsersCollection();
    const updateData: Partial<UserDocument> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (email !== undefined && email.includes("@")) updateData.email = email.trim().toLowerCase();

    await usersCol.updateOne({ id: user.id }, { $set: updateData });

    const updated = await usersCol.findOne({ id: user.id });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error("PATCH /api/profile error", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// -------------------------------------------------------------
// 2. Preferences APIs
// -------------------------------------------------------------
apiRouter.get("/preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    res.json(user.preferences || {});
  } catch (error) {
    console.error("GET /api/preferences error", error);
    res.status(500).json({ error: "Failed to load preferences." });
  }
});

apiRouter.patch("/preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const preferences = req.body;

    const usersCol = await getUsersCollection();
    await usersCol.updateOne(
      { id: user.id },
      {
        $set: {
          preferences: { ...user.preferences, ...preferences },
          updatedAt: new Date(),
        },
      }
    );

    const updated = await usersCol.findOne({ id: user.id });
    res.json({ success: true, preferences: updated?.preferences });
  } catch (error) {
    console.error("PATCH /api/preferences error", error);
    res.status(500).json({ error: "Failed to update preferences." });
  }
});

// -------------------------------------------------------------
// 3. Saved Destinations APIs (Strictly Isolated Per User)
// -------------------------------------------------------------
apiRouter.get("/destinations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const destCol = await getSavedDestinationsCollection();
    const destinations = await destCol
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(destinations);
  } catch (error) {
    console.error("GET /api/destinations error", error);
    res.status(500).json({ error: "Failed to load saved destinations." });
  }
});

apiRouter.post("/destinations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { name, city, state, country, latitude, longitude, formattedAddress, imageUrl } = req.body;

    if (!name && !city) {
      return res.status(400).json({ error: "Destination name or city is required." });
    }

    const destCol = await getSavedDestinationsCollection();

    // Check if already saved by this user
    const existing = await destCol.findOne({
      userId: user.id,
      city: (city || name).toLowerCase(),
    });

    if (existing) {
      return res.json({ success: true, destination: existing, message: "Already saved." });
    }

    const newDest: SavedDestinationDocument = {
      id: `dest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      name: name || city,
      city: city || name,
      state: state || "",
      country: country || "India",
      formattedAddress: formattedAddress || `${city || name}, ${state || country}`,
      latitude: Number(latitude) || 15.5527,
      longitude: Number(longitude) || 73.7517,
      imageUrl: imageUrl || "",
      createdAt: new Date(),
    };

    await destCol.insertOne(newDest);
    res.status(201).json({ success: true, destination: newDest });
  } catch (error) {
    console.error("POST /api/destinations error", error);
    res.status(500).json({ error: "Failed to save destination." });
  }
});

apiRouter.delete("/destinations/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const destId = req.params.id;

    const destCol = await getSavedDestinationsCollection();
    const result = await destCol.deleteOne({ id: destId, userId: user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Destination not found or not owned by user." });
    }

    res.json({ success: true, message: "Destination removed from wish list." });
  } catch (error) {
    console.error("DELETE /api/destinations error", error);
    res.status(500).json({ error: "Failed to remove destination." });
  }
});

// -------------------------------------------------------------
// 4. Privacy Settings APIs
// -------------------------------------------------------------
apiRouter.get("/privacy", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    res.json(user.privacy || {});
  } catch (error) {
    console.error("GET /api/privacy error", error);
    res.status(500).json({ error: "Failed to load privacy settings." });
  }
});

apiRouter.patch("/privacy", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const privacy = req.body;

    const usersCol = await getUsersCollection();
    await usersCol.updateOne(
      { id: user.id },
      {
        $set: {
          privacy: { ...user.privacy, ...privacy },
          updatedAt: new Date(),
        },
      }
    );

    const updated = await usersCol.findOne({ id: user.id });
    res.json({ success: true, privacy: updated?.privacy });
  } catch (error) {
    console.error("PATCH /api/privacy error", error);
    res.status(500).json({ error: "Failed to update privacy settings." });
  }
});

// -------------------------------------------------------------
// 5. Private Trip Photos APIs (Strict Verification & Isolation)
// -------------------------------------------------------------

// 5.1 GET User Trips with Real Dynamic Photo Counts
apiRouter.get("/user/trips-with-photo-counts", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const tripsCol = await getTripsCollection();
    const photosCol = await getTripPhotosCollection();

    let trips = await tripsCol
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    // If user has 0 trips in DB, check for default trip
    if (trips.length === 0) {
      const defaultTrip: TripDocument = {
        id: "goa-adventure",
        userId: user.id,
        name: "Goa Adventure",
        dateRange: "12–16 Aug 2026",
        duration: "5 days",
        description: "A coastal expedition across beaches and forts with time to wander.",
        story: "A coastal expedition across beaches and forts with time to wander.",
        status: "Planned",
        budget: 25000,
        estimatedCost: 18500,
        travelStyle: "Adventure",
        travelStyles: ["Adventure", "Relaxation"],
        startLocation: "Mumbai",
        endLocation: "Goa",
        stops: [
          {
            id: "stop-mumbai",
            city: "Mumbai",
            country: "India",
            region: "Maharashtra",
            dateRange: "12–13 Aug",
            arrival: "Wed, 12 Aug",
            departure: "Thu, 13 Aug",
            color: "#2CB9AA",
            days: [],
          },
          {
            id: "stop-goa",
            city: "Goa",
            country: "India",
            region: "Goa",
            dateRange: "14–16 Aug",
            arrival: "Fri, 14 Aug",
            departure: "Sun, 16 Aug",
            color: "#FF6550",
            days: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await tripsCol.insertOne(defaultTrip);
      trips = await tripsCol.find({ userId: user.id }).toArray();
    }

    // Attach real photo counts from MongoDB
    const tripsWithCounts = await Promise.all(
      trips.map(async (trip) => {
        const photoCount = await photosCol.countDocuments({
          userId: user.id,
          tripId: trip.id,
        });
        return {
          id: trip.id,
          name: trip.name,
          dateRange: trip.dateRange,
          duration: trip.duration,
          startLocation: trip.startLocation,
          endLocation: trip.endLocation,
          route: trip.stops?.map((s: any) => s.city).join(" → ") || "Route",
          stopsCount: trip.stops?.length || 0,
          photoCount,
        };
      })
    );

    res.json(tripsWithCounts);
  } catch (error) {
    console.error("GET /api/user/trips-with-photo-counts error", error);
    res.status(500).json({ error: "Failed to load trips with photo counts." });
  }
});

// 5.2 GET Photos for a Specific Trip
apiRouter.get("/trips/:tripId/photos", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const tripId = req.params.tripId;

    const photosCol = await getTripPhotosCollection();
    const photos = await photosCol
      .find({ userId: user.id, tripId })
      .sort({ createdAt: -1 })
      .toArray();

    // Format photo metadata with verified availability
    const formatted = photos.map((p) => {
      const isAvailable = fs.existsSync(p.storagePath);
      return {
        id: p.id,
        tripId: p.tripId,
        filename: p.filename,
        originalName: p.originalName,
        caption: p.caption || "",
        size: p.size,
        mimeType: p.mimeType,
        isAvailable,
        url: `/api/trips/${p.tripId}/photos/${p.id}`,
        createdAt: p.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("GET /api/trips/:tripId/photos error", error);
    res.status(500).json({ error: "Failed to load trip photos." });
  }
});

// 5.3 POST Upload Photos for a Specific Trip (Supports single & multiple)
apiRouter.post(
  "/trips/:tripId/photos",
  requireAuth,
  upload.array("photos", 10),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserDocument;
      const tripId = req.params.tripId;
      const files = (req.files as Express.Multer.File[]) || [];
      const singleFile = req.file;
      const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

      if (allFiles.length === 0) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const photosCol = await getTripPhotosCollection();
      const caption = (req.body.caption as string) || "";

      const createdPhotos = [];

      for (const file of allFiles) {
        const newPhoto: TripPhotoDocument = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user.id,
          tripId,
          filename: file.filename,
          originalName: file.originalname,
          storagePath: file.path,
          mimeType: file.mimetype || getMimeType(file.path),
          size: file.size,
          caption,
          isPrivate: true,
          createdAt: new Date(),
        };

        await photosCol.insertOne(newPhoto);

        createdPhotos.push({
          id: newPhoto.id,
          tripId: newPhoto.tripId,
          filename: newPhoto.filename,
          originalName: newPhoto.originalName,
          caption: newPhoto.caption,
          size: newPhoto.size,
          mimeType: newPhoto.mimeType,
          isAvailable: true,
          url: `/api/trips/${newPhoto.tripId}/photos/${newPhoto.id}`,
          createdAt: newPhoto.createdAt,
        });
      }

      res.status(201).json({
        success: true,
        photos: createdPhotos,
        photo: createdPhotos[0],
      });
    } catch (error) {
      console.error("POST /api/trips/:tripId/photos error", error);
      res.status(500).json({ error: "Failed to upload photo." });
    }
  }
);

// 5.4 DELETE a Specific Photo
apiRouter.delete("/trips/:tripId/photos/:photoId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId, photoId } = req.params;

    const photosCol = await getTripPhotosCollection();
    const photo = await photosCol.findOne({ id: photoId, userId: user.id, tripId });

    if (!photo) {
      return res.status(403).json({ error: "Photo not found or permission denied." });
    }

    // Delete physical file from private disk
    if (fs.existsSync(photo.storagePath)) {
      try {
        fs.unlinkSync(photo.storagePath);
      } catch (err) {
        console.warn("Failed to delete physical file", err);
      }
    }

    // Delete MongoDB record
    await photosCol.deleteOne({ id: photoId, userId: user.id });

    res.json({ success: true, message: "Photo deleted successfully." });
  } catch (error) {
    console.error("DELETE photo error", error);
    res.status(500).json({ error: "Failed to delete photo." });
  }
});

// Helper for streaming binary image responses
async function servePhotoBinary(photoId: string, req: Request, res: Response) {
  const user = (req as any).user as UserDocument;
  const photosCol = await getTripPhotosCollection();
  const photo = await photosCol.findOne({ id: photoId });

  if (!photo) {
    return res.status(404).json({ error: "Photo not found." });
  }

  // Security Check: Verify Ownership
  if (photo.userId !== user.id && photo.isPrivate) {
    return res.status(403).json({ error: "Access denied. This photo is private." });
  }

  if (!fs.existsSync(photo.storagePath)) {
    return res.status(404).json({ error: "Physical image file not found on disk." });
  }

  const stat = fs.statSync(photo.storagePath);
  if (stat.size === 0) {
    return res.status(404).json({ error: "Image file is empty." });
  }

  const mimeType = getMimeType(photo.storagePath, photo.mimeType);
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Cache-Control", "private, no-transform, max-age=86400");
  res.setHeader("Accept-Ranges", "bytes");

  const stream = fs.createReadStream(photo.storagePath);
  stream.pipe(res);
}

// 5.5 Authenticated Image Serving Endpoints
apiRouter.get("/trips/:tripId/photos/:photoId", requireAuth, async (req: Request, res: Response) => {
  try {
    await servePhotoBinary(req.params.photoId, req, res);
  } catch (error) {
    console.error("GET /api/trips/:tripId/photos/:photoId error", error);
    res.status(500).json({ error: "Failed to serve photo." });
  }
});

apiRouter.get("/photos/:photoId", requireAuth, async (req: Request, res: Response) => {
  try {
    await servePhotoBinary(req.params.photoId, req, res);
  } catch (error) {
    console.error("GET /api/photos/:photoId error", error);
    res.status(500).json({ error: "Failed to serve photo." });
  }
});

// -------------------------------------------------------------
// 6. Gemini AI Discover Recommendations API
// -------------------------------------------------------------
apiRouter.post("/discover/recommendations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { query, mood } = req.body;

    const destCol = await getSavedDestinationsCollection();
    const saved = await destCol.find({ userId: user.id }).toArray();
    const savedNames = saved.map((s) => s.city || s.name);

    const recommendations = await generateDiscoverRecommendations({
      query,
      mood,
      preferences: user.preferences,
      savedDestinations: savedNames,
    });

    res.json({ success: true, recommendations });
  } catch (error) {
    console.error("POST /api/discover/recommendations error", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

// 6.2 Destination Place Detail API (with MongoDB caching & Gemini AI)
apiRouter.get("/places/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: "Place identifier is required." });
    }

    const placeDetail = await getOrGeneratePlaceDetail(slug);
    res.json(placeDetail);
  } catch (error) {
    console.error(`GET /api/places/${req.params.slug} error`, error);
    res.status(500).json({ error: "Failed to load place details." });
  }
});

// -------------------------------------------------------------
// 7. Trip Persistence & Trip Sharing by Code APIs
// -------------------------------------------------------------

// Helper to generate a collision-resistant 6-char share code
const SHARE_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // excludes 0, O, 1, I for clarity

async function generateUniqueShareCode(): Promise<string> {
  const tripsCol = await getTripsCollection();
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += SHARE_CODE_CHARS.charAt(Math.floor(Math.random() * SHARE_CODE_CHARS.length));
    }
    const existing = await tripsCol.findOne({ "sharing.shareCode": code });
    if (!existing) {
      return code;
    }
  }
  return `TRIP${Math.floor(1000 + Math.random() * 9000)}`;
}

// Helper: Get starter dummy trips (1-2 curated trips per tab)
function getStarterDummyTrips(userId: string): TripDocument[] {
  const now = new Date();
  return [
    // --- UPCOMING (2 trips) ---
    {
      id: "goa-adventure",
      userId,
      name: "Goa Coastal Expedition",
      dateRange: "12–16 Aug 2026",
      duration: "5 days",
      description: "A coastal expedition across sunlit beaches, Portuguese heritage forts, and seaside shacks.",
      story: "A coastal expedition across sunlit beaches, Portuguese heritage forts, and seaside shacks.",
      status: "Upcoming",
      budget: 25000,
      estimatedCost: 21500,
      travelStyle: "Adventure",
      travelStyles: ["Adventure", "Relaxation"],
      startLocation: "Mumbai",
      endLocation: "Goa",
      baseExpenses: { Transport: 4500, Accommodation: 7000, Food: 3200, Miscellaneous: 1700 },
      stops: [
        {
          id: "mumbai",
          city: "Mumbai",
          country: "India",
          region: "Maharashtra",
          dateRange: "12–13 Aug",
          arrival: "12 Aug",
          departure: "13 Aug",
          color: "#2CB9AA",
          days: [
            {
              id: "mumbai-d1",
              dayNumber: 1,
              date: "Wed, 12 Aug",
              city: "Mumbai",
              activities: [
                { id: "act-m1", name: "Gateway of India harbour walk", time: "10:00", duration: "1.5h", cost: 0, category: "Sightseeing", location: "Apollo Bunder", description: "Iconic landmark by the Arabian Sea." },
                { id: "act-m2", name: "Marine Drive sunset & chaat", time: "17:30", duration: "2h", cost: 350, category: "Food", location: "Marine Drive", description: "Watch the Queen's Necklace light up." },
              ],
            },
          ],
        },
        {
          id: "goa",
          city: "Goa",
          country: "India",
          region: "Goa",
          dateRange: "14–16 Aug",
          arrival: "14 Aug",
          departure: "16 Aug",
          color: "#FF6550",
          days: [
            {
              id: "goa-d2",
              dayNumber: 2,
              date: "Fri, 14 Aug",
              city: "Goa",
              activities: [
                { id: "act-g1", name: "Fort Aguada panoramic viewpoint", time: "11:00", duration: "2h", cost: 200, category: "Culture", location: "Sinquerim", description: "17th-century Portuguese fortress and lighthouse." },
                { id: "act-g2", name: "Palolem beach shack dinner", time: "19:00", duration: "2.5h", cost: 1200, category: "Food", location: "Palolem", description: "Fresh seafood by candlelit tables on the sand." },
              ],
            },
          ],
        },
      ],
      sharing: { enabled: true, shareCode: "GOA7X2", createdAt: now },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
      updatedAt: now,
    },
    {
      id: "kashmir-trail",
      userId,
      name: "Kashmir Valley Odyssey",
      dateRange: "10–16 Sep 2026",
      duration: "7 days",
      description: "Houseboats on Dal Lake, pine forests of Pahalgam, and high alpine meadows of Gulmarg.",
      story: "Houseboats on Dal Lake, pine forests of Pahalgam, and high alpine meadows of Gulmarg.",
      status: "Upcoming",
      budget: 45000,
      estimatedCost: 38000,
      travelStyle: "Nature",
      travelStyles: ["Nature", "Relaxation"],
      startLocation: "Srinagar",
      endLocation: "Pahalgam",
      baseExpenses: { Transport: 8000, Accommodation: 14000, Food: 6500, Miscellaneous: 2500 },
      stops: [
        {
          id: "srinagar",
          city: "Srinagar",
          country: "India",
          region: "Jammu & Kashmir",
          dateRange: "10–12 Sep",
          arrival: "10 Sep",
          departure: "12 Sep",
          color: "#2CB9AA",
          days: [
            {
              id: "srinagar-d1",
              dayNumber: 1,
              date: "Thu, 10 Sep",
              city: "Srinagar",
              activities: [
                { id: "act-s1", name: "Dal Lake Shikara ride at sunrise", time: "06:30", duration: "2h", cost: 800, category: "Nature", location: "Dal Lake", description: "Floating gardens and morning lotus blooms." },
              ],
            },
          ],
        },
        {
          id: "gulmarg",
          city: "Gulmarg",
          country: "India",
          region: "Jammu & Kashmir",
          dateRange: "12–14 Sep",
          arrival: "12 Sep",
          departure: "14 Sep",
          color: "#FFC53D",
          days: [
            {
              id: "gulmarg-d2",
              dayNumber: 2,
              date: "Sat, 12 Sep",
              city: "Gulmarg",
              activities: [
                { id: "act-gu1", name: "Gulmarg Gondola to Apharwat Peak", time: "10:30", duration: "3h", cost: 1800, category: "Adventure", location: "Gulmarg", description: "One of the highest cable cars in the world." },
              ],
            },
          ],
        },
      ],
      sharing: { enabled: false, shareCode: null },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      updatedAt: now,
    },

    // --- ONGOING (1 trip) ---
    {
      id: "kerala-backwaters",
      userId,
      name: "Kerala Backwaters & Tea Hills",
      dateRange: "20–26 Aug 2026",
      duration: "7 days",
      description: "Cruising palm-fringed lagoons in Alleppey and waking up above foggy tea slopes in Munnar.",
      story: "Cruising palm-fringed lagoons in Alleppey and waking up above foggy tea slopes in Munnar.",
      status: "Ongoing",
      budget: 32000,
      estimatedCost: 28500,
      travelStyle: "Relaxation",
      travelStyles: ["Relaxation", "Nature"],
      startLocation: "Kochi",
      endLocation: "Alleppey",
      baseExpenses: { Transport: 5500, Accommodation: 11000, Food: 4800, Miscellaneous: 2000 },
      stops: [
        {
          id: "kochi",
          city: "Kochi",
          country: "India",
          region: "Kerala",
          dateRange: "20–22 Aug",
          arrival: "20 Aug",
          departure: "22 Aug",
          color: "#2CB9AA",
          days: [
            {
              id: "kochi-d1",
              dayNumber: 1,
              date: "Thu, 20 Aug",
              city: "Kochi",
              activities: [
                { id: "act-k1", name: "Fort Kochi Chinese fishing nets", time: "16:00", duration: "1.5h", cost: 0, category: "Sightseeing", location: "Fort Kochi", description: "Historic cantilevered fishing nets at twilight." },
              ],
            },
          ],
        },
        {
          id: "munnar",
          city: "Munnar",
          country: "India",
          region: "Kerala",
          dateRange: "22–24 Aug",
          arrival: "22 Aug",
          departure: "24 Aug",
          color: "#FFC53D",
          days: [
            {
              id: "munnar-d2",
              dayNumber: 2,
              date: "Sat, 22 Aug",
              city: "Munnar",
              activities: [
                { id: "act-mu1", name: "Kolukkumalai organic tea trek", time: "07:00", duration: "4h", cost: 600, category: "Nature", location: "Kolukkumalai", description: "High elevation estate with mist valleys." },
              ],
            },
          ],
        },
      ],
      sharing: { enabled: false, shareCode: null },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40),
      updatedAt: now,
    },

    // --- COMPLETED (2 trips) ---
    {
      id: "rajasthan-heritage",
      userId,
      name: "Royal Rajasthan Heritage",
      dateRange: "14–21 Jun 2026",
      duration: "8 days",
      description: "Wandering through the Blue City of Jodhpur, City Palace in Jaipur, and Lake Pichola in Udaipur.",
      story: "Wandering through the Blue City of Jodhpur, City Palace in Jaipur, and Lake Pichola in Udaipur.",
      status: "Completed",
      budget: 52000,
      estimatedCost: 48500,
      travelStyle: "Culture",
      travelStyles: ["Culture", "Luxury"],
      startLocation: "Jaipur",
      endLocation: "Udaipur",
      baseExpenses: { Transport: 9000, Accommodation: 18000, Food: 7500, Miscellaneous: 3000 },
      stops: [
        {
          id: "jaipur",
          city: "Jaipur",
          country: "India",
          region: "Rajasthan",
          dateRange: "14–16 Jun",
          arrival: "14 Jun",
          departure: "16 Jun",
          color: "#FF6550",
          days: [
            {
              id: "jaipur-d1",
              dayNumber: 1,
              date: "Sun, 14 Jun",
              city: "Jaipur",
              activities: [
                { id: "act-j1", name: "Amer Fort ramparts walk", time: "09:00", duration: "2.5h", cost: 500, category: "Culture", location: "Amer", description: "Grand Rajput architecture and hilltop ramparts." },
              ],
            },
          ],
        },
        {
          id: "udaipur",
          city: "Udaipur",
          country: "India",
          region: "Rajasthan",
          dateRange: "18–21 Jun",
          arrival: "18 Jun",
          departure: "21 Jun",
          color: "#2CB9AA",
          days: [
            {
              id: "udaipur-d2",
              dayNumber: 2,
              date: "Fri, 19 Jun",
              city: "Udaipur",
              activities: [
                { id: "act-u1", name: "Lake Pichola boat cruise", time: "17:00", duration: "1.5h", cost: 700, category: "Sightseeing", location: "Lake Pichola", description: "Sunset views of Jag Mandir and City Palace." },
              ],
            },
          ],
        },
      ],
      sharing: { enabled: false, shareCode: null },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
      updatedAt: now,
    },
    {
      id: "varanasi-notebook",
      userId,
      name: "Varanasi & Sarnath Notebook",
      dateRange: "02–06 May 2026",
      duration: "5 days",
      description: "Dawn boat rides along the ghats, evening Ganga Aarti, and ancient stupas of Sarnath.",
      story: "Dawn boat rides along the ghats, evening Ganga Aarti, and ancient stupas of Sarnath.",
      status: "Completed",
      budget: 18000,
      estimatedCost: 15500,
      travelStyle: "Culture",
      travelStyles: ["Culture", "Food"],
      startLocation: "Varanasi",
      endLocation: "Sarnath",
      baseExpenses: { Transport: 3000, Accommodation: 5500, Food: 3200, Miscellaneous: 1200 },
      stops: [
        {
          id: "varanasi",
          city: "Varanasi",
          country: "India",
          region: "Uttar Pradesh",
          dateRange: "02–05 May",
          arrival: "02 May",
          departure: "05 May",
          color: "#FF6550",
          days: [
            {
              id: "varanasi-d1",
              dayNumber: 1,
              date: "Sat, 02 May",
              city: "Varanasi",
              activities: [
                { id: "act-v1", name: "Dashashwamedh Ghat Ganga Aarti", time: "18:30", duration: "1.5h", cost: 0, category: "Culture", location: "Dashashwamedh Ghat", description: "Grand prayer ceremony by the sacred river." },
              ],
            },
          ],
        },
      ],
      sharing: { enabled: false, shareCode: null },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 180),
      updatedAt: now,
    },

    // --- DRAFT (1 trip) ---
    {
      id: "meghalaya-roots",
      userId,
      name: "Meghalaya Living Roots",
      dateRange: "15–20 Nov 2026",
      duration: "6 days",
      description: "Exploring living root bridges in Nongriat, crystal waters of Dawki, and misty waterfalls of Cherrapunji.",
      story: "Exploring living root bridges in Nongriat, crystal waters of Dawki, and misty waterfalls of Cherrapunji.",
      status: "Draft",
      budget: 30000,
      estimatedCost: 24500,
      travelStyle: "Adventure",
      travelStyles: ["Adventure", "Nature"],
      startLocation: "Guwahati",
      endLocation: "Cherrapunji",
      baseExpenses: { Transport: 5000, Accommodation: 9000, Food: 4200, Miscellaneous: 1800 },
      stops: [
        {
          id: "shillong",
          city: "Shillong",
          country: "India",
          region: "Meghalaya",
          dateRange: "15–17 Nov",
          arrival: "15 Nov",
          departure: "17 Nov",
          color: "#2CB9AA",
          days: [
            {
              id: "shillong-d1",
              dayNumber: 1,
              date: "Sun, 15 Nov",
              city: "Shillong",
              activities: [
                { id: "act-sh1", name: "Umiam Lake viewpoint & café", time: "14:00", duration: "2h", cost: 150, category: "Nature", location: "Umiam", description: "Serene lakeside views nestled in pine hills." },
              ],
            },
          ],
        },
      ],
      sharing: { enabled: false, shareCode: null },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15),
      updatedAt: now,
    },
  ];
}

// 7.1 GET all trips for the authenticated user
apiRouter.get("/trips", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const tripsCol = await getTripsCollection();

    let trips = await tripsCol
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Auto-seed 2-3 starter trips for each tab if user has < 4 trips
    if (trips.length < 4) {
      const dummyTrips = getStarterDummyTrips(user.id);
      for (const dt of dummyTrips) {
        const uniqueId = `${dt.id}_${user.id}`;
        const exists = trips.some((t) => t.id === uniqueId || t.id === dt.id);
        if (!exists) {
          const tripToInsert = { ...dt, id: uniqueId, userId: user.id };
          await tripsCol.updateOne(
            { id: uniqueId, userId: user.id },
            { $set: tripToInsert },
            { upsert: true }
          );
        }
      }
      trips = await tripsCol
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .toArray();
    }

    res.json(trips);
  } catch (error) {
    console.error("GET /api/trips error", error);
    res.status(500).json({ error: "Failed to load trips." });
  }
});

// 7.2 GET a single trip by ID (Strict ownership check)
apiRouter.get("/trips/:tripId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId } = req.params;
    const tripsCol = await getTripsCollection();

    const trip = await tripsCol.findOne({
      $or: [
        { id: tripId, userId: user.id },
        { id: `${tripId}_${user.id}`, userId: user.id },
        { id: tripId.replace(`_${user.id}`, ""), userId: user.id },
      ],
    });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found or permission denied." });
    }

    const est = Number(trip.estimatedCost) || Number(trip.budget) || 25000;
    const baseExpenses = trip.baseExpenses || {
      Transport: Math.round(est * 0.35),
      Accommodation: Math.round(est * 0.35),
      Food: Math.round(est * 0.2),
      Miscellaneous: Math.round(est * 0.1),
    };

    res.json({ ...trip, baseExpenses });
  } catch (error) {
    console.error("GET /api/trips/:tripId error", error);
    res.status(500).json({ error: "Failed to load trip." });
  }
});

// 7.3 POST Create a new trip in MongoDB
apiRouter.post("/trips", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const data = req.body;

    const tripsCol = await getTripsCollection();

    const tripId = data.id || `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newTrip: TripDocument = {
      id: tripId,
      userId: user.id,
      name: data.name || "My Journey",
      dateRange: data.dateRange || "15–20 Aug",
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration || "5 days",
      description: data.description || data.story || "",
      story: data.story || data.description || "",
      status: data.status || "Planned",
      budget: Number(data.budget) || 25000,
      estimatedCost: Number(data.estimatedCost) || 0,
      travelStyle: data.travelStyle || "Adventure",
      travelStyles: data.travelStyles || [data.travelStyle || "Adventure"],
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      baseExpenses: data.baseExpenses || { Transport: 6500, Accommodation: 12000, Food: 4500, Miscellaneous: 2000 },
      stops: data.stops || [],
      route: data.route,
      sharing: {
        enabled: false,
        shareCode: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert or insert
    await tripsCol.updateOne(
      { id: tripId, userId: user.id },
      { $set: newTrip },
      { upsert: true }
    );

    res.status(201).json({ success: true, trip: newTrip });
  } catch (error) {
    console.error("POST /api/trips error", error);
    res.status(500).json({ error: "Failed to create trip." });
  }
});

// 7.4 PATCH Update an existing trip (Strict ownership)
apiRouter.patch("/trips/:tripId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId } = req.params;
    const updates = req.body;

    const tripsCol = await getTripsCollection();
    const existing = await tripsCol.findOne({ id: tripId, userId: user.id });

    if (!existing) {
      return res.status(404).json({ error: "Trip not found or permission denied." });
    }

    const { _id, id, userId, ...allowedUpdates } = updates;

    await tripsCol.updateOne(
      { id: tripId, userId: user.id },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      }
    );

    const updated = await tripsCol.findOne({ id: tripId, userId: user.id });
    res.json({ success: true, trip: updated });
  } catch (error) {
    console.error("PATCH /api/trips/:tripId error", error);
    res.status(500).json({ error: "Failed to update trip." });
  }
});

// 7.5 DELETE a trip (Strict ownership)
apiRouter.delete("/trips/:tripId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId } = req.params;

    const tripsCol = await getTripsCollection();
    const result = await tripsCol.deleteOne({ id: tripId, userId: user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Trip not found or permission denied." });
    }

    res.json({ success: true, message: "Trip deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/trips/:tripId error", error);
    res.status(500).json({ error: "Failed to delete trip." });
  }
});

// 7.6 POST Generate / Enable Share Code for a Trip
apiRouter.post("/trips/:tripId/share", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId } = req.params;
    const tripsCol = await getTripsCollection();

    const trip = await tripsCol.findOne({ id: tripId, userId: user.id });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found or permission denied." });
    }

    let shareCode = trip.sharing?.shareCode;
    if (!shareCode) {
      shareCode = await generateUniqueShareCode();
    }

    await tripsCol.updateOne(
      { id: tripId, userId: user.id },
      {
        $set: {
          sharing: {
            enabled: true,
            shareCode,
            createdAt: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      shareCode,
      shareUrl: `/share/${shareCode}`,
    });
  } catch (error) {
    console.error("POST /api/trips/:tripId/share error", error);
    res.status(500).json({ error: "Failed to enable trip sharing." });
  }
});

// 7.7 DELETE Disable Share Code for a Trip
apiRouter.delete("/trips/:tripId/share", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId } = req.params;
    const tripsCol = await getTripsCollection();

    const trip = await tripsCol.findOne({ id: tripId, userId: user.id });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found or permission denied." });
    }

    await tripsCol.updateOne(
      { id: tripId, userId: user.id },
      {
        $set: {
          "sharing.enabled": false,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ success: true, message: "Trip sharing disabled." });
  } catch (error) {
    console.error("DELETE /api/trips/:tripId/share error", error);
    res.status(500).json({ error: "Failed to disable trip sharing." });
  }
});

// 7.8 GET Public Shared Trip by Share Code (NO AUTH REQUIRED, READ ONLY)
apiRouter.get("/shared-trips/:shareCode", async (req: Request, res: Response) => {
  try {
    const shareCode = req.params.shareCode.trim().toUpperCase();
    if (!shareCode || shareCode.length < 4 || shareCode.length > 12) {
      return res.status(404).json({ error: "Invalid trip share code." });
    }

    const tripsCol = await getTripsCollection();
    const trip = await tripsCol.findOne({
      "sharing.shareCode": shareCode,
      "sharing.enabled": true,
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found or sharing has been disabled." });
    }

    // Return ONLY sanitized public trip fields — NEVER expose userId, emails, passwords, private photos
    const sanitizedTrip = {
      id: trip.id,
      name: trip.name,
      dateRange: trip.dateRange,
      duration: trip.duration,
      description: trip.description || trip.story || "",
      story: trip.story || trip.description || "",
      status: trip.status || "Planned",
      budget: trip.budget,
      estimatedCost: trip.estimatedCost,
      travelStyle: trip.travelStyle,
      travelStyles: trip.travelStyles,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      stops: trip.stops,
      route: trip.route,
      sharing: {
        enabled: true,
        shareCode: trip.sharing?.shareCode,
      },
    };

    res.json(sanitizedTrip);
  } catch (error) {
    console.error("GET /api/shared-trips/:shareCode error", error);
    res.status(500).json({ error: "Failed to load shared trip." });
  }
});
