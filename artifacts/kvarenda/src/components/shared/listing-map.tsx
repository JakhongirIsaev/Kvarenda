import { useEffect, useRef, useState } from "react";
import { Listing } from "@workspace/api-client-react";
import { formatUzs, trText } from "@/lib/utils";
import { useI18n, useT } from "@/lib/i18n";

const TASHKENT_CENTER = [41.3275, 69.2700];
const DEFAULT_ZOOM = 12;

let ymapsPromise: Promise<any> | null = null;

function loadYmaps(): Promise<any> {
  if (ymapsPromise) return ymapsPromise;

  ymapsPromise = new Promise((resolve, reject) => {
    if ((window as any).ymaps) {
      (window as any).ymaps.ready(() => resolve((window as any).ymaps));
      return;
    }

    const existing = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existing) {
      const check = () => {
        if ((window as any).ymaps) {
          (window as any).ymaps.ready(() => resolve((window as any).ymaps));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.async = true;
    script.onload = () => {
      const ym = (window as any).ymaps;
      if (ym) ym.ready(() => resolve(ym));
      else reject(new Error("ymaps not found"));
    };
    script.onerror = () => {
      ymapsPromise = null;
      reject(new Error("Failed to load Yandex Maps"));
    };
    document.head.appendChild(script);
  });

  return ymapsPromise;
}

interface ListingMapProps {
  listings: Listing[];
  className?: string;
  height?: string;
}

export function ListingMap({ listings, className = "", height = "500px" }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [error, setError] = useState(false);
  const { t, lang } = useI18n();
  const { tr } = useT();

  const mappable = listings.filter(l => l.latitude && l.longitude);

  useEffect(() => {
    if (!containerRef.current || mappable.length === 0) return;

    let destroyed = false;

    const init = async () => {
      try {
        const ymaps = await loadYmaps();
        if (destroyed || !containerRef.current) return;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        const map = new ymaps.Map(containerRef.current, {
          center: TASHKENT_CENTER,
          zoom: DEFAULT_ZOOM,
          controls: ["zoomControl", "geolocationControl"],
        }, {
          suppressMapOpenBlock: true,
        });

        mappable.forEach((listing) => {
          const tenantPrice = Math.round(listing.priceUzs * 1.05);
          const formatted = tenantPrice >= 1000000
            ? `${(tenantPrice / 1000000).toFixed(1)}M`
            : `${(tenantPrice / 1000).toFixed(0)}K`;

          const photoHtml = listing.photos?.[0]
            ? `<img src="${listing.photos[0]}" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;margin:-8px -8px 8px -8px;width:calc(100% + 16px);" />`
            : "";

          const areaText = listing.area ? ` · ${listing.area} m²` : "";

          const balloonContent = `
            <div style="font-family:system-ui,sans-serif;min-width:200px;">
              ${photoHtml}
              <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${trText(listing.title, lang)}</div>
              <div style="font-size:12px;color:#64748b;margin-bottom:4px;">${listing.district}</div>
              <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${listing.rooms} ${tr(t.detail.room)}${areaText}</div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-weight:700;color:#2563eb;font-size:13px;">${formatUzs(tenantPrice)}${tr(t.common.perMonth)}</span>
                <a href="/listings/${listing.id}" style="background:#2563eb;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;text-decoration:none;">${tr(t.map.view)}</a>
              </div>
            </div>
          `;

          const placemark = new ymaps.Placemark(
            [listing.latitude!, listing.longitude!],
            {
              balloonContentBody: balloonContent,
            },
            {
              iconLayout: "default#imageWithContent",
              iconImageHref: "",
              iconImageSize: [0, 0],
              iconContentOffset: [0, 0],
              iconContentLayout: ymaps.templateLayoutFactory.createClass(
                `<div class="ymap-price-marker">${formatted} so'm</div>`
              ),
              balloonPanelMaxMapArea: 0,
            }
          );

          map.geoObjects.add(placemark);
        });

        if (mappable.length > 1) {
          map.setBounds(map.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 40,
          });
        } else if (mappable.length === 1) {
          map.setCenter([mappable[0].latitude!, mappable[0].longitude!], 15);
        }

        mapRef.current = map;
      } catch (err) {
        console.error("Yandex Maps init error:", err);
        setError(true);
      }
    };

    init();

    return () => {
      destroyed = true;
      if (mapRef.current) {
        try { mapRef.current.destroy(); } catch {}
        mapRef.current = null;
      }
    };
  }, [mappable.length, lang]);

  if (mappable.length === 0) return null;

  if (error) {
    return (
      <div className={`rounded-2xl overflow-hidden border border-border shadow-sm flex items-center justify-center bg-muted/50 ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm">Map could not be loaded</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-border shadow-sm relative ${className}`} style={{ height }}>
      <style>{`
        .ymap-price-marker {
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
          font-family: system-ui, sans-serif;
        }
        .ymap-price-marker:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }
        [class*="ymaps-2"][class*="ground-pane"] {
          filter: saturate(0.8);
        }
      `}</style>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
