import React from "react";
import { useRoute } from "wouter";
import { PlaceDetailView } from "@/components/places/PlaceDetailView";

export function PlaceDetailPage() {
  const [, params] = useRoute("/places/:slug");
  const slug = params?.slug || "baga-beach";

  return <PlaceDetailView slug={slug} />;
}
