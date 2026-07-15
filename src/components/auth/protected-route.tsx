"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { configured, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!configured || loading || user) return;
    const query = searchParams.toString();
    const returnTo = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [configured, loading, pathname, router, searchParams, user]);

  if (!configured) return <>{children}</>;
  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f0e9] px-6" aria-live="polite">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#706b65]">
          Проверяем сессию…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
