import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, SlidersHorizontal, X, MapPin, Bed, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGetListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/shared/listing-card";
import { motion, AnimatePresence } from "framer-motion";
import { formatUzs } from "@/lib/utils";
import { useI18n, useT } from "@/lib/i18n";

const DISTRICTS = ["Yunusobod", "Mirzo Ulugbek", "Chilonzor", "Shaykhontohur", "Yakkasaroy", "Uchtepa", "Olmazor", "Sergeli"];

export function Listings() {
  const [location] = useLocation();
  const { t } = useI18n();
  const { tr } = useT();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [district, setDistrict] = useState(params.get("district") || "");
  const [rooms, setRooms] = useState(params.get("rooms") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [verified, setVerified] = useState(false);
  const [has3dTour, setHas3dTour] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const queryParams: Record<string, string | number | boolean> = {
    limit: 50,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  };
  if (district && district !== "any") queryParams.district = district;
  if (rooms && rooms !== "any") queryParams.rooms = parseInt(rooms);
  if (verified) queryParams.verified = true;
  if (has3dTour) queryParams.has3dTour = true;
  if (hasInsurance) queryParams.hasInsurance = true;

  const { data: listingsData, isLoading } = useGetListings(queryParams);

  const listings = listingsData?.listings ?? [];
  const total = listingsData?.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-16 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {tr(t.listings.filters)}
            {(district || rooms || verified || has3dTour || hasInsurance) && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
            )}
          </Button>

          <div className="flex gap-2 flex-wrap">
            {district && district !== "any" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setDistrict("")}>
                {district} <X className="w-3 h-3" />
              </Badge>
            )}
            {rooms && rooms !== "any" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setRooms("")}>
                {rooms} rooms <X className="w-3 h-3" />
              </Badge>
            )}
            {verified && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setVerified(false)}>
                Verified <X className="w-3 h-3" />
              </Badge>
            )}
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            {isLoading ? tr(t.listings.loading) : `${total} ${tr(t.listings.listingsCount)}`}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-72 flex-shrink-0"
              >
                <div className="bg-card border border-border rounded-xl p-5 sticky top-36 space-y-6">
                  <h3 className="font-semibold text-foreground">{tr(t.listings.filters)}</h3>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">{tr(t.listings.district)}</Label>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger data-testid="select-district">
                        <SelectValue placeholder={tr(t.home.anyDistrict)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{tr(t.home.anyDistrict)}</SelectItem>
                        {DISTRICTS.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">{tr(t.home.rooms)}</Label>
                    <Select value={rooms} onValueChange={setRooms}>
                      <SelectTrigger data-testid="select-rooms">
                        <SelectValue placeholder={tr(t.home.anyRooms)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{tr(t.home.anyRooms)}</SelectItem>
                        <SelectItem value="1">1 {tr(t.home.room)}</SelectItem>
                        <SelectItem value="2">2 {tr(t.home.roomPlural)}</SelectItem>
                        <SelectItem value="3">3 {tr(t.home.roomPlural)}</SelectItem>
                        <SelectItem value="4+">4+ {tr(t.home.roomPlural)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      {tr(t.listings.price)}: {formatUzs(priceRange[0])} — {formatUzs(priceRange[1])}
                    </Label>
                    <Slider
                      min={0}
                      max={20000000}
                      step={500000}
                      value={priceRange}
                      onValueChange={(val) => setPriceRange(val as [number, number])}
                      className="mt-2"
                      data-testid="slider-price"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium block">{tr(t.listings.features)}</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="verified"
                        checked={verified}
                        onCheckedChange={(v) => setVerified(v === true)}
                        data-testid="checkbox-verified"
                      />
                      <label htmlFor="verified" className="text-sm cursor-pointer">{tr(t.listings.verified)}</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="tour"
                        checked={has3dTour}
                        onCheckedChange={(v) => setHas3dTour(v === true)}
                        data-testid="checkbox-3dtour"
                      />
                      <label htmlFor="tour" className="text-sm cursor-pointer">{tr(t.badges.tour3d)}</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="insurance"
                        checked={hasInsurance}
                        onCheckedChange={(v) => setHasInsurance(v === true)}
                        data-testid="checkbox-insurance"
                      />
                      <label htmlFor="insurance" className="text-sm cursor-pointer">{tr(t.badges.insurance)}</label>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setDistrict("");
                      setRooms("");
                      setPriceRange([0, 20000000]);
                      setVerified(false);
                      setHas3dTour(false);
                      setHasInsurance(false);
                    }}
                    data-testid="button-clear-filters"
                  >
                    {tr(t.listings.clearFilters)}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {district && district !== "any" ? `${tr(t.listings.apartmentsIn)} ${district}` : tr(t.listings.allListings)}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{total} {tr(t.listings.available)}</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">{tr(t.listings.noListings)}</p>
                <p className="text-sm mt-2">{tr(t.listings.tryFilters)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
