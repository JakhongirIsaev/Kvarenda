import { Link } from "wouter";
import { useRole } from "@/lib/role-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function Header() {
  const { role, setRole } = useRole();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary tracking-tight">Kvarenda</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/listings" className="text-muted-foreground hover:text-foreground transition-colors">
            Search
          </Link>
          {role === "tenant" && (
            <>
              <Link href="/my/applications" className="text-muted-foreground hover:text-foreground transition-colors">
                Applications
              </Link>
              <Link href="/my/rental" className="text-muted-foreground hover:text-foreground transition-colors">
                My Rental
              </Link>
            </>
          )}
          {role === "owner" && (
            <>
              <Link href="/owner" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </>
          )}
          {role === "admin" && (
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <Select value={role} onValueChange={(val: any) => setRole(val)}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">Tenant View</SelectItem>
              <SelectItem value="owner">Owner View</SelectItem>
              <SelectItem value="admin">Admin View</SelectItem>
            </SelectContent>
          </Select>

          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {role.charAt(0).toUpperCase()}
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
