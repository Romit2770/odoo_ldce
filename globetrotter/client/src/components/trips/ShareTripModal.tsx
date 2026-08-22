/**
 * ShareTripModal — Generate and Manage 6-character Share Codes for Trips
 */

import React, { useState, useEffect } from "react";
import {
  Check,
  Copy,
  Globe,
  Link as LinkIcon,
  Loader2,
  Lock,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mongoTripService } from "@/services/api/mongoTripService";
import type { Trip } from "@/domain/trip";

type ShareTripModalProps = {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
};

export function ShareTripModal({ trip, isOpen, onClose }: ShareTripModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [shareCode, setShareCode] = useState<string>((trip as any).sharing?.shareCode || "");
  const [isSharingEnabled, setIsSharingEnabled] = useState<boolean>(
    (trip as any).sharing?.enabled ?? false
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen && !shareCode && !isSharingEnabled) {
      handleEnableShare();
    }
  }, [isOpen]);

  const handleEnableShare = async () => {
    setIsLoading(true);
    try {
      const res = await mongoTripService.enableShare(trip.id, user);
      setShareCode(res.shareCode);
      setIsSharingEnabled(true);
      toast.success("Trip share code generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate share code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableShare = async () => {
    setIsLoading(true);
    try {
      await mongoTripService.disableShare(trip.id, user);
      setIsSharingEnabled(false);
      toast.info("Trip sharing has been disabled. The previous code will no longer grant access.");
    } catch (err: any) {
      toast.error(err.message || "Failed to disable sharing.");
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/share/${shareCode}`;

  const copyToClipboard = (text: string, isLink = false) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Share link copied to clipboard!");
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success(`Share code ${text} copied!`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="demo-dialog-backdrop" role="presentation">
      <div className="demo-dialog share-trip-dialog" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="demo-dialog-icon">
          <Share2 size={20} />
        </div>

        <h2>Share this journey</h2>
        <p>
          Give friends read-only access to <strong>{trip.name}</strong> without exposing your
          personal account or private photos.
        </p>

        {isLoading ? (
          <div className="share-loading-box">
            <Loader2 size={24} className="animate-spin text-coral" />
            <span>Updating share settings...</span>
          </div>
        ) : isSharingEnabled && shareCode ? (
          <div className="share-code-active-panel">
            <div className="share-code-display">
              <span className="code-label">TRIP SHARE CODE</span>
              <div className="code-badge">
                <strong>{shareCode}</strong>
                <button
                  type="button"
                  className="coral-button btn-sm"
                  onClick={() => copyToClipboard(shareCode, false)}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode ? "Copied" : "Copy code"}
                </button>
              </div>
              <small>Anyone with this code can view this trip on the public Share page.</small>
            </div>

            <div className="share-link-row">
              <span className="link-text">{shareUrl}</span>
              <button
                type="button"
                className="outlined-action btn-sm"
                onClick={() => copyToClipboard(shareUrl, true)}
              >
                {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                {copiedLink ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="share-actions-row">
              <button
                type="button"
                className="text-danger-link"
                onClick={handleDisableShare}
              >
                <Lock size={13} /> Disable sharing
              </button>
              <button type="button" className="coral-button" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="share-disabled-panel">
            <p>Sharing is currently disabled for this trip.</p>
            <button
              type="button"
              className="coral-button"
              onClick={handleEnableShare}
            >
              <Globe size={15} /> Enable trip sharing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
