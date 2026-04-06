import { useEffect, useRef } from "react";
import { Listing } from "@workspace/api-client-react";
import { formatUzs, trText } from "@/lib/utils";
import { useI18n, useT } from "@/lib/i18n";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TASHKENT_CENTER: [number, number] = [41.3275, 69.2700];
const DEFAULT_ZOOM = 12;

interface ListingMapProps {
  listings: Listing[];
  className?: string;
  height?: string;
}

export function ListingMap({ listings, className = "", height = "500px" }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { t, lang } = useI18n();
  const { tr } = useT();

  const mappable = listings.filter(l => l.latitude && l.longitude);

  useEffect(() => {
    if (!containerRef.current || mappable.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: TASHKENT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    const bounds = L.latLngBounds([]);

    mappable.forEach((listing) => {
      const tenantPrice = Math.round(listing.priceUzs * 1.05);
      const formatted = tenantPrice >= 1000000
        ? `${(tenantPrice / 1000000).toFixed(1)}M`
        : `${(tenantPrice / 1000).toFixed(0)}K`;

      const icon = L.divIcon({
        className: "kv-marker-wrapper",
        html: `<div class="kv-price-marker">${formatted} so'm</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const latlng: [number, number] = [listing.latitude!, listing.longitude!];
      bounds.extend(latlng);

      const photoHtml = listing.photos?.[0]
        ? `<img src="${listing.photos[0]}" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;" />`
        : "";

      const areaText = listing.area ? ` · ${listing.area} m²` : "";

      const popupContent = `
        <div style="font-family:system-ui,-apple-system,sans-serif;min-width:220px;max-width:260px;margin:-14px -20px -14px -20px;">
          ${photoHtml}
          <div style="padding:10px 14px 12px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;line-height:1.3;">${trText(listing.title, lang)}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:3px;">${listing.district}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:8px;">${listing.rooms} ${tr(t.detail.room)}${areaText}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:700;color:#2563eb;font-size:13px;">${formatUzs(tenantPrice)}${tr(t.common.perMonth)}</span>
              <a href="/listings/${listing.id}" style="background:#2563eb;color:#fff;padding:5px 14px;border-radius:6px;font-size:12px;text-decoration:none;font-weight:500;">${tr(t.map.view)}</a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker(latlng, { icon }).addTo(map);
      marker.bindPopup(popupContent, {
        maxWidth: 280,
        minWidth: 220,
        closeButton: true,
        className: "kv-popup",
      });

      marker.on("click", () => {
        document.querySelectorAll(".kv-price-marker").forEach(el => el.classList.remove("active"));
        const el = marker.getElement()?.querySelector(".kv-price-marker");
        if (el) el.classList.add("active");
      });

      marker.on("popupclose", () => {
        const el = marker.getElement()?.querySelector(".kv-price-marker");
        if (el) el.classList.remove("active");
      });
    });

    if (mappable.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (mappable.length === 1) {
      map.setView([mappable[0].latitude!, mappable[0].longitude!], 15);
    }

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mappable.length, lang]);

  if (mappable.length === 0) return null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-border shadow-sm relative ${className}`} style={{ height }}>
      <style>{`
        .kv-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .kv-price-marker {
          background: #ffffff;
          color: #1e293b;
          border: 2px solid #cbd5e1;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: system-ui, -apple-system, sans-serif;
          transform: translate(-50%, -100%);
          position: relative;
        }
        .kv-price-marker::after {
          content: "";
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #cbd5e1;
        }
        .kv-price-marker:hover,
        .kv-price-marker.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          transform: translate(-50%, -100%) scale(1.05);
          z-index: 1000 !important;
        }
        .kv-price-marker:hover::after,
        .kv-price-marker.active::after {
          border-top-color: #2563eb;
        }
        .kv-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .kv-popup .leaflet-popup-content {
          margin: 14px 20px;
        }
        .kv-popup .leaflet-popup-tip {
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
