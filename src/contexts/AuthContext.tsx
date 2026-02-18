import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AuthState, LoginCredentials, User } from "@/types";
import { mockUsers, MOCK_CREDENTIALS } from "@/data/mock";
import { toast } from "sonner";

interface AuthContextValue extends AuthState {
  login: (creds: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem("atiat_user");
    if (stored) {
      return { user: JSON.parse(stored), isAuthenticated: true, isLoading: false };
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  const login = useCallback(async (creds: LoginCredentials): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true }));
    // simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    if (creds.email === MOCK_CREDENTIALS.email && creds.password === MOCK_CREDENTIALS.password) {
      const user = mockUsers[0];
      localStorage.setItem("atiat_user", JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      toast.success("Welcome back, " + user.firstName + "!");
      return true;
    }

    setState((s) => ({ ...s, isLoading: false }));
    toast.error("Invalid email or password.");
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("atiat_user");
    setState({ user: null, isAuthenticated: false, isLoading: false });
    toast.success("You have been logged out.");
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
