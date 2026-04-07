import { useEffect, useRef } from "react";
import { Listing } from "@workspace/api-client-react";
import { formatUzs, trText } from "@/lib/utils";
import { useI18n, useT } from "@/lib/i18n";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TASHKENT_CENTER: [number, number] = [41.3111, 69.2797];
const DEFAULT_ZOOM = 12;

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OSM</a>';

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
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "topleft" }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution(TILE_ATTRIBUTION)
      .addTo(map);

    L.tileLayer(TILE_URL, {
      maxZoom: 19,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    mappable.forEach((listing) => {
      const tenantPrice = Math.round(listing.priceUzs * 1.05);
      const formatted = tenantPrice >= 1000000
        ? `${(tenantPrice / 1000000).toFixed(1)}M`
        : `${(tenantPrice / 1000).toFixed(0)}K`;

      const icon = L.divIcon({
        className: "kv-marker-wrapper",
        html: `<div class="kv-price-marker">${formatted} so'm</div>`,
        iconSize: [120, 40],
        iconAnchor: [60, 40],
      });

      const latlng: [number, number] = [listing.latitude!, listing.longitude!];
      bounds.extend(latlng);

      const photoHtml = listing.photos?.[0]
        ? `<img src="${listing.photos[0]}" style="width:100%;height:110px;object-fit:cover;border-radius:12px 12px 0 0;" />`
        : "";

      const areaText = listing.area ? ` · ${listing.area} m²` : "";

      const popupContent = `
        <div class="kv-popup-inner">
          ${photoHtml}
          <div class="kv-popup-body">
            <div class="kv-popup-title">${trText(listing.title, lang)}</div>
            <div class="kv-popup-district">${listing.district}</div>
            <div class="kv-popup-meta">${listing.rooms} ${tr(t.detail.room)}${areaText}</div>
            <div class="kv-popup-footer">
              <span class="kv-popup-price">${formatUzs(tenantPrice)}${tr(t.common.perMonth)}</span>
              <a href="/listings/${listing.id}" class="kv-popup-btn">${tr(t.map.view)}</a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker(latlng, { icon }).addTo(map);
      marker.bindPopup(popupContent, {
        maxWidth: 280,
        minWidth: 230,
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
      map.fitBounds(bounds, { padding: [50, 50] });
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
          background: #2563eb;
          color: #ffffff;
          border: 2px solid #1d4ed8;
          border-radius: 24px;
          padding: 7px 16px;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(37,99,235,0.4);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: system-ui, -apple-system, sans-serif;
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          letter-spacing: 0.01em;
        }
        .kv-price-marker::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid #1d4ed8;
        }
        .kv-price-marker:hover,
        .kv-price-marker.active {
          background: #1e40af;
          border-color: #1e3a8a;
          transform: translateX(-50%) scale(1.12);
          z-index: 1000 !important;
          box-shadow: 0 6px 20px rgba(30,64,175,0.5);
        }
        .kv-price-marker:hover::after,
        .kv-price-marker.active::after {
          border-top-color: #1e3a8a;
        }
        .kv-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.18);
        }
        .kv-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .kv-popup .leaflet-popup-tip {
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .kv-popup .leaflet-popup-close-button {
          font-size: 18px;
          padding: 4px 8px;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          z-index: 1;
          width: 24px !important;
          height: 24px !important;
          top: 4px !important;
          right: 4px !important;
        }
        .kv-popup-inner {
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 220px;
        }
        .kv-popup-body {
          padding: 10px 14px 12px;
        }
        .kv-popup-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 3px;
          line-height: 1.3;
          color: #1e293b;
        }
        .kv-popup-district {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .kv-popup-meta {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }
        .kv-popup-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .kv-popup-price {
          font-weight: 700;
          color: #2563eb;
          font-size: 13px;
        }
        .kv-popup-btn {
          background: #2563eb;
          color: #fff;
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 12px;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.15s;
        }
        .kv-popup-btn:hover {
          background: #1d4ed8;
        }
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
