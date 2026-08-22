import type { DestinationPhotoStory } from "@/domain/destinationPhotoStories";
import { ArrowRight, Camera, MapPin, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

type DestinationPhotoGalleryProps = {
  story: DestinationPhotoStory;
  onAddExperiences: () => void;
};

export function DestinationPhotoGallery({ story, onAddExperiences }: DestinationPhotoGalleryProps) {
  const [, setLocation] = useLocation();

  const getSlug = (photoId: string) => {
    switch (photoId) {
      case "baga":
        return "baga-beach";
      case "palolem":
        return "palolem-beach";
      case "aguada":
        return "fort-aguada";
      case "coast":
        return "coastal-lookout";
      case "palms":
        return "palm-cove";
      default:
        return photoId;
    }
  };

  return (
    <section className="photo-story-section" aria-labelledby="goa-beyond-title">
      <div className="photo-story-heading">
        <div>
          <span className="eyebrow"><Camera size={13} /> From the atlas to the real world</span>
          <h2 id="goa-beyond-title">{story.name} beyond <em>the postcard.</em></h2>
          <p>See the places waiting for you beyond the atlas, then tap any destination to view its complete travel guide & details.</p>
        </div>
        <span className="photo-story-stamp"><MapPin size={15} /> {story.gallery.length} real places</span>
      </div>
      <div className="goa-photo-editorial-grid">
        {story.gallery.map((photo, index) => {
          const slug = getSlug(photo.id);
          return (
            <article
              className={`destination-photo-card ${photo.size} clickable-destination-card`}
              key={photo.id}
              onClick={() => setLocation(`/places/${slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLocation(`/places/${slug}`);
                }
              }}
              style={{ "--card-index": index, cursor: "pointer" } as React.CSSProperties}
            >
              <img src={photo.src} alt={photo.alt} loading={index === 0 ? "eager" : "lazy"} />
              <span className="photo-card-shade" aria-hidden="true" />
              <div className="photo-card-copy">
                <span>{photo.category}</span>
                <h3>{photo.title}</h3>
                <small>View place guide <ArrowRight size={12} /></small>
              </div>
            </article>
          );
        })}
      </div>
      <div className="photo-story-cta">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> Make it personal</span>
          <h3>Found a place you love?</h3>
          <p>Browse Goa experiences and place a real-world moment into your plan.</p>
        </div>
        <button className="coral-button" onClick={onAddExperiences}>
          Add Goa experiences to my trip <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
