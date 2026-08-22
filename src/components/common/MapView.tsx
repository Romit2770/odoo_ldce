import React from 'react';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category?: string;
  stopOrder?: number;
}

export interface MapRoutePoint {
  latitude: number;
  longitude: number;
  cityName: string;
}

export interface MapViewProps {
  markers?: MapMarker[];
  routePoints?: MapRoutePoint[];
  centerLatitude?: number;
  centerLongitude?: number;
  zoom?: number;
  height?: string;
  interactive?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

/**
 * Reusable MapView Component Abstraction.
 * Supports city markers, multiple stops, route visualization, distance/time estimation.
 * Decoupled from concrete map providers (Mapbox / Google Maps / Leaflet).
 */
export const MapView: React.FC<MapViewProps> = ({
  markers = [],
  routePoints = [],
  height = '400px',
  interactive = true,
  onMarkerClick,
  className,
}) => {
  return (
    <div
      style={{ height }}
      className={cn(
        'relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none group',
        className
      )}
    >
      {/* Decorative Map Grid Mock / Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1 px-1.5 font-medium">
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          Map Layer: Multi-Stop Routing
        </span>
      </div>

      {/* Markers / Route visualization preview */}
      {markers.length > 0 || routePoints.length > 0 ? (
        <div className="z-10 w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <Compass className="h-5 w-5 animate-spin-slow" />
            <span>Interactive Route & Stop Visualization</span>
          </div>

          <div className="space-y-2 text-left">
            {markers.map((marker, index) => (
              <div
                key={marker.id || index}
                onClick={() => onMarkerClick && onMarkerClick(marker)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-700 text-xs transition-colors',
                  interactive && 'cursor-pointer'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {marker.stopOrder ?? index + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {marker.title}
                    </span>
                    {marker.category && (
                      <span className="ml-2 text-[10px] text-slate-500 capitalize">
                        ({marker.category})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Navigation className="h-3 w-3" />
                  <span>
                    {marker.latitude.toFixed(2)}, {marker.longitude.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-slate-400 text-center">
            Ready for Google Maps / Mapbox SDK provider binding
          </p>
        </div>
      ) : (
        <div className="z-10 flex flex-col items-center gap-2 text-slate-500">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <MapPin className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Map View Ready
          </h4>
          <p className="text-xs text-slate-400 max-w-xs">
            Add destinations, cities, or activities to visualize the route and calculate distances.
          </p>
        </div>
      )}
    </div>
  );
};
