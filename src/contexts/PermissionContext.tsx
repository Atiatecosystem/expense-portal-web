import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { Permission, ROLE_PERMISSIONS, UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionContextValue {
  permissions: Permission[];
  hasPermission: (p: Permission) => boolean;
  hasAnyPermission: (ps: Permission[]) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const permissions = useMemo<Permission[]>(
    () => (user ? ROLE_PERMISSIONS[user.role] ?? [] : []),
    [user]
  );

  const hasPermission = (p: Permission) => permissions.includes(p);
  const hasAnyPermission = (ps: Permission[]) => ps.some((p) => permissions.includes(p));

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, hasAnyPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionProvider");
  return ctx;
};
