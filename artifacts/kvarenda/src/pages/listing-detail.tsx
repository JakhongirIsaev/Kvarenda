import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { MapPin, Bed, Maximize, ArrowLeft, ChevronLeft, ChevronRight, Shield, ShieldCheck, Camera, Umbrella, Star, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetListing, useCreateApplication } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { formatUzs } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { VerifiedOwnerBadge, ProtectedRentBadge, TourBadge, InsuranceBadge } from "@/components/shared/trust-badges";
import { useToast } from "@/hooks/use-toast";

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { role, userId } = useRole();
  const { toast } = useToast();
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: listing, isLoading } = useGetListing(Number(id), {
    query: { enabled: !!id, queryKey: ["getListing", Number(id)] }
  });

  const serviceFee = listing ? Math.round(listing.priceUzs * 0.05) : 0;
  const total = listing ? listing.priceUzs + serviceFee : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-96 bg-muted rounded-2xl" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Listing not found</p>
        <Link href="/listings">
          <Button variant="outline" className="mt-4">Back to listings</Button>
        </Link>
      </div>
    );
  }

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"];

  const currentPhoto = photos[photoIdx] ?? photos[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Link href="/listings">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto}
                  src={currentPhoto}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                    data-testid="button-prev-photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                    data-testid="button-next-photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setPhotoIdx(i)}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {listing.ownerVerified && <VerifiedOwnerBadge />}
                {listing.hasInsurance && <InsuranceBadge />}
                {listing.has3dTour && <TourBadge />}
                {listing.plan === "pro" && (
                  <Badge className="bg-yellow-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === photoIdx ? "border-primary" : "border-transparent"}`}
                    onClick={() => setPhotoIdx(i)}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title and Info */}
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{listing.title}</h1>
              <div className="flex items-center text-muted-foreground gap-1 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{listing.district}, {listing.address}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {listing.rooms} {listing.rooms === 1 ? "room" : "rooms"}
                </div>
                {listing.area && (
                  <div className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    {listing.area} m²
                  </div>
                )}
                {listing.floor && (
                  <div>Floor {listing.floor}{listing.totalFloors ? `/${listing.totalFloors}` : ""}</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-lg font-semibold mb-3">About this apartment</h2>
                <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-sm py-1 px-3">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            {listing.rules && (
              <div>
                <h2 className="text-lg font-semibold mb-3">House Rules</h2>
                <p className="text-muted-foreground">{listing.rules}</p>
              </div>
            )}

            <Separator />

            {/* Owner */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Owner</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {listing.ownerName?.[0] ?? "O"}
                </div>
                <div>
                  <p className="font-medium">{listing.ownerName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {listing.ownerVerified ? (
                      <><ShieldCheck className="w-3 h-3 text-blue-500" /> Verified owner</>
                    ) : (
                      <><Shield className="w-3 h-3" /> Unverified</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Monthly rent</p>
                <p className="text-3xl font-bold text-foreground">{formatUzs(listing.priceUzs)}</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent</span>
                  <span className="font-medium">{formatUzs(listing.priceUzs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-500" />
                    Service fee (5%)
                  </span>
                  <span className="font-medium">{formatUzs(serviceFee)}</span>
                </div>
                {listing.deposit && listing.deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit (once)</span>
                    <span className="font-medium">{formatUzs(listing.deposit)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total monthly</span>
                  <span>{formatUzs(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {listing.ownerVerified && <VerifiedOwnerBadge />}
                <ProtectedRentBadge />
                {listing.has3dTour && <TourBadge />}
                {listing.hasInsurance && <InsuranceBadge />}
              </div>

              {role === "tenant" ? (
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => setLocation(`/apply/${listing.id}`)}
                  data-testid="button-apply"
                >
                  Apply for this apartment
                </Button>
              ) : role === "owner" ? (
                <div className="text-center text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  Switch to Tenant role to apply
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setLocation(`/owner/listings/${listing.id}/edit`)}>
                  Edit listing (Admin)
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                No commitment. Cancel anytime. Protected by Kvarenda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
