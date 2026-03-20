"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }

    if (!profile?.onboardingComplete) {
      if (pathname !== "/onboarding") router.replace("/onboarding");
      return;
    }

    if (profile?.onboardingComplete) {
      if (pathname === "/login" || pathname === "/onboarding") {
        router.replace("/");
      }
    }
  }, [user, profile, loading, pathname, router]);

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#4A4A65]">Loading…</p>
        </div>
      </div>
    );
  }

  // Don't flash protected content while redirect is in progress
  if (!user && pathname !== "/login") return null;
  if (user && !profile?.onboardingComplete && pathname !== "/onboarding") return null;

  return <>{children}</>;
}
