/**
 * GlobeTrotter Demo Auth Context
 * Provides mock frontend authentication state, role simulation (Traveler vs Admin),
 * and onboarding preference persistence in localStorage.
 *
 * NOTE: Real backend authentication will connect to Odoo in Antigravity.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserRole = "traveler" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  travelStyle?: string;
  currency?: string;
  pinnedDestinations?: string[];
  avatar?: string;
  onboardingCompleted?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<boolean>;
  loginAsDemo: (role?: UserRole) => Promise<boolean>;
  register: (data: { name: string; email: string; password?: string; travelStyle?: string }) => Promise<boolean>;
  completeOnboarding: (preferences: { travelStyle: string; destinations: string[]; currency: string }) => void;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
};

const DEFAULT_TRAVELER: AuthUser = {
  id: "user_demo_traveler",
  name: "Mita Shah",
  email: "mita@example.com",
  role: "traveler",
  travelStyle: "Adventure",
  currency: "INR",
  pinnedDestinations: ["goa", "jaipur", "kerala"],
  onboardingCompleted: true,
};

const DEFAULT_ADMIN: AuthUser = {
  id: "user_demo_admin",
  name: "Admin Demo",
  email: "admin@globetrotter.travel",
  role: "admin",
  onboardingCompleted: true,
};

const AUTH_STORAGE_KEY = "globetrotter_demo_auth_v1";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // By default for smooth demo access on first load, initialize with Traveler
    return DEFAULT_TRAVELER;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const login = async (email: string, _password?: string, _rememberMe = true): Promise<boolean> => {
    setIsLoading(true);
    // Short simulated delay for realistic Storybook Atlas transition
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isAdmin = email.toLowerCase().includes("admin");
    const loggedUser: AuthUser = isAdmin
      ? { ...DEFAULT_ADMIN, email }
      : {
          id: `user_${Date.now()}`,
          name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Traveler",
          email,
          role: "traveler",
          travelStyle: "Adventure",
          currency: "INR",
          pinnedDestinations: ["goa"],
          onboardingCompleted: true,
        };

    setUser(loggedUser);
    setIsLoading(false);
    return true;
  };

  const loginAsDemo = async (role: UserRole = "traveler"): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setUser(role === "admin" ? DEFAULT_ADMIN : DEFAULT_TRAVELER);
    setIsLoading(false);
    return true;
  };

  const register = async (data: { name: string; email: string; password?: string; travelStyle?: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      name: data.name.trim() || "Fellow Traveler",
      email: data.email.trim(),
      role: "traveler",
      travelStyle: data.travelStyle || "Adventure",
      currency: "INR",
      pinnedDestinations: [],
      onboardingCompleted: false,
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const completeOnboarding = (preferences: { travelStyle: string; destinations: string[]; currency: string }) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        travelStyle: preferences.travelStyle,
        pinnedDestinations: preferences.destinations,
        currency: preferences.currency,
        onboardingCompleted: true,
      };
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        completeOnboarding,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
