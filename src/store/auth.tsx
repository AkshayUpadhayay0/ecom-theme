"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/types";

interface AuthState {
  user: SessionUser | null;
  setUser: (u: SessionUser | null) => void;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <Providers>");
  return v;
};

export function AuthProvider({ initialUser, children }: { initialUser: SessionUser | null; children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    setUser(null);
    window.location.assign("/");
  }, []);
  const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
