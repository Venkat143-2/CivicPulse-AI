import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../../types';
import { MapPin, Navigation } from 'lucide-react';

interface LeafletMapProps {
  mode?: 'picker' | 'single' | 'multi';
  latitude?: number;
  longitude?: number;
  complaints?: Complaint[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onComplaintSelect?: (complaint: Complaint) => void;
  className?: string;
  zoom?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  mode = 'picker',
  latitude,
  longitude,
  complaints = [],
  onLocationSelect,
  onComplaintSelect,
  className = 'h-72 w-full rounded-xl',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Default coordinates (Bengaluru urban municipal zone)
  const defaultLat = latitude || 12.9716;
  const defaultLng = longitude || 77.5946;

  // Custom icon factory
  const createPinIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#E11D48'; // Rose/Red
      case 'high':
        return '#EA580C'; // Orange
      case 'medium':
        return '#0D9488'; // Teal
      case 'low':
      default:
        return '#3B82F6'; // Blue
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);

      if (mode === 'picker') {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelect) {
            onLocationSelect(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync marker for picker or single view
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mode === 'picker' || mode === 'single') {
      if (latitude && longitude) {
        if (!markerRef.current) {
          const pin = L.marker([latitude, longitude], {
            icon: createPinIcon('#0D9488'),
            draggable: mode === 'picker',
          }).addTo(map);

          if (mode === 'picker') {
            pin.on('dragend', () => {
              const pos = pin.getLatLng();
              if (onLocationSelect) {
                onLocationSelect(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
              }
            });
          }

          markerRef.current = pin;
        } else {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        map.setView([latitude, longitude], map.getZoom());
      }
    }
  }, [latitude, longitude, mode, onLocationSelect]);

  // Sync markers for multi view (Admin complaints map)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group || mode !== 'multi') return;

    group.clearLayers();

    const bounds: [number, number][] = [];

    complaints.forEach((c) => {
      if (c.latitude && c.longitude) {
        const color = getPriorityColor(c.priority);
        const marker = L.marker([c.latitude, c.longitude], {
          icon: createPinIcon(color),
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px; padding: 2px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">${c.referenceCode}</div>
            <div style="font-size: 13px; font-weight: 600; color: #0F172A; margin: 4px 0 6px;">${c.title}</div>
            <div style="display: flex; gap: 6px; font-size: 11px; margin-bottom: 6px;">
              <span style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px; text-transform: capitalize;">${c.category.replace('_', ' ')}</span>
              <span style="background: ${color}20; color: ${color}; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${c.priority}</span>
            </div>
            <div style="font-size: 11px; color: #475569;">${c.address}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onComplaintSelect) onComplaintSelect(c);
        });

        marker.addTo(group);
        bounds.push([c.latitude, c.longitude]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [complaints, mode, onComplaintSelect]);

  const handleUseCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
      },
      (err) => {
        console.warn('Geolocation failed or denied:', err);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full">
      <div ref={mapContainerRef} className={`${className} z-0 shadow-inner border border-slate-200 overflow-hidden`} />

      {mode === 'picker' && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-md border border-slate-200 backdrop-blur-sm transition-all hover:scale-102"
            title="Locate via GPS"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span>My GPS Location</span>
          </button>
        </div>
      )}

      {mode === 'picker' && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow">
          <MapPin className="w-3 h-3 text-teal-400" />
          <span>Click anywhere to drop or move location pin</span>
        </div>
      )}
    </div>
  );
};
