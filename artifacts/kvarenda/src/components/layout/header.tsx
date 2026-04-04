import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRole } from "@/lib/role-context";
import { useI18n, useT, Language } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const LANG_LABELS: Record<Language, string> = { en: "EN", ru: "RU", uz: "UZ" };

export function Header() {
  const { role, setRole } = useRole();
  const { lang, setLang, t } = useI18n();
  const { tr } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/listings", label: tr(t.nav.search), show: true },
    { href: "/my/applications", label: tr(t.nav.applications), show: role === "tenant" },
    { href: "/my/rental", label: tr(t.nav.myRental), show: role === "tenant" },
    { href: "/owner", label: tr(t.nav.dashboard), show: role === "owner" },
    { href: "/admin", label: tr(t.nav.adminPanel), show: role === "admin" },
  ].filter(l => l.show);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">Kvarenda</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                location === link.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Select value={lang} onValueChange={(val) => setLang(val as Language)}>
            <SelectTrigger className="w-[80px] h-9 text-xs gap-1">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ru">RU</SelectItem>
              <SelectItem value="uz">UZ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={role} onValueChange={(val: any) => setRole(val)}>
            <SelectTrigger className="w-auto min-w-[110px] md:min-w-[130px] h-9 text-xs md:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">{tr(t.nav.tenant)}</SelectItem>
              <SelectItem value="owner">{tr(t.nav.owner)}</SelectItem>
              <SelectItem value="admin">{tr(t.nav.admin)}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
