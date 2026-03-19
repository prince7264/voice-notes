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

      {/* GitHub Sign In Button */}
      <button
        onClick={() => signIn("github")}
        className="flex items-center gap-3 bg-[#F5F5F7] hover:bg-white active:bg-gray-200 text-[#1a1a1a] font-medium text-sm px-6 py-3.5 rounded-xl transition-colors duration-150 w-full max-w-xs justify-center shadow-sm"
      >
        {/* GitHub Mark */}
        <svg className="w-5 h-5 flex-shrink-0" fill="#1a1a1a" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        Continue with GitHub
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
