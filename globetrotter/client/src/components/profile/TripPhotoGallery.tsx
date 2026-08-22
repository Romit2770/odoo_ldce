/**
 * TripPhotoGallery — Real Trip-Wise Private Photo Gallery & Lightbox
 * Strictly isolates photos by trip, supports authenticated image streaming, multi-upload, and lightbox preview.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Lock,
  Plus,
  Route,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  mongoProfileService,
  type TripPhoto,
} from "@/services/api/mongoProfileService";
import { AuthenticatedTripImage } from "@/components/travel/AuthenticatedTripImage";
import { DemoDialog } from "@/components/DemoUi";

type TripSummaryItem = {
  id: string;
  name: string;
  dateRange: string;
  duration: string;
  startLocation?: string;
  endLocation?: string;
  route: string;
  stopsCount: number;
  photoCount: number;
};

export function TripPhotoGallery() {
  const { user } = useAuth();

  // State
  const [trips, setTrips] = useState<TripSummaryItem[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripSummaryItem | null>(null);
  const [photos, setPhotos] = useState<TripPhoto[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCaption, setUploadCaption] = useState("");
  const [pendingDeletePhoto, setPendingDeletePhoto] = useState<TripPhoto | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Load User's Trips with Real Photo Counts
  const loadTrips = async () => {
    setIsLoadingTrips(true);
    try {
      const data = await mongoProfileService.getTripsWithPhotoCounts(user);
      setTrips(data);
    } catch (err: any) {
      console.warn("[TripPhotoGallery] Failed to load trips:", err);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user?.id, user?.email]);

  // 2. Load Photos for Selected Trip
  const loadTripPhotos = async (tripId: string) => {
    setIsLoadingPhotos(true);
    try {
      const data = await mongoProfileService.getTripPhotos(tripId, user);
      setPhotos(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load photos for this trip.");
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Select a trip to view its gallery
  const handleSelectTrip = (trip: TripSummaryItem) => {
    setSelectedTrip(trip);
    loadTripPhotos(trip.id);
  };

  // Return to trips overview
  const handleBackToTrips = () => {
    setSelectedTrip(null);
    setPhotos([]);
    setLightboxIndex(null);
    loadTrips(); // Refresh photo counts
  };

  // 3. Multi-Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTrip) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);

    try {
      const uploaded = await mongoProfileService.uploadTripPhotos(
        selectedTrip.id,
        fileList,
        uploadCaption,
        user
      );

      setPhotos((prev) => [...uploaded, ...prev]);
      setUploadCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast.success(
        `Uploaded ${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} to "${selectedTrip.name}".`
      );

      // Update local trip counter
      setSelectedTrip((prev) =>
        prev ? { ...prev, photoCount: prev.photoCount + uploaded.length } : null
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo(s).");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Delete Photo Handler
  const confirmDeletePhoto = async () => {
    if (!selectedTrip || !pendingDeletePhoto) return;
    try {
      await mongoProfileService.deleteTripPhoto(
        selectedTrip.id,
        pendingDeletePhoto.id,
        user
      );

      setPhotos((prev) => prev.filter((p) => p.id !== pendingDeletePhoto.id));
      setSelectedTrip((prev) =>
        prev ? { ...prev, photoCount: Math.max(0, prev.photoCount - 1) } : null
      );

      if (lightboxIndex !== null) {
        if (photos.length <= 1) {
          setLightboxIndex(null);
        } else if (lightboxIndex >= photos.length - 1) {
          setLightboxIndex(photos.length - 2);
        }
      }

      toast.success("Photo removed from private storage.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete photo.");
    } finally {
      setPendingDeletePhoto(null);
    }
  };

  // Lightbox Keyboard Navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : photos.length - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev < photos.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, photos.length]);

  return (
    <div className="trip-wise-gallery-container">
      {/* ------------------------------------------------------------- */}
      {/* STEP 1: Your Trips List                                      */}
      {/* ------------------------------------------------------------- */}
      {!selectedTrip && (
        <div className="trip-selection-stage">
          <div className="stage-header">
            <div>
              <h3>Your Trips</h3>
              <p>Select a trip to browse or manage its private memory gallery.</p>
            </div>
            <span className="privacy-badge">
              <Lock size={12} /> Stored privately
            </span>
          </div>

          {isLoadingTrips ? (
            <div className="trip-loading-box">
              <Loader2 size={24} className="animate-spin text-coral" />
              <span>Loading your trips from database...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-trips-gallery-state">
              <FolderOpen size={36} className="text-gray-400" />
              <h4>No trips in your travel desk yet</h4>
              <p>Create a trip to start uploading private travel memories.</p>
            </div>
          ) : (
            <div className="trip-photo-cards-grid">
              {trips.map((trip) => (
                <div key={trip.id} className="trip-photo-hub-card">
                  <div className="hub-card-header">
                    <span className="ticket-label">
                      <Route size={12} /> {trip.route}
                    </span>
                    <span className="photo-count-badge">
                      <ImageIcon size={12} />
                      {trip.photoCount} {trip.photoCount === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  <div className="hub-card-body">
                    <h4>{trip.name}</h4>
                    <p>
                      <CalendarDays size={13} /> {trip.dateRange} · {trip.duration}
                    </p>
                  </div>

                  <div className="hub-card-footer">
                    <button
                      type="button"
                      className="coral-button btn-sm"
                      onClick={() => handleSelectTrip(trip)}
                    >
                      <FolderOpen size={14} /> View gallery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: Selected Trip Gallery                                 */}
      {/* ------------------------------------------------------------- */}
      {selectedTrip && (
        <div className="selected-trip-gallery-stage">
          <div className="gallery-top-nav">
            <button
              type="button"
              className="soft-link back-to-trips-btn"
              onClick={handleBackToTrips}
            >
              <ArrowLeft size={16} /> Back to trips
            </button>
          </div>

          <div className="gallery-trip-banner">
            <div>
              <span className="ticket-label">
                <Route size={12} /> {selectedTrip.route}
              </span>
              <h2>{selectedTrip.name}</h2>
              <p>
                {selectedTrip.dateRange} · {photos.length}{" "}
                {photos.length === 1 ? "private memory" : "private memories"}
              </p>
            </div>
            <span className="privacy-badge">
              <Lock size={12} /> Private to you
            </span>
          </div>

          {/* Upload Controls */}
          <div className="gallery-upload-panel">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />

            <input
              type="text"
              placeholder="Optional photo caption..."
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              className="caption-input"
            />

            <button
              type="button"
              className="coral-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading photos...
                </>
              ) : (
                <>
                  <Plus size={16} /> Upload photos
                </>
              )}
            </button>
          </div>

          {/* Photos Grid */}
          {isLoadingPhotos ? (
            <div className="trip-loading-box">
              <Loader2 size={28} className="animate-spin text-coral" />
              <span>Retrieving photos from private storage...</span>
            </div>
          ) : photos.length === 0 ? (
            <div className="empty-photos-in-trip">
              <ImageIcon size={40} className="text-gray-400" />
              <h4>No photos in this gallery yet</h4>
              <p>Add your first photo using the upload button above.</p>
            </div>
          ) : (
            <div className="real-photo-grid">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="real-photo-item"
                  onClick={() => setLightboxIndex(index)}
                >
                  <AuthenticatedTripImage
                    src={photo.url}
                    alt={photo.caption || photo.originalName}
                    fallbackName={photo.originalName}
                    className="gallery-img-elem"
                  />

                  <div className="photo-hover-overlay">
                    <div className="overlay-info">
                      <span className="caption-text">
                        {photo.caption || photo.originalName}
                      </span>
                    </div>

                    <div className="overlay-actions">
                      <button
                        type="button"
                        className="zoom-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(index);
                        }}
                        title="Enlarge photo"
                      >
                        <ZoomIn size={15} />
                      </button>

                      <button
                        type="button"
                        className="delete-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeletePhoto(photo);
                        }}
                        title="Delete photo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: Fullscreen Lightbox Modal                             */}
      {/* ------------------------------------------------------------- */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div className="lightbox-backdrop" role="dialog" aria-modal="true">
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close preview"
            >
              <X size={20} />
            </button>

            {photos.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn prev-btn"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev > 0 ? prev - 1 : photos.length - 1) : 0
                  )
                }
                aria-label="Previous photo"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div className="lightbox-image-wrap">
              <AuthenticatedTripImage
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].caption || photos[lightboxIndex].originalName}
                fallbackName={photos[lightboxIndex].originalName}
                className="lightbox-img-elem"
              />
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn next-btn"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev < photos.length - 1 ? prev + 1 : 0) : 0
                  )
                }
                aria-label="Next photo"
              >
                <ChevronRight size={28} />
              </button>
            )}

            <div className="lightbox-footer">
              <div className="lightbox-meta">
                <strong>
                  {photos[lightboxIndex].caption || photos[lightboxIndex].originalName}
                </strong>
                <span>
                  Photo {lightboxIndex + 1} of {photos.length} ·{" "}
                  {selectedTrip?.name || "Trip"}
                </span>
              </div>

              <button
                type="button"
                className="lightbox-delete-btn"
                onClick={() => setPendingDeletePhoto(photos[lightboxIndex])}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DemoDialog
        open={Boolean(pendingDeletePhoto)}
        title="Delete this photo?"
        body="This will permanently delete this image from your private disk storage and MongoDB database."
        confirmLabel="Delete photo"
        danger
        onConfirm={confirmDeletePhoto}
        onClose={() => setPendingDeletePhoto(null)}
      />
    </div>
  );
}
