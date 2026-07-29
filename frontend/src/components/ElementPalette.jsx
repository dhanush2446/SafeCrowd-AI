// ── Element type definitions ──
export const ELEMENT_TYPES = [
  { id: "gate",      emoji: "🚪", label: "Entry Gate",   color: "#2563eb" },
  { id: "exit",      emoji: "🚨", label: "Exit",         color: "#dc2626" },
  { id: "medical",   emoji: "🏥", label: "Medical",      color: "#059669" },
  { id: "security",  emoji: "🛡️", label: "Security",     color: "#7c3aed" },
  { id: "parking",   emoji: "🅿️", label: "Parking",      color: "#6366f1" },
  { id: "stage",     emoji: "🎤", label: "Stage",        color: "#d97706" },
  { id: "barricade", emoji: "🚧", label: "Barricade",    color: "#ea580c" },
  { id: "cctv",      emoji: "📹", label: "CCTV",         color: "#64748b" },
];

export default function ElementPalette({ activeTool, setActiveTool, placedElements, onClearAll, locked, onToggleLock, onAutoPlace }) {
  return (
    <div className="glass border-t border-amber-100/60 px-4 py-2.5 flex items-center gap-2 no-print">
      <span
        className="text-[10px] uppercase tracking-[0.15em] text-amber-600/60 font-semibold mr-2 hidden md:block"
        style={{ fontFamily: "'Faustina', serif" }}
      >
        Place
      </span>

      {onAutoPlace && (
        <button
          type="button"
          onClick={onAutoPlace}
          disabled={locked}
          title="Intelligently auto-place safety elements based on venue spatial analysis"
          className="palette-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600 transition-all border border-amber-400 mr-1"
        >
          <span>✨</span>
          <span className="hidden sm:inline">AI Auto-Place</span>
        </button>
      )}

      {ELEMENT_TYPES.map((t) => {
        const count = placedElements.filter((e) => e.type === t.id).length;
        const isActive = activeTool === t.id;

        return (
          <button
            key={t.id}
            onClick={() => !locked && setActiveTool(isActive ? null : t.id)}
            title={locked ? "Unlock to place elements" : t.label}
            disabled={locked}
            className={`
              palette-btn relative flex items-center gap-1.5
              px-3 py-1.5 rounded-lg text-xs font-medium
              border transition-all
              ${locked
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                : isActive
                  ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-400/25"
                  : "bg-white/60 text-gray-700 border-amber-200/50 hover:border-amber-300"
              }
            `}
          >
            <span className="text-sm">{t.emoji}</span>
            <span className="hidden lg:inline">{t.label}</span>

            {count > 0 && (
              <span
                className={`
                  absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
                  text-[9px] font-bold flex items-center justify-center
                  ${isActive ? "bg-white text-amber-700" : "bg-amber-600 text-white"}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      {/* Divider + Lock + Clear */}
      {placedElements.length > 0 && (
        <>
          <div className="w-px h-6 bg-amber-200/50 mx-1" />
          <button
            type="button"
            onClick={onToggleLock}
            title={locked ? "Unlock elements (allow dragging)" : "Lock elements (prevent dragging)"}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1
              ${locked
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
              }`}
          >
            <span className="text-sm">{locked ? "🔒" : "🔓"}</span>
            <span className="hidden md:inline">{locked ? "Locked" : "Lock"}</span>
          </button>
          {!locked && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          )}
        </>
      )}
    </div>
  );
}
