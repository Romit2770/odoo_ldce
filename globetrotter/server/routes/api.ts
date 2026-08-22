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

// Middleware: Authenticate / Resolve Current User
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const headerId = (req.headers["x-user-id"] as string) || "";
    const headerEmail = (req.headers["x-user-email"] as string) || "";
    const headerName = (req.headers["x-user-name"] as string) || "";

    const usersCol = await getUsersCollection();

    let user: UserDocument | null = null;

    if (headerId) {
      user = await usersCol.findOne({ id: headerId });
    } else if (headerEmail) {
      user = await usersCol.findOne({ email: headerEmail.toLowerCase() });
    }

    // Auto-seed user if not existing yet (from auth context login)
    if (!user) {
      const defaultId = headerId || `user_${Date.now()}`;
      const defaultEmail = headerEmail || (headerName ? `${headerName.toLowerCase().replace(/\s+/g, "")}@example.com` : "traveler@globetrotter.travel");
      const defaultName = headerName || "Mita Shah";

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
apiRouter.get("/trips/:tripId/photos", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const tripId = req.params.tripId;

    const photosCol = await getTripPhotosCollection();
    const photos = await photosCol
      .find({ userId: user.id, tripId })
      .sort({ createdAt: -1 })
      .toArray();

    // Format photo URLs
    const formatted = photos.map((p) => ({
      id: p.id,
      tripId: p.tripId,
      filename: p.filename,
      originalName: p.originalName,
      caption: p.caption || "",
      size: p.size,
      mimeType: p.mimeType,
      url: `/api/photos/${p.id}`,
      createdAt: p.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET /api/trips/:tripId/photos error", error);
    res.status(500).json({ error: "Failed to load trip photos." });
  }
});

apiRouter.post(
  "/trips/:tripId/photos",
  requireAuth,
  upload.single("photo"),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserDocument;
      const tripId = req.params.tripId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const photosCol = await getTripPhotosCollection();

      const newPhoto: TripPhotoDocument = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        tripId,
        filename: file.filename,
        originalName: file.originalname,
        storagePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        caption: (req.body.caption as string) || "",
        isPrivate: true,
        createdAt: new Date(),
      };

      await photosCol.insertOne(newPhoto);

      res.status(201).json({
        success: true,
        photo: {
          id: newPhoto.id,
          tripId: newPhoto.tripId,
          filename: newPhoto.filename,
          originalName: newPhoto.originalName,
          caption: newPhoto.caption,
          size: newPhoto.size,
          mimeType: newPhoto.mimeType,
          url: `/api/photos/${newPhoto.id}`,
          createdAt: newPhoto.createdAt,
        },
      });
    } catch (error) {
      console.error("POST /api/trips/:tripId/photos error", error);
      res.status(500).json({ error: "Failed to upload photo." });
    }
  }
);

apiRouter.delete("/trips/:tripId/photos/:photoId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const { tripId, photoId } = req.params;

    const photosCol = await getTripPhotosCollection();
    const photo = await photosCol.findOne({ id: photoId, userId: user.id, tripId });

    if (!photo) {
      return res.status(403).json({ error: "Photo not found or permission denied." });
    }

    // Delete file from disk
    if (fs.existsSync(photo.storagePath)) {
      try {
        fs.unlinkSync(photo.storagePath);
      } catch (err) {
        console.warn("Failed to delete physical file", err);
      }
    }

    // Delete DB record
    await photosCol.deleteOne({ id: photoId, userId: user.id });

    res.json({ success: true, message: "Photo deleted successfully." });
  } catch (error) {
    console.error("DELETE photo error", error);
    res.status(500).json({ error: "Failed to delete photo." });
  }
});

// Authenticated Private Photo File Server
apiRouter.get("/photos/:photoId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserDocument;
    const photoId = req.params.photoId;

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
      return res.status(404).json({ error: "File not found on disk." });
    }

    res.setHeader("Content-Type", photo.mimeType || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    const stream = fs.createReadStream(photo.storagePath);
    stream.pipe(res);
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
