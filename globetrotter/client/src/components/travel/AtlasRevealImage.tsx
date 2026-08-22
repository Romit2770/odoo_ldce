import { useState, useRef, useCallback } from "react";
import { Camera, Sparkles } from "lucide-react";

export type AtlasRevealImageProps = {
  destinationName: string;
  illustrationSrc: string;
  realImageSrc: string;
  alt?: string;
  caption?: string;
};

export function AtlasRevealImage({
  destinationName,
  illustrationSrc,
  realImageSrc,
  alt = "Destination illustration",
  caption,
}: AtlasRevealImageProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    containerRef.current.style.setProperty("--atlas-x", `${x.toFixed(1)}px`);
    containerRef.current.style.setProperty("--atlas-y", `${y.toFixed(1)}px`);
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (!imageError) {
      setIsRevealed(true);
    }
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsRevealed(false);
      if (containerRef.current) {
        containerRef.current.style.setProperty("--atlas-x", "0px");
        containerRef.current.style.setProperty("--atlas-y", "0px");
      }
    }, 120);
  };

  const handleToggle = () => {
    if (!imageError) {
      setIsRevealed((prev) => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`atlas-reveal ${isRevealed ? "is-revealed" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={isRevealed}
      aria-label={`Reveal real-world photography for ${destinationName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleToggle}
      onFocus={() => !imageError && setIsRevealed(true)}
      onBlur={() => setIsRevealed(false)}
      onKeyDown={handleKeyDown}
    >
      {!imageError && (
        <img
          className="atlas-reveal-real"
          src={realImageSrc}
          alt={`Real photograph of ${destinationName}`}
          loading="eager"
          onError={() => setImageError(true)}
        />
      )}
      <img
        className="atlas-reveal-illustration"
        src={illustrationSrc}
        alt={alt}
        loading="eager"
      />
      <span className="atlas-paper-grain" aria-hidden="true" />
      <span className="atlas-reveal-orbit" aria-hidden="true" />
      <span className="atlas-reveal-hint">
        <Sparkles size={11} /> {isRevealed ? "Release to return" : "Hover or tap to reveal"}
      </span>
      <span className="atlas-real-stamp">
        <Camera size={11} /> {caption || `${destinationName} — in real life`}
      </span>
    </div>
  );
}
