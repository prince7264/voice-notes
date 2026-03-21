"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PROFESSIONS = [
  "Developer / Engineer", "Designer", "Product / UX", "Marketing",
  "Healthcare", "Finance", "Legal", "Education", "Creative", "Student", "Other",
];

export function ProfileTab() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age?.toString() ?? "");
      setProfession(profile.profession ?? "");
    }
  }, [profile]);

  const initials = profile?.name
    ? profile.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isKnownProfession = PROFESSIONS.includes(profession);

  const handleSave = async () => {
    setSaving(true);
    const finalProfession = profession === "Other" ? otherProfession.trim() || profession : profession;
    await updateProfile({ name: name.trim(), age: parseInt(age), profession: finalProfession });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background no-scrollbar">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-surface flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors">
            <span className="material-symbols-outlined text-on-surface">menu</span>
          </button>
          <h1 className="font-extrabold text-xl text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
            Bolkar Notes
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-sm">
              {initials}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 pt-8 pb-32 space-y-12">
        {/* User Profile Section */}
        <section className="space-y-6">
          <h2 className="font-extrabold text-2xl tracking-tight text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
            User Profile
          </h2>
          <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 shadow-ambient hover:bg-surface-container-low transition-colors">
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-2xl font-bold">
                  {initials}
                </div>
              )}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full border-2 border-surface-container-lowest"
                >
                  <span className="material-symbols-outlined text-white text-xs block" style={{ fontSize: "14px" }}>edit</span>
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xl text-on-surface truncate" style={{ fontFamily: "Manrope, sans-serif" }}>
                {profile?.name || user?.displayName || "—"}
              </p>
              <p className="text-sm text-on-surface-variant truncate mt-0.5">{user?.email}</p>
              {profile?.profession && (
                <p className="text-xs text-on-surface-variant/70 mt-1">{profile.profession}</p>
              )}
            </div>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary transition-colors">chevron_right</span>
          </div>
        </section>

        {/* Edit form */}
        {editing && (
          <section className="space-y-4 fade-in">
            <h2 className="font-extrabold text-2xl tracking-tight text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
              Edit Profile
            </h2>
            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={13} max={100}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Profession</label>
                  <select
                    value={isKnownProfession ? profession : "Other"}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                  >
                    {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {profession === "Other" && (
                    <input
                      type="text"
                      value={otherProfession || (!isKnownProfession ? profession : "")}
                      onChange={(e) => setOtherProfession(e.target.value)}
                      placeholder="Please specify"
                      className="w-full mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  )}
                </div>
              </div>
            </div>
            {saved && (
              <div className="flex items-center gap-2 text-sm text-tertiary bg-tertiary-fixed/20 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Profile updated successfully
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 text-sm font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl py-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 text-sm font-bold bg-primary text-on-primary rounded-xl py-3 transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
              >
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : null}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </section>
        )}

        {/* Preferences */}
        <section className="space-y-6">
          <h2 className="font-extrabold text-2xl tracking-tight text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
            Preferences
          </h2>
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            {/* Transcription Language */}
            <div className="flex items-center justify-between p-5 hover:bg-surface-container transition-colors group border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-xl">translate</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">Transcription Language</p>
                  <p className="text-xs text-on-surface-variant">Auto-detect</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">expand_more</span>
            </div>

            {/* Storage & Sync */}
            <div className="flex items-center justify-between p-5 hover:bg-surface-container transition-colors group border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined text-xl">cloud_sync</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">Storage & Sync</p>
                  <p className="text-xs text-on-surface-variant">Firestore + Local IndexedDB</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">expand_more</span>
            </div>

            {/* Theme with Toggle Switch */}
            <div className="flex items-center justify-between p-5 hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined text-xl">dark_mode</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">Dark Mode</p>
                  <p className="text-xs text-on-surface-variant">{darkMode ? "On" : "Off"}</p>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full relative px-1 transition-colors duration-300 ${
                  darkMode ? "bg-primary" : "bg-outline-variant/30"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    darkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Storage Usage */}
        <section className="space-y-6">
          <h2 className="font-extrabold text-2xl tracking-tight text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
            Storage
          </h2>
          <div className="bg-surface-container-low rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-on-surface">Local Storage Used</span>
              <span className="text-xs font-bold text-primary">Calculating…</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all" style={{ width: "15%" }} />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">Audio files stored locally in IndexedDB</p>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-6 pb-4">
          <h2 className="font-extrabold text-2xl tracking-tight text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
            Account
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-5 rounded-xl border border-outline-variant/15 hover:bg-surface-container-lowest flex items-center gap-4 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="font-medium text-on-surface text-sm">Notifications</span>
            </button>
            <button className="w-full text-left p-5 rounded-xl border border-outline-variant/15 hover:bg-surface-container-lowest flex items-center gap-4 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">security</span>
              <span className="font-medium text-on-surface text-sm">Security &amp; Privacy</span>
            </button>
            <button
              onClick={signOut}
              className="w-full text-left p-5 rounded-xl border border-outline-variant/15 hover:bg-error/5 flex items-center gap-4 transition-colors group"
            >
              <span className="material-symbols-outlined text-error">logout</span>
              <span className="font-medium text-error text-sm">Sign Out</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
