export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-6">
      {/* Mic icon with atmospheric glow */}
      <div className="relative">
        <div className="absolute -inset-8 bg-tertiary-fixed/20 blur-3xl rounded-full" />
        <div className="absolute -inset-16 bg-primary-fixed/8 blur-[60px] rounded-full" />
        <div className="relative w-32 h-32 bg-surface-container-lowest rounded-3xl shadow-ambient flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
          {/* Waveform bars */}
          <div className="flex items-center gap-1.5 h-12 relative z-10">
            {[6, 12, 20, 24, 16, 8].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-primary-container"
                style={{ height: `${h}px`, opacity: 0.25 + i * 0.1 }}
              />
            ))}
          </div>
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">mic</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
          No notes yet
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-[220px] mx-auto">
          Tap Record to capture your first voice note — instantly transcribed.
        </p>
      </div>

      <span className="material-symbols-outlined text-outline-variant animate-bounce">arrow_downward</span>
    </div>
  );
}
