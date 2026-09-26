"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

type AuthState = {
  user: AuthUser | null;
  balance: number | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  balance: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/credits/balance", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUser({
            id: data.profile.id,
            email: data.profile.email,
            name: data.profile.name,
          });
          setBalance(typeof data.balance === "number" ? data.balance : null);
          setLoading(false);
          return;
        }
      }
      try {
        const supabase = createClient();
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        if (u) {
          setUser({
            id: u.id,
            email: u.email ?? null,
            name:
              (u.user_metadata?.name as string | undefined) ||
              u.email?.split("@")[0] ||
              null,
          });
        } else {
          setUser(null);
          setBalance(null);
        }
      } catch {
        setUser(null);
        setBalance(null);
      }
    } catch {
      setUser(null);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      /* ignore */
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    setBalance(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    void refresh();
    let unsub: (() => void) | undefined;
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange(() => {
        void refresh();
      });
      unsub = () => data.subscription.unsubscribe();
    } catch {
      /* env missing */
    }
    return () => unsub?.();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, balance, loading, refresh, logout }),
    [user, balance, loading, refresh, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
