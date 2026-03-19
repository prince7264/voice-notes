export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[#141416] border border-[#2A2A2E] flex items-center justify-center">
        <svg className="w-9 h-9 text-[#2A2A2E]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 17.93V22h2v-1.07A8.001 8.001 0 0 0 20 13h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
        </svg>
      </div>
      <div>
        <p className="text-[#F5F5F7] font-medium">No notes yet</p>
        <p className="text-sm text-[#48484A] mt-1">
          Hold the button below to capture your first thought
        </p>
      </div>
    </div>
  );
}
