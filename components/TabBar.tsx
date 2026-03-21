"use client";

export type TabName = "home" | "record" | "search" | "settings";

interface TabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: TabName; icon: string; label: string }[] = [
    { id: "home",     icon: "home",       label: "Home" },
    { id: "record",   icon: "mic_none",   label: "Record" },
    { id: "search",   icon: "search",     label: "Search" },
    { id: "settings", icon: "settings",   label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-8px_30px_rgba(25,28,29,0.05)] rounded-t-3xl">
        <div className="flex items-center justify-around px-4 pb-safe pt-3 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isRecord = tab.id === "record";

            if (isRecord) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex flex-col items-center gap-0.5 active:scale-90 transition-all duration-300 ease-out"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-0.5 transition-all duration-300 ${
                      isActive
                        ? "bg-primary scale-105 shadow-primary/20"
                        : "bg-gradient-to-br from-primary to-primary-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-white text-2xl">
                      {isActive ? "mic" : "mic_none"}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide uppercase transition-colors ${
                      isActive ? "text-primary" : "text-on-surface-variant/70"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-all duration-300 ease-out"
              >
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-300 ${
                    isActive
                      ? "bg-primary-fixed-dim/40 text-primary"
                      : "text-on-surface-variant/60 hover:text-primary"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" } : {}}
                  >
                    {tab.icon}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide uppercase mt-0.5">
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
