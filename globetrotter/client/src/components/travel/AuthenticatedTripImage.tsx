/**
 * AuthenticatedTripImage — Secure Authenticated Image Loader
 * Loads private trip photos securely using headers/blobs without exposing raw paths or producing blank boxes.
 */

import React, { useState, useEffect } from "react";
import { AlertCircle, ImageOff, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mongoProfileService } from "@/services/api/mongoProfileService";

type AuthenticatedTripImageProps = {
  src: string;
  alt?: string;
  className?: string;
  fallbackName?: string;
  onClick?: () => void;
};

export function AuthenticatedTripImage({
  src,
  alt = "Private trip photo",
  className = "",
  fallbackName,
  onClick,
}: AuthenticatedTripImageProps) {
  const { user } = useAuth();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let createdUrl: string | null = null;

    setIsLoading(true);
    setHasError(false);
    setErrorDetails(null);

    const loadImage = async () => {
      try {
        const url = await mongoProfileService.fetchPhotoBlobUrl(src, user);
        if (isMounted) {
          createdUrl = url;
          setObjectUrl(url);
          setIsLoading(false);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn(`[AuthenticatedTripImage] Failed to load ${src}:`, err.message);
          setHasError(true);
          setErrorDetails(err.message);
          setIsLoading(false);
        }
      }
    };

    if (src) {
      loadImage();
    } else {
      setIsLoading(false);
      setHasError(true);
    }

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src, user?.id, user?.email]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setHasError(false);
    mongoProfileService
      .fetchPhotoBlobUrl(src, user)
      .then((url) => {
        setObjectUrl(url);
        setIsLoading(false);
      })
      .catch((err) => {
        setHasError(true);
        setErrorDetails(err.message);
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className={`auth-image-skeleton ${className}`} aria-label="Loading image...">
        <Loader2 size={20} className="animate-spin text-coral" />
        <span>Loading photo...</span>
      </div>
    );
  }

  if (hasError || !objectUrl) {
    return (
      <div className={`auth-image-fallback ${className}`} onClick={onClick}>
        <ImageOff size={22} className="text-gray-400" />
        <span className="fallback-text">{fallbackName || "Image unavailable"}</span>
        <button type="button" className="retry-image-btn" onClick={handleRetry} title="Retry loading">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={`auth-loaded-image ${className}`}
      onClick={onClick}
      loading="lazy"
    />
  );
}
