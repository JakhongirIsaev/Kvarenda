import { useEffect, useRef, useState } from "react";
import { Listing } from "@workspace/api-client-react";
import { formatUzs, trText } from "@/lib/utils";
import { useI18n, useT } from "@/lib/i18n";

const TASHKENT_CENTER = [69.2700, 41.3275];
const DEFAULT_ZOOM = 12;

let mapglPromise: Promise<any> | null = null;

function loadMapGL(): Promise<any> {
  if (mapglPromise) return mapglPromise;

  mapglPromise = new Promise((resolve, reject) => {
    if ((window as any).mapgl) {
      resolve((window as any).mapgl);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://mapgl.2gis.com/api/js/v1";
    script.async = true;
    script.onload = () => {
      const mg = (window as any).mapgl;
      if (mg) resolve(mg);
      else reject(new Error("mapgl not found"));
    };
    script.onerror = () => {
      mapglPromise = null;
      reject(new Error("Failed to load 2GIS MapGL"));
    };
    document.head.appendChild(script);
  });

  return mapglPromise;
}

interface ListingMapProps {
  listings: Listing[];
  className?: string;
  height?: string;
}

export function ListingMap({ listings, className = "", height = "500px" }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [error, setError] = useState(false);
  const [popupListing, setPopupListing] = useState<Listing | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const { t, lang } = useI18n();
  const { tr } = useT();

  const mappable = listings.filter(l => l.latitude && l.longitude);

  useEffect(() => {
    if (!containerRef.current || mappable.length === 0) return;

    let destroyed = false;

    const init = async () => {
      try {
        const mapgl = await loadMapGL();
        if (destroyed || !containerRef.current) return;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
        markersRef.current.forEach(m => m.destroy());
        markersRef.current = [];

        const map = new mapgl.Map(containerRef.current, {
          center: TASHKENT_CENTER,
          zoom: DEFAULT_ZOOM,
          key: "bfd8bbca-8abf-11ea-b033-5fa57aae2de7",
        });

        const newMarkers: any[] = [];

        mappable.forEach((listing) => {
          const tenantPrice = Math.round(listing.priceUzs * 1.05);
          const formatted = tenantPrice >= 1000000
            ? `${(tenantPrice / 1000000).toFixed(1)}M`
            : `${(tenantPrice / 1000).toFixed(0)}K`;

          const marker = new mapgl.HtmlMarker(map, {
            coordinates: [listing.longitude!, listing.latitude!],
            html: `<div class="dgis-price-marker" data-listing-id="${listing.id}">${formatted} so'm</div>`,
            anchor: [0, 0],
          });

          marker.on("click", () => {
            setPopupListing(listing);
            document.querySelectorAll(".dgis-price-marker").forEach(m => {
              (m as HTMLElement).classList.remove("active");
            });
            const el = document.querySelector(`[data-listing-id="${listing.id}"]`);
            if (el) (el as HTMLElement).classList.add("active");

            const rect = containerRef.current?.getBoundingClientRect();
            if (rect && el) {
              const markerRect = el.getBoundingClientRect();
              setPopupPos({
                x: markerRect.left - rect.left + markerRect.width / 2,
                y: markerRect.top - rect.top - 8,
              });
            }
          });

          newMarkers.push(marker);
        });

        markersRef.current = newMarkers;

        if (mappable.length > 1) {
          const lngs = mappable.map(l => l.longitude!);
          const lats = mappable.map(l => l.latitude!);
          const padding = 0.015;
          map.fitBounds({
            southWest: [Math.min(...lngs) - padding, Math.min(...lats) - padding],
            northEast: [Math.max(...lngs) + padding, Math.max(...lats) + padding],
          });
        } else if (mappable.length === 1) {
          map.setCenter([mappable[0].longitude!, mappable[0].latitude!]);
          map.setZoom(15);
        }

        map.on("click", () => {
          setPopupListing(null);
          setPopupPos(null);
          document.querySelectorAll(".dgis-price-marker").forEach(m => {
            (m as HTMLElement).classList.remove("active");
          });
        });

        mapRef.current = map;
      } catch (err) {
        console.error("2GIS map init error:", err);
        setError(true);
      }
    };

    init();

    return () => {
      destroyed = true;
      markersRef.current.forEach(m => { try { m.destroy(); } catch {} });
      markersRef.current = [];
      if (mapRef.current) {
        try { mapRef.current.destroy(); } catch {}
        mapRef.current = null;
      }
    };
  }, [mappable.length, lang]);

  if (mappable.length === 0) return null;

  if (error) {
    return (
      <div className={`rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col items-center justify-center bg-muted/30 gap-3 ${className}`} style={{ height }}>
        <div className="text-4xl">🗺️</div>
        <p className="text-muted-foreground text-sm font-medium">{tr(t.map.title)}</p>
        <p className="text-muted-foreground text-xs">{mappable.length} {tr(t.map.listingsOnMap)}</p>
      </div>
    );
  }

  const tenantPrice = popupListing ? Math.round(popupListing.priceUzs * 1.05) : 0;

  return (
    <div className={`rounded-2xl overflow-hidden border border-border shadow-sm relative ${className}`} style={{ height }}>
      <style>{`
        .dgis-price-marker {
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
          transition: all 0.2s;
          font-family: system-ui, -apple-system, sans-serif;
          transform: translate(-50%, -100%);
          position: relative;
        }
        .dgis-price-marker::after {
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
        .dgis-price-marker:hover, .dgis-price-marker.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }
        .dgis-price-marker:hover::after, .dgis-price-marker.active::after {
          border-top-color: #2563eb;
        }
      `}</style>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {popupListing && popupPos && (
        <div
          className="absolute z-[1000] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: popupPos.x,
            top: popupPos.y,
            transform: "translate(-50%, -100%)",
            width: 260,
          }}
        >
          {popupListing.photos?.[0] && (
            <img
              src={popupListing.photos[0]}
              alt={trText(popupListing.title, lang)}
              className="w-full h-28 object-cover"
            />
          )}
          <div className="p-3">
            <p className="font-semibold text-sm mb-1">{trText(popupListing.title, lang)}</p>
            <p className="text-xs text-muted-foreground mb-1">{popupListing.district}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <span>{popupListing.rooms} {tr(t.detail.room)}</span>
              {popupListing.area && <span>{popupListing.area} m²</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary text-sm">{formatUzs(tenantPrice)}{tr(t.common.perMonth)}</span>
              <a
                href={`/listings/${popupListing.id}`}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                {tr(t.map.view)}
              </a>
            </div>
          </div>
          <button
            className="absolute top-1 right-1 bg-black/40 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/60 transition-colors"
            onClick={(e) => { e.stopPropagation(); setPopupListing(null); setPopupPos(null); }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
