import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, MapPin, Shield, CheckCircle2, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/shared/listing-card";
import { ListingMap } from "@/components/shared/listing-map";
import { ProtectedRentBadge, VerifiedOwnerBadge } from "@/components/shared/trust-badges";
import { motion } from "framer-motion";

const DISTRICTS = [
  "Yunusobod", "Mirzo Ulugbek", "Chilonzor", "Shaykhontohur",
  "Yakkasaroy", "Uchtepa", "Olmazor", "Sergeli"
];

export function Home() {
  const [, setLocation] = useLocation();
  const [district, setDistrict] = useState<string>("");
  const [rooms, setRooms] = useState<string>("");

  const { data: listingsData, isLoading } = useGetListings({ limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (district && district !== "any") params.append("district", district);
    if (rooms && rooms !== "any") params.append("rooms", rooms);
    setLocation(`/listings?${params.toString()}`);
  };

  const listings = listingsData?.listings ?? [];

  return (
    <div className="flex flex-col">
      <section className="relative bg-primary/5 pt-16 md:pt-24 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/apt1.png"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
              Tashkent's Most Trusted <br className="hidden md:block" /> Rental Platform
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
              Find verified apartments with protected rent and 5% service fee. No hidden costs.
            </p>

            <div className="bg-card p-3 md:p-4 rounded-2xl shadow-xl border border-border/50 flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="w-full pl-10 border-0 bg-transparent focus:ring-0 shadow-none text-base h-12">
                    <SelectValue placeholder="Any district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any district</SelectItem>
                    {DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-px bg-border hidden md:block my-2"></div>
              <div className="flex-1">
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0 shadow-none text-base h-12">
                    <SelectValue placeholder="Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rooms</SelectItem>
                    <SelectItem value="1">1 Room</SelectItem>
                    <SelectItem value="2">2 Rooms</SelectItem>
                    <SelectItem value="3">3 Rooms</SelectItem>
                    <SelectItem value="4+">4+ Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} size="lg" className="h-12 px-8 rounded-xl text-base" data-testid="button-hero-search">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>

            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <VerifiedOwnerBadge />
              <ProtectedRentBadge />
              <Badge variant="outline" className="bg-background/50 backdrop-blur">5% Flat Fee</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Explore on Map</h2>
                <p className="text-muted-foreground text-sm md:text-base">Browse apartments across Tashkent's districts</p>
              </div>
              <Link href="/listings">
                <Button variant="ghost" className="text-primary hover:text-primary/80 hidden md:flex">View all listings</Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="h-[400px] md:h-[500px] bg-muted animate-pulse rounded-2xl" />
            ) : (
              <ListingMap listings={listings} height="400px" className="md:h-[500px]" />
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Featured Listings</h2>
              <p className="text-muted-foreground">Handpicked apartments with verified owners</p>
            </div>
            <Link href="/listings">
              <Button variant="ghost" className="text-primary hover:text-primary/80">View all</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Why Kvarenda?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Everything you need for safe, transparent apartment rental in Tashkent</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: "Verified Owners",
                desc: "Every owner goes through document verification. Real people, real apartments.",
                color: "text-blue-500 bg-blue-50",
              },
              {
                icon: Shield,
                title: "Protected Rent",
                desc: "Your deposit is held securely. Full refund guarantee if the owner breaks the contract.",
                color: "text-green-500 bg-green-50",
              },
              {
                icon: DollarSign,
                title: "5% Flat Fee",
                desc: "No hidden costs. Just a transparent 5% service fee on monthly rent. That's it.",
                color: "text-primary bg-primary/10",
              },
              {
                icon: Eye,
                title: "3D Tours",
                desc: "View apartments remotely with immersive 3D tours. Save time before visiting.",
                color: "text-purple-500 bg-purple-50",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to find your next home?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
            Join thousands of tenants and owners who trust Kvarenda for safe, transparent rentals in Tashkent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listings">
              <Button size="lg" variant="secondary" className="px-8 text-base">
                Browse Apartments
              </Button>
            </Link>
            <Link href="/owner/listings/new">
              <Button size="lg" variant="outline" className="px-8 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
