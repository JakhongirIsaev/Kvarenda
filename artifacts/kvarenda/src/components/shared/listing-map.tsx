import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Listing } from "@workspace/api-client-react";
import { formatUzs, trText } from "@/lib/utils";
import { Link } from "wouter";
import { MapPin, Bed, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, useT } from "@/lib/i18n";

const TASHKENT_CENTER: [number, number] = [41.3275, 69.2700];
const DEFAULT_ZOOM = 12;

const createPriceIcon = (price: number, isActive: boolean) => {
  const tenantPrice = Math.round(price * 1.05);
  const formatted = tenantPrice >= 1000000
    ? `${(tenantPrice / 1000000).toFixed(1)}M`
    : `${(tenantPrice / 1000).toFixed(0)}K`;

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: ${isActive ? "#2563eb" : "#ffffff"};
      color: ${isActive ? "#ffffff" : "#1e293b"};
      border: 2px solid ${isActive ? "#2563eb" : "#cbd5e1"};
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: all 0.2s;
    ">${formatted} so'm</div>`,
    iconSize: [0, 0],
    iconAnchor: [40, 20],
    popupAnchor: [0, -20],
  });
};

interface ListingMapProps {
  listings: Listing[];
  className?: string;
  height?: string;
}

function MapBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    const points = listings
      .filter(l => l.latitude && l.longitude)
      .map(l => [l.latitude!, l.longitude!] as [number, number]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [listings, map]);

  return null;
}

export function ListingMap({ listings, className = "", height = "500px" }: ListingMapProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { t, lang } = useI18n();
  const { tr } = useT();

  const mappable = listings.filter(l => l.latitude && l.longitude);

  if (mappable.length === 0) return null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-border shadow-sm ${className}`} style={{ height }}>
      <MapContainer
        center={TASHKENT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds listings={mappable} />

        {mappable.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude!, listing.longitude!]}
            icon={createPriceIcon(listing.priceUzs, activeId === listing.id)}
            eventHandlers={{
              click: () => setActiveId(listing.id),
            }}
          >
            <Popup maxWidth={280} minWidth={240}>
              <div className="p-0 -m-[13px] -mx-[20px]">
                {listing.photos?.[0] && (
                  <img
                    src={listing.photos[0]}
                    alt={trText(listing.title, lang)}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm text-foreground mb-1">{trText(listing.title, lang)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {listing.district}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {listing.rooms}
                    </span>
                    {listing.area && (
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3 h-3" />
                        {listing.area} m²
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">{formatUzs(Math.round(listing.priceUzs * 1.05))}{tr(t.common.perMonth)}</span>
                    <Link href={`/listings/${listing.id}`}>
                      <Button size="sm" className="h-7 text-xs">{tr(t.map.view)}</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
