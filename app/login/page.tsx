"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-fixed/15 rounded-full blur-[100px] pointer-events-none" />

      <main className="w-full max-w-[440px] z-10 flex flex-col items-center scale-in">
        {/* Brand header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container mb-5 shadow-lg">
            <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}>
              mic
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Bolkar</h1>
          <p className="text-on-surface-variant font-medium tracking-wide text-sm">The Auditory Sanctuary</p>
        </header>

        {/* Auth card */}
        <div className="w-full bg-surface-container-low/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white/40 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-on-surface mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Welcome Back</h2>
            <p className="text-on-surface-variant text-sm">Focus on the sound, we&apos;ll handle the notes.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-2xl bg-error-container/60 text-on-error-container text-sm text-center">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 bg-surface-container-lowest text-on-background flex items-center justify-center gap-3 rounded-2xl font-semibold border border-outline-variant/30 hover:bg-surface-bright transition-all active:scale-[0.98] duration-200 disabled:opacity-60 shadow-sm"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{loading ? "Signing in…" : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
            <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.1em]">or continue with email</span>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>

          {/* Email Form */}
          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant px-1 tracking-wider uppercase">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full h-14 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/40 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant px-1 tracking-wider uppercase">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-14 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/40 outline-none"
              />
            </div>
            <div className="text-right">
              <button type="button" className="text-primary font-semibold text-sm hover:underline transition-all">
                Forgot password?
              </button>
            </div>
            <button
              type="button"
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 transition-all mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: "mic", text: "Record voice notes in seconds" },
              { icon: "auto_awesome", text: "Auto-transcribed with AI" },
              { icon: "lock", text: "Private and secure to your account" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
                </div>
                <span className="text-sm text-on-surface-variant font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-10 text-center flex flex-col gap-6">
          <p className="text-on-surface-variant text-sm">
            Don&apos;t have an account?{" "}
            <button className="text-primary font-semibold hover:underline">Create account</button>
          </p>
          <div className="flex items-center justify-center gap-6">
            <button className="text-on-surface-variant text-[11px] font-bold tracking-widest uppercase hover:text-primary transition-colors">Privacy Policy</button>
            <div className="w-1 h-1 bg-outline-variant rounded-full" />
            <button className="text-on-surface-variant text-[11px] font-bold tracking-widest uppercase hover:text-primary transition-colors">Terms of Service</button>
          </div>
        </footer>
      </main>

      {/* Decorative waveform */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-40 pointer-events-none">
        {[4, 8, 6, 10, 5, 9, 3].map((h, i) => (
          <div key={i} className="w-1.5 bg-primary/50 rounded-full" style={{ height: `${h * 2}px` }} />
        ))}
      </div>
    </div>
  );
}
