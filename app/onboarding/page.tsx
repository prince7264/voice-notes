"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const PROFESSIONS = [
  "Developer / Engineer", "Designer", "Product / UX", "Marketing",
  "Healthcare", "Finance", "Legal", "Education", "Creative", "Student", "Other",
];

export default function OnboardingPage() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
  }, [user?.displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const finalProfession = profession === "Other" ? otherProfession.trim() : profession;
    if (!name.trim()) return setError("Please enter your name.");
    if (!age || parseInt(age) < 13 || parseInt(age) > 100) return setError("Please enter a valid age (13–100).");
    if (!finalProfession) return setError("Please select your profession.");
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), age: parseInt(age), profession: finalProfession, onboardingComplete: true });
      await refreshProfile();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-between px-6 py-12 md:py-24 relative overflow-hidden max-w-screen-xl mx-auto">
      {/* Background glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary-fixed/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-tertiary-fixed/20 rounded-full blur-[100px]" />
      </div>

      {/* Top brand */}
      <header className="w-full flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-lg">graphic_eq</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>Bolkar Notes</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center">
        <div className="relative mb-16">
          <div className="absolute -inset-10 bg-tertiary-fixed/20 blur-3xl rounded-full" />
          <div className="absolute -inset-20 bg-primary-fixed/10 blur-[80px] rounded-full" />
          <div className="relative w-48 h-48 md:w-64 md:h-64 bg-surface-container-lowest rounded-3xl shadow-ambient flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            <div className="flex items-center gap-1.5 h-16">
              {[6, 12, 20, 24, 16, 8].map((h, i) => (
                <div key={i} className="w-1.5 rounded-full bg-primary-container" style={{ height: `${h}px`, opacity: 0.2 + i * 0.12 }} />
              ))}
            </div>
            <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">mic</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-4">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-editorial-gradient"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Capture your thoughts,<br />instantly transcribed.
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl font-normal max-w-md mx-auto leading-relaxed">
            Bolkar Notes turns your voice memos into clear, organized notes. The professional way to never lose an idea.
          </p>
        </div>
      </section>

      {/* Form */}
      <div className="w-full max-w-sm mt-12 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-14 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/40 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              min={13} max={100}
              className="w-full h-14 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/40 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Profession</label>
            <div className="relative">
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full h-14 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer pr-12 outline-none"
              >
                <option value="" disabled>Select your profession</option>
                {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
            {profession === "Other" && (
              <input
                type="text"
                value={otherProfession}
                onChange={(e) => setOtherProfession(e.target.value)}
                placeholder="Please specify"
                className="w-full h-14 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/40 outline-none"
              />
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-2xl bg-error-container/50 text-on-error-container text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-14 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-base rounded-[1.5rem] shadow-xl shadow-primary/10 hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 mt-2"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {saving ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                Get Started
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="font-label text-xs tracking-wide text-on-surface-variant uppercase">Designed for clarity</p>
        </div>
      </div>
    </div>
  );
}
