import { Link } from "wouter";
import { Shield, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-background">Kvarenda</span>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed">
              Tashkent's most trusted apartment rental platform. Verified owners, protected rent, transparent pricing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">For Tenants</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings" className="hover:text-background transition-colors">Browse Apartments</Link></li>
              <li><Link href="/my/applications" className="hover:text-background transition-colors">My Applications</Link></li>
              <li><Link href="/my/rental" className="hover:text-background transition-colors">My Rental</Link></li>
              <li><span className="text-background/40">Rent Protection</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">For Owners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/owner" className="hover:text-background transition-colors">Owner Dashboard</Link></li>
              <li><Link href="/owner/listings/new" className="hover:text-background transition-colors">List Your Property</Link></li>
              <li><span className="text-background/40">Verification Program</span></li>
              <li><span className="text-background/40">Pro Listings</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Tashkent, Uzbekistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+998 71 200-00-00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@kvarenda.uz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-background/40">
          <p>&copy; {new Date().getFullYear()} Kvarenda. All rights reserved.</p>
          <div className="flex items-center gap-1 mt-2 md:mt-0">
            <span>5% flat service fee</span>
            <span className="mx-2">·</span>
            <span>No hidden costs</span>
            <span className="mx-2">·</span>
            <span>Verified owners only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
