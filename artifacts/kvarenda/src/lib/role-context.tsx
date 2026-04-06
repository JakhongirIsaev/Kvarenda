import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserRole } from "@workspace/api-client-react";

const API_BASE = "/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  verified: boolean;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: number;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoRole, setDemoRole] = useState<UserRole>("tenant");

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        return { ok: true };
      }
      const data = await res.json();
      return { ok: false, error: data.error };
    } catch {
      return { ok: false, error: "Network error" };
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: string; phone?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        return { ok: true };
      }
      const d = await res.json();
      return { ok: false, error: d.error };
    } catch {
      return { ok: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
  };

  const isAuthenticated = !!user;
  const role = user ? user.role : demoRole;
  const userId = user ? user.id : (demoRole === "tenant" ? 1 : demoRole === "owner" ? 2 : 4);

  const setRole = (newRole: UserRole) => {
    if (!user) {
      setDemoRole(newRole);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, userId, user, isAuthenticated, isLoading, login, register, logout, checkAuth }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
