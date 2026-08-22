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
} from "../db/mongodb.js";
import { generateDiscoverRecommendations } from "../services/geminiService.js";

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

// 7.1 GET all trips for the authenticated user
apiRouter.get("/trips", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const tripsCol = await getTripsCollection();

    const trips = await tripsCol
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

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

    const trip = await tripsCol.findOne({ id: tripId, userId: user.id });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found or permission denied." });
    }

    res.json(trip);
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
