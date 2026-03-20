"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const PROFESSIONS = [
  "Developer / Engineer",
  "Designer",
  "Product / UX",
  "Marketing",
  "Healthcare",
  "Finance",
  "Legal",
  "Education",
  "Creative",
  "Student",
  "Other",
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

    const finalProfession =
      profession === "Other" ? otherProfession.trim() : profession;

    if (!name.trim()) return setError("Please enter your name.");
    if (!age || parseInt(age) < 13 || parseInt(age) > 100)
      return setError("Please enter a valid age (13–100).");
    if (!finalProfession) return setError("Please select your profession.");

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        age: parseInt(age),
        profession: finalProfession,
        onboardingComplete: true,
      });
      await refreshProfile();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090F] flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 17.93V22h2v-1.07A8.001 8.001 0 0 0 20 13h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#F1F1FA] mb-1">Welcome aboard!</h1>
        <p className="text-sm text-[#8181A0]">Just a few details to personalise your experience</p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#13141F] border border-[#252538] rounded-3xl p-6 flex flex-col gap-5 shadow-xl"
      >
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8181A0] uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-[#18181F] border border-[#252538] rounded-xl px-4 py-3 text-sm text-[#F1F1FA] placeholder-[#4A4A65] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>

        {/* Age */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8181A0] uppercase tracking-wider">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age"
            min={13}
            max={100}
            className="bg-[#18181F] border border-[#252538] rounded-xl px-4 py-3 text-sm text-[#F1F1FA] placeholder-[#4A4A65] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>

        {/* Profession */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8181A0] uppercase tracking-wider">
            Profession
          </label>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="bg-[#18181F] border border-[#252538] rounded-xl px-4 py-3 text-sm text-[#F1F1FA] focus:outline-none focus:border-[#6366F1] transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238181A0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
            }}
          >
            <option value="" disabled>
              Select your profession
            </option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p} className="bg-[#18181F]">
                {p}
              </option>
            ))}
          </select>

          {profession === "Other" && (
            <input
              type="text"
              value={otherProfession}
              onChange={(e) => setOtherProfession(e.target.value)}
              placeholder="Please specify"
              className="bg-[#18181F] border border-[#252538] rounded-xl px-4 py-3 text-sm text-[#F1F1FA] placeholder-[#4A4A65] focus:outline-none focus:border-[#6366F1] transition-colors"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#6366F1] hover:bg-[#5153D8] active:bg-[#4547C4] disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Setting up…
            </>
          ) : (
            "Get Started →"
          )}
        </button>
      </form>
    </div>
  );
}
