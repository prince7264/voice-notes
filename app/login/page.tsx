"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center px-4">
      {/* Logo / Icon */}
      <div className="w-20 h-20 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 17.93V22h2v-1.07A8.001 8.001 0 0 0 20 13h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-[#F5F5F7] mb-2 tracking-tight">Voice Notes</h1>
      <p className="text-[#8E8E93] text-sm mb-10 text-center max-w-xs">
        Capture your thoughts instantly — for work and life
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] text-sm text-center max-w-xs">
          Sign-in failed. Please try again.
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        onClick={() => signIn("google")}
        className="flex items-center gap-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-[#1a1a1a] font-medium text-sm px-6 py-3.5 rounded-xl transition-colors duration-150 w-full max-w-xs justify-center shadow-sm"
      >
        {/* Google G Logo */}
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="text-[#48484A] text-xs mt-8 text-center max-w-xs leading-relaxed">
        By continuing, you agree to our terms. Your notes are stored privately on your device.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B]" />}>
      <LoginContent />
    </Suspense>
  );
}
