import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@workspace/api-client-react";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: number;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("tenant");

  // Mock user IDs based on role
  const userId = role === "tenant" ? 1 : role === "owner" ? 2 : 3;

  return (
    <RoleContext.Provider value={{ role, setRole, userId }}>
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
