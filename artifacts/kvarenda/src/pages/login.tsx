import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n, useT } from "@/lib/i18n";
import { motion } from "framer-motion";

export function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useRole();
  const { toast } = useToast();
  const { t } = useI18n();
  const { tr } = useT();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      toast({ title: tr(t.auth.welcome), description: tr(t.auth.loggedIn) });
      setLocation("/");
    } else {
      toast({ title: tr(t.common.error), description: tr(t.auth.invalidCredentials), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{tr(t.auth.loginTitle)}</h1>
          <p className="text-muted-foreground mt-1">{tr(t.auth.loginSubtitle)}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                data-testid="input-login-email"
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
                  className="pr-10"
                  data-testid="input-login-password"
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

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
              data-testid="button-login"
            >
              {loading ? tr(t.auth.signingIn) : tr(t.auth.login)}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {tr(t.auth.noAccount)}{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            {tr(t.auth.register)}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
