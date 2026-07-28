import { useState } from "react";

import ReactMarkdown from "react-markdown";

export default function PlanDrawer({ result, isOpen, onToggle }) {
  const [activeSection, setActiveSection] = useState(0);

  if (!result) return null;

  const strategyText = result?.trafficPlan?.detailed_strategy || "";

  // Split strategy into numbered sections
  const sections = strategyText
    .split(/(?=\d+\.\s+\*\*)/g)
    .filter((s) => s.trim().length > 0);

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 lg:right-[300px] z-50
        bg-white/95 backdrop-blur-xl
        border-t border-amber-200/60
        shadow-[0_-4px_30px_rgba(0,0,0,0.08)]
        transition-all duration-500 ease-out
        ${isOpen ? "translate-y-0" : "translate-y-[calc(100%-48px)]"}
      `}
      style={{ maxHeight: "60vh" }}
    >
      {/* Drag handle / Toggle bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-amber-50/60 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 rounded-full bg-amber-300 group-hover:bg-amber-400 transition-colors" />
          <h3
            className="text-sm font-semibold text-amber-800 flex items-center gap-2"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            📋 Safety & Traffic Strategy
            {result.riskCategory && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                ${result.riskCategory === "High" || result.riskCategory === "Critical"
                  ? "bg-red-100 text-red-600"
                  : result.riskCategory === "Medium"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
                }`}>
                {result.riskCategory} Risk
              </span>
            )}
          </h3>
        </div>
        <span className={`text-amber-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          ▲
        </span>
      </button>

      {/* Content */}
      <div className="overflow-y-auto cc-scroll px-6 pb-6" style={{ maxHeight: "calc(60vh - 48px)" }}>
        {sections.length > 1 ? (
          <>
            {/* Section tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {sections.map((sec, i) => {
                const title = sec.match(/\*\*(.*?)\*\*/)?.[1] || `Section ${i + 1}`;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveSection(i)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${activeSection === i
                        ? "bg-amber-600 text-white shadow-md"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                  >
                    {title.length > 25 ? title.substring(0, 25) + "…" : title}
                  </button>
                );
              })}
            </div>

            {/* Active section content */}
            <div className="prose prose-sm prose-amber max-w-none text-gray-700 leading-relaxed">
              <ReactMarkdown>
                {sections[activeSection]}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          /* Fallback: render full text */
          <div className="prose prose-sm prose-amber max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown>
              {strategyText}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
