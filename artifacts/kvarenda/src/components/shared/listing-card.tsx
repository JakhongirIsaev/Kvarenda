import { Link } from "wouter";
import { formatUzs } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Bed, Maximize } from "lucide-react";
import { Listing } from "@workspace/api-client-react";
import { VerifiedOwnerBadge, ProtectedRentBadge, TourBadge, InsuranceBadge } from "./trust-badges";
import { useI18n, useT } from "@/lib/i18n";

export function ListingCard({ listing }: { listing: Listing }) {
  const { t } = useI18n();
  const { tr } = useT();

  const mockImages = ["/images/apt1.png", "/images/apt2.png", "/images/apt3.png"];
  const photoUrl = listing.photos && listing.photos.length > 0 ? listing.photos[0] : mockImages[listing.id % mockImages.length];

  const tenantPrice = Math.round(listing.priceUzs * 1.05);

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={photoUrl} 
            alt={listing.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {listing.ownerVerified && <VerifiedOwnerBadge />}
            {listing.hasInsurance && <InsuranceBadge />}
            {listing.has3dTour && <TourBadge />}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <h3 className="text-white font-semibold text-lg line-clamp-1">{formatUzs(tenantPrice)} <span className="text-white/80 text-sm font-normal">{tr(t.common.perMonth)}</span></h3>
          </div>
        </div>
        <CardContent className="p-4 flex-grow">
          <h4 className="font-medium text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">{listing.title}</h4>
          <div className="flex items-center text-muted-foreground text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{listing.district}, {listing.address}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {listing.rooms} {listing.rooms === 1 ? tr(t.card.room) : tr(t.card.rooms)}
            </div>
            {listing.area && (
              <div className="flex items-center">
                <Maximize className="w-4 h-4 mr-1" />
                {listing.area} m²
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground border-t border-border/10 mt-auto">
          {tr(t.card.listedBy)} {listing.ownerName || tr(t.card.owner)}
        </CardFooter>
      </Card>
    </Link>
  );
}
