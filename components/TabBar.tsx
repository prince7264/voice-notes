"use client";

export type TabName = "home" | "record" | "profile";

interface TabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#09090F]/95 backdrop-blur-xl border-t border-[#252538]">
      <div className="flex items-center justify-around max-w-lg mx-auto px-4 pb-safe">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center gap-1 px-6 py-3 transition-colors ${
            activeTab === "home" ? "text-[#6366F1]" : "text-[#4A4A65] hover:text-[#8181A0]"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "home" ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide">Home</span>
        </button>

        {/* Record Tab — prominent center button */}
        <button
          onClick={() => onTabChange("record")}
          className={`relative flex flex-col items-center -mt-5 transition-transform active:scale-95 ${
            activeTab === "record" ? "scale-105" : ""
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            activeTab === "record"
              ? "bg-[#6366F1] shadow-[#6366F1]/40"
              : "bg-[#6366F1] shadow-[#6366F1]/25 hover:bg-[#5153D8]"
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className={`text-[10px] font-medium mt-1 tracking-wide ${
            activeTab === "record" ? "text-[#6366F1]" : "text-[#4A4A65]"
          }`}>Record</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center gap-1 px-6 py-3 transition-colors ${
            activeTab === "profile" ? "text-[#6366F1]" : "text-[#4A4A65] hover:text-[#8181A0]"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "profile" ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide">Profile</span>
        </button>
      </div>
    </nav>
  );
}
