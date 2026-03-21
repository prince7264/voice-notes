"use client";

import { useAuth } from "@/contexts/AuthContext";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SideDrawer({ open, onClose }: SideDrawerProps) {
  const { user, profile, signOut } = useAuth();

  const initials = profile?.name
    ? profile.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface shadow-2xl flex flex-col slide-drawer">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-on-primary font-bold text-lg">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface truncate" style={{ fontFamily: "Manrope, sans-serif" }}>
                {profile?.name || user?.displayName || "User"}
              </p>
              <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {[
            { icon: "home", label: "Home", active: true },
            { icon: "mic", label: "Record" },
            { icon: "search", label: "Search" },
            { icon: "bookmark", label: "Saved Notes" },
            { icon: "analytics", label: "Insights" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={onClose}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors ${
                item.active
                  ? "bg-primary-container/30 text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 space-y-1">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors text-left">
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-error hover:bg-error-container/20 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
