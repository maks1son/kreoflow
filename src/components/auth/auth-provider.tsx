"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/auth/client";
import { createAuthService } from "@/lib/auth/service";
import type { AuthState } from "@/lib/auth/types";
import { identifyAnalyticsUser, resetAnalyticsUser } from "@/lib/analytics";

type AuthContextValue = AuthState & {
  requestEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, token: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = hasSupabaseConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user.id) identifyAnalyticsUser(session.user.id);
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(() => {
    const client = getSupabaseBrowserClient();
    const unavailable = async () => {
      throw new Error("Supabase is not configured");
    };
    const service = client ? createAuthService(client) : null;

    const signOut = service
      ? async () => {
          await service.signOut();
          resetAnalyticsUser();
        }
      : unavailable;

    return {
      configured,
      loading,
      session,
      user: session?.user ?? null,
      requestEmailCode: service?.requestEmailCode ?? unavailable,
      verifyEmailCode: service?.verifyEmailCode ?? unavailable,
      signOut,
    };
  }, [configured, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
