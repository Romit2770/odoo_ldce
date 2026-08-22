/**
 * ProfileSettingsView — Connected to Local MongoDB
 * Handles Profile, Preferences, Saved Destinations, Privacy, and Private Trip Photos.
 */

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Camera,
  Check,
  Globe,
  Heart,
  Image as ImageIcon,
  Lock,
  Loader2,
  MapPin,
  Plus,
  Shield,
  Trash2,
  Upload,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro } from "@/components/ProductUi";
import { useAuth } from "@/contexts/AuthContext";
import {
  mongoProfileService,
  type UserProfile,
  type SavedDestination,
  type TripPhoto,
} from "@/services/api/mongoProfileService";
import { TripPhotoGallery } from "./TripPhotoGallery";

type ProfileTab = "profile" | "preferences" | "destinations" | "privacy";

export function ProfileSettingsView() {
  const [pathname, setLocation] = useLocation();
  const { user, updateProfile: updateAuthProfile } = useAuth();

  const initialTab: ProfileTab = pathname === "/settings" ? "preferences" : "profile";
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form States
  const [name, setName] = useState(user?.name || "Traveler");
  const [email, setEmail] = useState(user?.email || "traveler@globetrotter.travel");
  const [bio, setBio] = useState("I collect coastlines, chai breaks, and itineraries with breathing room.");

  // Preferences States
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");
  const [travelStyle, setTravelStyle] = useState("Adventure");
  const [budgetPreference, setBudgetPreference] = useState("Balanced");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Adventure", "Culture"]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>(["Local specialties"]);
  const [preferredActivities, setPreferredActivities] = useState<string[]>([
    "Heritage walks",
    "Sunset viewpoints",
  ]);

  // Saved Destinations State
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [newCityInput, setNewCityInput] = useState("");
  const [isAddingDest, setIsAddingDest] = useState(false);

  // Privacy States
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("public");
  const [tripVisibility, setTripVisibility] = useState<"public" | "private">("private");
  const [photoVisibility, setPhotoVisibility] = useState<"public" | "private">("private");

  // Private Trip Photos
  const [photos, setPhotos] = useState<TripPhoto[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Profile and Related Data from MongoDB on Mount / User Switch
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function loadData() {
      try {
        const profile = await mongoProfileService.getProfile(user);
        if (isCancelled) return;

        setName(profile.name || user?.name || "Traveler");
        setEmail(profile.email || user?.email || "");
        setBio(profile.bio || "");

        if (profile.preferences) {
          setCurrency(profile.preferences.currency || "INR");
          setLanguage(profile.preferences.language || "English");
          setTravelStyle(profile.preferences.travelStyle || "Adventure");
          setBudgetPreference(profile.preferences.budgetPreference || "Balanced");
          setSelectedStyles(profile.preferences.travelStyles || [profile.preferences.travelStyle || "Adventure"]);
          setFoodPreferences(profile.preferences.foodPreferences || ["Local specialties"]);
          setPreferredActivities(profile.preferences.preferredActivities || ["Heritage walks"]);
        }

        if (profile.privacy) {
          setProfileVisibility(profile.privacy.profileVisibility || "public");
          setTripVisibility(profile.privacy.tripVisibility || "private");
          setPhotoVisibility(profile.privacy.photoVisibility || "private");
        }

        // Load saved destinations from MongoDB
        const dests = await mongoProfileService.getSavedDestinations(user);
        if (!isCancelled) setSavedDestinations(dests);

        // Load private photos for default trip
        const tripPhotos = await mongoProfileService.getTripPhotos("goa-adventure", user);
        if (!isCancelled) setPhotos(tripPhotos);
      } catch (err) {
        console.warn("[Profile] Error loading from MongoDB:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await mongoProfileService.updateProfile(
        { name, bio, email },
        user
      );

      // Update global auth context
      updateAuthProfile({ name, email });
      setSavedSuccess(true);
      toast.success("Profile saved to database successfully.");
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Preferences Changes
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await mongoProfileService.updatePreferences(
        {
          currency,
          language,
          travelStyle,
          travelStyles: selectedStyles,
          foodPreferences,
          budgetPreference,
          preferredActivities,
        },
        user
      );

      updateAuthProfile({ travelStyle, currency });
      setSavedSuccess(true);
      toast.success("Travel preferences saved to database.");
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Privacy Changes
  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await mongoProfileService.updatePrivacy(
        {
          profileVisibility,
          tripVisibility,
          photoVisibility,
        },
        user
      );
      setSavedSuccess(true);
      toast.success("Privacy settings updated in database.");
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save privacy settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add Saved Destination Pin
  const handleAddDestination = async () => {
    if (!newCityInput.trim()) return;
    setIsAddingDest(true);
    try {
      const created = await mongoProfileService.saveDestination(
        {
          name: newCityInput.trim(),
          city: newCityInput.trim(),
          country: "India",
          formattedAddress: `${newCityInput.trim()}, India`,
        },
        user
      );

      setSavedDestinations((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      setNewCityInput("");
      toast.success(`Pinned ${created.name} to your saved destinations.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to pin destination.");
    } finally {
      setIsAddingDest(false);
    }
  };

  // Remove Saved Destination Pin
  const handleRemoveDestination = async (id: string) => {
    try {
      await mongoProfileService.removeDestination(id, user);
      setSavedDestinations((prev) => prev.filter((d) => d.id !== id));
      toast.success("Destination pin removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove pin.");
    }
  };

  // Upload Private Trip Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const uploaded = await mongoProfileService.uploadTripPhoto(
        "goa-adventure",
        file,
        photoCaption,
        user
      );
      setPhotos((prev) => [uploaded, ...prev]);
      setPhotoCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Private trip photo uploaded securely.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Delete Private Trip Photo
  const handleDeletePhoto = async (photoId: string) => {
    try {
      await mongoProfileService.deleteTripPhoto("goa-adventure", photoId, user);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Photo deleted from private storage.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete photo.");
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? (prev.length > 1 ? prev.filter((s) => s !== style) : prev) : [...prev, style]
    );
    setTravelStyle(style);
  };

  const avatarInitial = (name || user?.name || "T").trim().charAt(0).toUpperCase();

  return (
    <div className="page-stack profile-page">
      <PageIntro
        eyebrow={activeTab === "preferences" ? "Settings" : "Your profile"}
        title={activeTab === "preferences" ? "Make the travel desk" : "A few details,"}
        accent={activeTab === "preferences" ? "feel like home." : "a little more you."}
        description="Persistent traveller profile stored securely in your local MongoDB database."
        action={
          <span className="ticket-label">
            <UserRound size={14} /> {name}’s travel desk
          </span>
        }
      />

      <section className="profile-layout">
        {/* Navigation Sidebar */}
        <aside className="profile-nav ink-card">
          <button
            type="button"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            type="button"
            className={activeTab === "preferences" ? "active" : ""}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
          <button
            type="button"
            className={activeTab === "destinations" ? "active" : ""}
            onClick={() => setActiveTab("destinations")}
          >
            Saved destinations ({savedDestinations.length})
          </button>
          <button
            type="button"
            className={`danger ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            Privacy & Photos
          </button>
        </aside>

        {/* 1. Profile Tab */}
        {activeTab === "profile" && (
          <form className="profile-form ink-card" onSubmit={handleSaveProfile}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Profile</span>
                <h3>Your traveller card</h3>
              </div>
              <div className="profile-avatar">{avatarInitial}</div>
            </div>

            {isLoading ? (
              <div className="profile-loading-box">
                <Loader2 size={24} className="animate-spin text-coral" />
                <span>Loading profile from database...</span>
              </div>
            ) : (
              <>
                <div className="field-grid">
                  <label>
                    <span>Full name</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label className="wide-field">
                  <span>Travel bio</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other travelers what kinds of stories you like to plan..."
                  />
                </label>

                {/* Saved Destinations Summary Box */}
                <div className="saved-place-box">
                  <Heart size={19} />
                  <div>
                    <strong>Saved destinations</strong>
                    <p>
                      {savedDestinations.length
                        ? `${savedDestinations.length} places pinned to your MongoDB wish list.`
                        : "Your travel wish list is empty."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => setActiveTab("destinations")}
                  >
                    View pins <ArrowRight size={14} />
                  </button>
                </div>

                <div className="form-footer">
                  <button
                    className="coral-button"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving...
                      </>
                    ) : savedSuccess ? (
                      <>
                        <Check size={16} /> Saved to MongoDB
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* 2. Preferences Tab */}
        {activeTab === "preferences" && (
          <form className="profile-form ink-card" onSubmit={handleSavePreferences}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Preferences</span>
                <h3>The way you like to travel</h3>
              </div>
              <div className="profile-avatar">{avatarInitial}</div>
            </div>

            <div className="field-grid">
              <label>
                <span>Currency</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </label>
              <label>
                <span>Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </label>
            </div>

            <label className="wide-field">
              <span>Travel style</span>
              <div className="style-picker">
                {["Adventure", "Food", "Culture", "Slow travel", "Nature", "Budget"].map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={selectedStyles.includes(style) ? "active" : ""}
                    onClick={() => toggleStyle(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </label>

            <label className="wide-field">
              <span>Budget preference</span>
              <select
                value={budgetPreference}
                onChange={(e) => setBudgetPreference(e.target.value)}
              >
                <option value="Easy on the wallet">Easy on the wallet</option>
                <option value="Balanced">Balanced</option>
                <option value="A little luxe">A little luxe</option>
              </select>
            </label>

            <div className="form-footer">
              <button className="coral-button" type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check size={16} /> Preferences Saved
                  </>
                ) : (
                  "Save preferences"
                )}
              </button>
            </div>
          </form>
        )}

        {/* 3. Saved Destinations Tab */}
        {activeTab === "destinations" && (
          <div className="profile-form ink-card">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Wish list</span>
                <h3>Your saved destinations ({savedDestinations.length})</h3>
              </div>
              <Heart size={20} className="text-coral" />
            </div>

            {/* Quick Add Pin Input */}
            <div className="add-pin-row">
              <input
                type="text"
                placeholder="Pin a city to your MongoDB wish list (e.g. Goa, Jaipur, Surat)..."
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDestination();
                  }
                }}
              />
              <button
                type="button"
                className="coral-button btn-sm"
                onClick={handleAddDestination}
                disabled={isAddingDest || !newCityInput.trim()}
              >
                {isAddingDest ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Pin destination
              </button>
            </div>

            {savedDestinations.length === 0 ? (
              <div className="empty-dest-box">
                <MapPin size={32} className="text-coral" />
                <strong>No saved destinations yet.</strong>
                <p>Pin places you want to visit across your upcoming journeys.</p>
              </div>
            ) : (
              <div className="saved-dest-grid">
                {savedDestinations.map((dest) => (
                  <div key={dest.id} className="saved-dest-card">
                    <div className="dest-icon-badge">
                      <MapPin size={16} />
                    </div>
                    <div className="dest-text">
                      <strong>{dest.name || dest.city}</strong>
                      <small>{dest.state ? `${dest.state}, ${dest.country}` : dest.country}</small>
                    </div>
                    <button
                      type="button"
                      className="remove-pin-btn"
                      onClick={() => handleRemoveDestination(dest.id)}
                      title="Remove pin"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Privacy & Private Trip Photos Tab */}
        {activeTab === "privacy" && (
          <form className="profile-form ink-card" onSubmit={handleSavePrivacy}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Privacy & Security</span>
                <h3>Visibility & Private Trip Storage</h3>
              </div>
              <Shield size={20} className="text-teal" />
            </div>

            <div className="privacy-settings-group">
              <div className="privacy-item-row">
                <div>
                  <strong>Profile visibility</strong>
                  <p>Control whether other travellers can view your public stories.</p>
                </div>
                <div className="privacy-toggle-buttons">
                  <button
                    type="button"
                    className={profileVisibility === "public" ? "active" : ""}
                    onClick={() => setProfileVisibility("public")}
                  >
                    <Eye size={13} /> Public
                  </button>
                  <button
                    type="button"
                    className={profileVisibility === "private" ? "active" : ""}
                    onClick={() => setProfileVisibility("private")}
                  >
                    <Lock size={13} /> Private
                  </button>
                </div>
              </div>

              <div className="privacy-item-row">
                <div>
                  <strong>Trip visibility</strong>
                  <p>Keep your itineraries private by default until explicitly shared.</p>
                </div>
                <div className="privacy-toggle-buttons">
                  <button
                    type="button"
                    className={tripVisibility === "public" ? "active" : ""}
                    onClick={() => setTripVisibility("public")}
                  >
                    <Eye size={13} /> Public
                  </button>
                  <button
                    type="button"
                    className={tripVisibility === "private" ? "active" : ""}
                    onClick={() => setTripVisibility("private")}
                  >
                    <Lock size={13} /> Private
                  </button>
                </div>
              </div>
            </div>

            {/* Private Trip Photos Section with Real Trip-Wise Gallery */}
            <div className="private-photos-section">
              <TripPhotoGallery />
            </div>

            <div className="form-footer">
              <button className="coral-button" type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save privacy settings"
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
