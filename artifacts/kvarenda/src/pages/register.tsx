import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, UserPlus, Home, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n, useT } from "@/lib/i18n";
import { motion } from "framer-motion";

export function Register() {
  const [, setLocation] = useLocation();
  const { register: registerUser, isAuthenticated } = useRole();
  const { toast } = useToast();
  const { t } = useI18n();
  const { tr } = useT();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"tenant" | "owner">("tenant");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: tr(t.common.error), description: tr(t.auth.passwordMismatch), variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = await registerUser({ name, email, password, role, phone: phone || undefined });
    setLoading(false);

    if (result.ok) {
      toast({ title: tr(t.auth.welcome), description: tr(t.auth.registered) });
      setLocation(role === "owner" ? "/owner" : "/listings");
    } else {
      const msg = result.error === "Email already registered" ? tr(t.auth.emailExists) : result.error || tr(t.common.error);
      toast({ title: tr(t.common.error), description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{tr(t.auth.registerTitle)}</h1>
          <p className="text-muted-foreground mt-1">{tr(t.auth.registerSubtitle)}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{tr(t.auth.role)}</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    role === "tenant"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Key className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tr(t.auth.roleTenant)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    role === "owner"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Home className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tr(t.auth.roleOwner)}</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="name">{tr(t.auth.name)}</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="mt-1"
                data-testid="input-register-name"
              />
            </div>

            <div>
              <Label htmlFor="email">{tr(t.auth.email)}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="mt-1"
                data-testid="input-register-email"
              />
            </div>

            <div>
              <Label htmlFor="phone">{tr(t.auth.phone)}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+998 XX XXX XX XX"
                className="mt-1"
                data-testid="input-register-phone"
              />
            </div>

            <div>
              <Label htmlFor="password">{tr(t.auth.password)}</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                  data-testid="input-register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{tr(t.auth.confirmPassword)}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
                data-testid="input-register-confirm-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
              data-testid="button-register"
            >
              {loading ? tr(t.auth.creating) : tr(t.auth.register)}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {tr(t.auth.hasAccount)}{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {tr(t.auth.login)}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
