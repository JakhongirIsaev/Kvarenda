import { Link } from "wouter";
import { Shield, MapPin, Phone, Mail } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const { tr } = useT();

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
              {tr(t.footer.tagline)}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{tr(t.footer.forTenants)}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings" className="hover:text-background transition-colors">{tr(t.footer.browseApartments)}</Link></li>
              <li><Link href="/my/applications" className="hover:text-background transition-colors">{tr(t.footer.myApplications)}</Link></li>
              <li><Link href="/my/rental" className="hover:text-background transition-colors">{tr(t.footer.myRental)}</Link></li>
              <li><span className="text-background/40">{tr(t.footer.rentProtection)}</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{tr(t.footer.forOwners)}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/owner" className="hover:text-background transition-colors">{tr(t.footer.ownerDashboard)}</Link></li>
              <li><Link href="/owner/listings/new" className="hover:text-background transition-colors">{tr(t.footer.listProperty)}</Link></li>
              <li><span className="text-background/40">{tr(t.footer.verificationProgram)}</span></li>
              <li><span className="text-background/40">{tr(t.footer.proListings)}</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{tr(t.footer.contact)}</h4>
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
          <p>&copy; {new Date().getFullYear()} Kvarenda. {tr(t.footer.rights)}</p>
          <div className="flex items-center gap-1 mt-2 md:mt-0">
            <span>{tr(t.footer.transparentPricing)}</span>
            <span className="mx-2">&middot;</span>
            <span>{tr(t.footer.noHidden)}</span>
            <span className="mx-2">&middot;</span>
            <span>{tr(t.footer.verifiedOnly)}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
