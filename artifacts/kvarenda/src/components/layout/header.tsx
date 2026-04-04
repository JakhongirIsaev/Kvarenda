import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRole } from "@/lib/role-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Header() {
  const { role, setRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/listings", label: "Search", show: true },
    { href: "/my/applications", label: "Applications", show: role === "tenant" },
    { href: "/my/rental", label: "My Rental", show: role === "tenant" },
    { href: "/owner", label: "Dashboard", show: role === "owner" },
    { href: "/admin", label: "Admin Panel", show: role === "admin" },
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

        <div className="flex items-center gap-2 md:gap-4">
          <Select value={role} onValueChange={(val: any) => setRole(val)}>
            <SelectTrigger className="w-[110px] md:w-[120px] h-8 text-xs md:text-sm">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:block">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {role.charAt(0).toUpperCase()}
                </div>
              </Button>
            </Link>
          </div>

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
