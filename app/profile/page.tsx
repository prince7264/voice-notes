"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

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

export default function ProfilePage() {
  const { data: session, update } = useSession();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setAge(session.user.age?.toString() ?? "");
      setProfession(session.user.profession ?? "");
    }
  }, [session?.user]);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isKnownProfession = PROFESSIONS.includes(profession);

  const handleSave = async () => {
    setSaving(true);
    const finalProfession =
      profession === "Other" ? otherProfession.trim() || profession : profession;

    await update({
      name: name.trim(),
      age: parseInt(age),
      profession: finalProfession,
    });

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#8E8E93] hover:text-[#F5F5F7] transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              className="w-20 h-20 rounded-full border-2 border-[#2A2A2E]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="text-center">
            <p className="text-lg font-semibold text-[#F5F5F7]">{session?.user?.name}</p>
            <p className="text-sm text-[#48484A]">{session?.user?.email}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#141416] border border-[#2A2A2E] rounded-2xl p-5 mb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F5F5F7]">Profile</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[#6366F1] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            /* Edit mode */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8E8E93] uppercase tracking-wider font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8E8E93] uppercase tracking-wider font-medium">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={13}
                  max={100}
                  className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8E8E93] uppercase tracking-wider font-medium">
                  Profession
                </label>
                <select
                  value={isKnownProfession ? profession : "Other"}
                  onChange={(e) => setProfession(e.target.value)}
                  className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#6366F1] transition-colors"
                >
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p} className="bg-[#1C1C1F]">{p}</option>
                  ))}
                </select>
                {profession === "Other" && (
                  <input
                    type="text"
                    value={otherProfession || (!isKnownProfession ? profession : "")}
                    onChange={(e) => setOtherProfession(e.target.value)}
                    placeholder="Please specify"
                    className="mt-1 bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] placeholder-[#48484A] focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 text-sm text-[#8E8E93] border border-[#2A2A2E] rounded-xl py-2.5 hover:bg-[#1C1C1F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 text-sm bg-[#6366F1] hover:bg-[#5254CC] disabled:opacity-60 text-white rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2"
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
            /* View mode */
            <div className="flex flex-col gap-3">
              <ProfileRow label="Name" value={session?.user?.name ?? "—"} />
              <ProfileRow label="Age" value={session?.user?.age?.toString() ?? "—"} />
              <ProfileRow label="Profession" value={session?.user?.profession ?? "—"} />
            </div>
          )}

          {/* Saved confirmation */}
          {saved && (
            <p className="text-xs text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/20 rounded-lg px-3 py-2 text-center">
              Profile updated ✓
            </p>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 text-sm text-[#FF453A] border border-[#FF453A]/20 hover:bg-[#FF453A]/10 rounded-xl py-3 transition-colors"
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
      <span className="text-xs text-[#48484A] uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm text-[#F5F5F7] text-right">{value}</span>
    </div>
  );
}
