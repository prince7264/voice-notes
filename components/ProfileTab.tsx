"use client";

import { useState, useEffect } from "react";
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

export function ProfileTab() {
  const { user, profile, signOut, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age?.toString() ?? "");
      setProfession(profile.profession ?? "");
    }
  }, [profile]);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const isKnownProfession = PROFESSIONS.includes(profession);

  const handleSave = async () => {
    setSaving(true);
    const finalProfession =
      profession === "Other"
        ? otherProfession.trim() || profession
        : profession;

    await updateProfile({
      name: name.trim(),
      age: parseInt(age),
      profession: finalProfession,
    });

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-28">
      <div className="max-w-sm mx-auto w-full px-4 py-8">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-[#F1F1FA] mb-8">Profile</h1>

        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={profile?.name ?? "Avatar"}
              className="w-24 h-24 rounded-full border-2 border-[#252538] shadow-xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {initials}
            </div>
          )}
          <div className="text-center">
            <p className="text-lg font-semibold text-[#F1F1FA]">{profile?.name || user?.displayName}</p>
            <p className="text-sm text-[#4A4A65] mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#13141F] border border-[#252538] rounded-3xl p-5 mb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F1F1FA]">Your Details</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[#6366F1] font-medium hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8181A0] uppercase tracking-wider font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#18181F] border border-[#252538] rounded-xl px-3 py-2.5 text-sm text-[#F1F1FA] focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8181A0] uppercase tracking-wider font-semibold">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={13}
                  max={100}
                  className="bg-[#18181F] border border-[#252538] rounded-xl px-3 py-2.5 text-sm text-[#F1F1FA] focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8181A0] uppercase tracking-wider font-semibold">
                  Profession
                </label>
                <select
                  value={isKnownProfession ? profession : "Other"}
                  onChange={(e) => setProfession(e.target.value)}
                  className="bg-[#18181F] border border-[#252538] rounded-xl px-3 py-2.5 text-sm text-[#F1F1FA] focus:outline-none focus:border-[#6366F1] transition-colors appearance-none"
                >
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p} className="bg-[#18181F]">{p}</option>
                  ))}
                </select>
                {profession === "Other" && (
                  <input
                    type="text"
                    value={otherProfession || (!isKnownProfession ? profession : "")}
                    onChange={(e) => setOtherProfession(e.target.value)}
                    placeholder="Please specify"
                    className="bg-[#18181F] border border-[#252538] rounded-xl px-3 py-2.5 text-sm text-[#F1F1FA] placeholder-[#4A4A65] focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 text-sm text-[#8181A0] border border-[#252538] rounded-xl py-2.5 hover:bg-[#18181F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 text-sm bg-[#6366F1] hover:bg-[#5153D8] disabled:opacity-60 text-white rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <ProfileRow label="Name" value={profile?.name ?? "—"} />
              <ProfileRow label="Age" value={profile?.age?.toString() ?? "—"} />
              <ProfileRow label="Profession" value={profile?.profession ?? "—"} />
            </div>
          )}

          {saved && (
            <p className="text-xs text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl px-3 py-2.5 text-center">
              Profile updated ✓
            </p>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-sm text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/10 rounded-2xl py-3.5 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-[#4A4A65] uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-sm text-[#F1F1FA] text-right">{value}</span>
    </div>
  );
}
