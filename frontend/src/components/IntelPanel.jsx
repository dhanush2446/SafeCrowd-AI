import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "../api";

// ── Parse [ACTION]...[/ACTION] blocks from AI response ──
function parseActions(text) {
  const actionRegex = /\[ACTION\](.*?)\[\/ACTION\]/gs;
  const actions = [];
  let match;
  while ((match = actionRegex.exec(text)) !== null) {
    try {
      actions.push(JSON.parse(match[1].trim()));
    } catch {
      // skip malformed JSON
    }
  }
  // Strip action blocks from display text
  const cleanText = text.replace(/\[ACTION\].*?\[\/ACTION\]/gs, "").trim();
  return { actions, cleanText };
}

// ── Action chip display ──
function ActionChip({ action }) {
  const icons = {
    add_element: "📌",
    fly_to: "🗺️",
    clear_elements: "🗑️",
    regenerate_plan: "🔄",
  };
  const labels = {
    add_element: `Placed: ${action.label || action.element_type}`,
    fly_to: `Navigated to: ${action.location}`,
    clear_elements: "Cleared all elements",
    regenerate_plan: "Plan regenerated",
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                    bg-emerald-50 border border-emerald-200 text-emerald-700
                    text-[10px] font-semibold mt-1 mr-1 animate-fadeIn">
      <span>{icons[action.type] || "⚡"}</span>
      <span>{labels[action.type] || action.type}</span>
      <span className="text-emerald-400">✓</span>
    </div>
  );
}

// ── Coordinate HUD Box ──
function CoordHUD({ hoveredCoord, pinnedCoord, onInsert, onClear }) {
  const coord = pinnedCoord || hoveredCoord;
  if (!coord) return null;

  const isPinned = !!pinnedCoord;
  const coordStr = `@${coord.lat.toFixed(5)},${coord.lng.toFixed(5)}`;

  return (
    <div className={`
      mx-3 mb-2 px-3 py-2 rounded-xl border text-xs font-mono
      transition-all duration-200 animate-fadeIn
      ${isPinned
        ? "bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-100"
        : "bg-amber-50/80 border-amber-200/60 shadow-sm"
      }
    `}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-sm ${isPinned ? "animate-pulse" : ""}`}>
            {isPinned ? "📍" : "🎯"}
          </span>
          <div className="min-w-0">
            <span className={`font-bold ${isPinned ? "text-emerald-700" : "text-amber-700"}`}>
              {coordStr}
            </span>
            <p className="text-[9px] text-gray-400 mt-0.5">
              {isPinned ? "Pinned — click Use to insert" : "Hold Ctrl + hover • Click to pin"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isPinned && (
            <>
              <button
                type="button"
                onClick={() => onInsert(coordStr)}
                className="px-2 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-semibold
                           hover:bg-emerald-700 transition-colors"
              >
                Use
              </button>
              <button
                type="button"
                onClick={onClear}
                className="px-1.5 py-1 rounded-md text-gray-400 hover:text-red-500 text-[10px] transition-colors"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntelPanel({
  alerts = [],
  result,
  onPlaceElement,
  onFlyTo,
  onClearElements,
  onRegeneratePlan,
  selectedLocation,
  placedElements = [],
  hoveredCoord,
  pinnedCoord,
  onClearPinnedCoord,
  onSetPlacedElements,
}) {
  const [tab, setTab] = useState("alerts"); // "alerts" | "chat"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [undoStack, setUndoStack] = useState([]); // snapshots of placedElements before each action

  // Keep fresh references to callbacks (avoids stale closure in async sendMessage)
  const callbacksRef = useRef({});
  callbacksRef.current = { onPlaceElement, onFlyTo, onClearElements, onRegeneratePlan, onClearPinnedCoord, onSetPlacedElements };
  const selectedLocationRef = useRef(selectedLocation);
  selectedLocationRef.current = selectedLocation;
  const placedElementsRef = useRef(placedElements);
  placedElementsRef.current = placedElements;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-switch to chat tab when a coord is pinned
  useEffect(() => {
    if (pinnedCoord) setTab("chat");
  }, [pinnedCoord]);

  // ── Insert coordinate into chat input ──
  const insertCoord = (coordStr) => {
    setInput((prev) => {
      const needsSpace = prev.length > 0 && !prev.endsWith(" ");
      return prev + (needsSpace ? " " : "") + coordStr + " ";
    });
    // Focus the input
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Execute parsed actions (uses refs for fresh callbacks) ──
  const executeActions = (actions, coordContext) => {
    const cbs = callbacksRef.current;
    let placedCount = 0;
    for (const action of actions) {
      switch (action.type) {
        case "add_element": {
          // Use coord from action if provided, else use coordContext, else offset from venue
          let lat = action.lat;
          let lng = action.lng;
          if (lat == null || lng == null) {
            if (coordContext) {
              // Slight random offset so multiple elements don't stack
              lat = coordContext.lat + (Math.random() - 0.5) * 0.001;
              lng = coordContext.lng + (Math.random() - 0.5) * 0.001;
            } else {
              const base = selectedLocationRef.current || { lat: 17.385, lng: 78.4867 };
              lat = base.lat + (Math.random() - 0.5) * 0.006;
              lng = base.lng + (Math.random() - 0.5) * 0.006;
            }
          }
          if (cbs.onPlaceElement) {
            console.log("[SafeCrowd] Placing element:", action.element_type, action.label, "at", lat, lng);
            cbs.onPlaceElement({
              type: action.element_type || "security",
              label: action.label || `${action.element_type} ${placedCount + 1}`,
              lat,
              lng,
            });
            placedCount++;
          }
          break;
        }
        case "fly_to":
          if (cbs.onFlyTo && action.location) {
            fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(action.location)}&format=json&limit=1&countrycodes=in`
            )
              .then((r) => r.json())
              .then((data) => {
                if (data?.[0]) {
                  cbs.onFlyTo({
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    name: data[0].display_name,
                  });
                }
              })
              .catch(() => {});
          }
          break;
        case "clear_elements":
          if (cbs.onClearElements) cbs.onClearElements();
          break;
        case "remove_element": {
          // Remove by type or label
          if (cbs.onSetPlacedElements) {
            cbs.onSetPlacedElements((prev) =>
              prev.filter((el) => {
                if (action.element_type && el.type === action.element_type) return false;
                if (action.label && el.label.toLowerCase().includes(action.label.toLowerCase())) return false;
                return true;
              })
            );
          }
          break;
        }
        case "regenerate_plan":
          if (cbs.onRegeneratePlan) cbs.onRegeneratePlan();
          break;
        default:
          break;
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);

    // Snapshot current elements for undo
    const snapshot = [...placedElementsRef.current];

    const messageText = input.trim();
    setInput("");
    setSending(true);

    // Extract coordinate context from the message (look for @lat,lng pattern)
    let coordContext = null;
    const coordMatch = messageText.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      coordContext = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
    }

    try {
      // Build context prefix
      let contextPrefix = "";
      if (selectedLocation) {
        contextPrefix += `[Context: Current venue is at "${selectedLocation.name}". ${placedElements.length} elements on map.]\n`;
      }
      if (coordContext) {
        contextPrefix += `[Coordinate Reference: The user is referring to GPS location lat=${coordContext.lat.toFixed(5)}, lng=${coordContext.lng.toFixed(5)}. When placing elements, use these EXACT coordinates by including "lat" and "lng" in the action JSON.]\n`;
      }
      contextPrefix += "\n";

      // Send CLEAN history (stripped of action blocks) so the AI doesn't repeat past actions
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithAI(contextPrefix + messageText, history);

      // Parse actions from the response
      const { actions, cleanText } = parseActions(res.response);

      // Execute any actions with coordinate context
      if (actions.length > 0) {
        executeActions(actions, coordContext);
      }

      // Clear pinned coord after using it
      if (coordContext && callbacksRef.current.onClearPinnedCoord) callbacksRef.current.onClearPinnedCoord();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cleanText,
          rawContent: res.response,
          actions: actions,
        },
      ]);

      // Save snapshot for undo (only if actions were performed)
      if (actions.length > 0) {
        setUndoStack((prev) => [...prev, snapshot]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, couldn't reach AI service.", actions: [] },
      ]);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex border-b border-amber-100/60">
        {[
          { id: "alerts", label: "Alerts", icon: "🔔" },
          { id: "chat", label: "AI Chat", icon: "🤖" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5
              ${tab === t.id
                ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/40"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <span>{t.icon}</span> {t.label}
            {t.id === "alerts" && alerts.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                {alerts.length}
              </span>
            )}
            {t.id === "chat" && (hoveredCoord || pinnedCoord) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        ))}
        {/* Undo + Clear chat buttons */}
        {tab === "chat" && messages.length > 0 && (
          <>
            {undoStack.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  // Restore elements to previous snapshot
                  const prev = undoStack[undoStack.length - 1];
                  if (callbacksRef.current.onSetPlacedElements) {
                    callbacksRef.current.onSetPlacedElements(prev);
                  }
                  setUndoStack((s) => s.slice(0, -1));
                  // Remove last user+assistant message pair
                  setMessages((msgs) => {
                    const copy = [...msgs];
                    // Remove last assistant msg
                    if (copy.length > 0 && copy[copy.length - 1].role === "assistant") copy.pop();
                    // Remove last user msg
                    if (copy.length > 0 && copy[copy.length - 1].role === "user") copy.pop();
                    return copy;
                  });
                }}
                title="Undo last action"
                className="px-2.5 py-1 text-gray-400 hover:text-amber-600 transition-colors flex items-center"
              >
                <span className="text-sm">↩️</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => { setMessages([]); setUndoStack([]); }}
              title="Clear chat"
              className="px-2.5 py-1 text-gray-400 hover:text-red-500 transition-colors flex items-center"
            >
              <span className="text-sm">🗑️</span>
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto cc-scroll p-4">
        {tab === "alerts" ? (
          <div className="space-y-2.5">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🛡️</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: "'Faustina', serif" }}>
                  Generate a plan to see alerts
                </p>
              </div>
            ) : (
              alerts.map((alert, i) => {
                const isWarning = alert.includes("WARNING") || alert.includes("CAUTION");
                const isCritical = alert.includes("CRITICAL") || alert.includes("HIGH ALERT");
                return (
                  <div
                    key={i}
                    className={`px-3 py-2.5 rounded-xl text-xs leading-relaxed border transition-all
                      ${isCritical ? "bg-red-50 border-red-200 text-red-700" :
                        isWarning ? "bg-amber-50 border-amber-200 text-amber-700" :
                        "bg-blue-50 border-blue-200 text-blue-700"}`}
                    style={{ fontFamily: "'Faustina', serif" }}
                  >
                    <span className="mr-1.5">{isCritical ? "🚨" : isWarning ? "⚠️" : "ℹ️"}</span>
                    {alert}
                  </div>
                );
              })
            )}

            {/* Risk summary card */}
            {result && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
                <h4 className="text-xs uppercase tracking-widest text-amber-600/70 font-semibold mb-3"
                  style={{ fontFamily: "'Faustina', serif" }}>
                  Risk Summary
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-amber-800">{result.riskCategory}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                    ${result.stampedeProb > 70 ? "bg-red-100 text-red-700" :
                      result.stampedeProb > 40 ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"}`}>
                    {result.stampedeProb}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${result.stampedeProb}%`,
                      background: result.stampedeProb > 70
                        ? "linear-gradient(90deg, #ef4444, #dc2626)"
                        : result.stampedeProb > 40
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : "linear-gradient(90deg, #22c55e, #16a34a)",
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-right">Stampede Probability</p>
              </div>
            )}
          </div>
        ) : (
          /* Chat tab */
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🤖</p>
                <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: "'Faustina', serif" }}>
                  AI-powered event assistant
                </p>
                <p className="text-[10px] text-emerald-600 font-medium mb-3">
                  ✨ I can place elements & answer location queries!
                </p>
                <div className="space-y-1.5">
                  {[
                    "Add 3 medical posts around the venue",
                    "Place security checkpoints at all entrances",
                    "List hospitals near this location",
                  ].map((q) => (
                    <button key={q} type="button" onClick={() => { setInput(q); }}
                      className="block w-full text-left text-[11px] text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
                      → {q}
                    </button>
                  ))}
                </div>
                <div className="mt-4 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60">
                  <p className="text-[10px] text-emerald-700 font-semibold mb-1">💡 Pro Tip: Coordinate Mode</p>
                  <p className="text-[9px] text-emerald-600 leading-relaxed">
                    Hold <kbd className="px-1 py-0.5 bg-emerald-100 rounded text-[8px] font-bold border border-emerald-300">Ctrl</kbd> and
                    hover over the map to track coordinates. Click to pin, then ask the AI anything about that exact spot!
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`max-w-[90%] px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user" ? "chat-user ml-auto" : "chat-ai"
                }`}>
                  <div className="prose prose-sm prose-amber max-w-none dark:prose-invert">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {/* Show action chips below AI messages */}
                {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                  <div className="mt-1.5 ml-1 flex flex-wrap gap-1">
                    {msg.actions.map((action, j) => (
                      <ActionChip key={j} action={action} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="chat-ai max-w-[90%] px-3.5 py-2.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coordinate HUD (only visible on chat tab) */}
      {tab === "chat" && (
        <CoordHUD
          hoveredCoord={hoveredCoord}
          pinnedCoord={pinnedCoord}
          onInsert={insertCoord}
          onClear={onClearPinnedCoord}
        />
      )}

      {/* Chat input (only visible on chat tab) */}
      {tab === "chat" && (
        <div className="p-3 border-t border-amber-100/60">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pinnedCoord ? `Ask about @${pinnedCoord.lat.toFixed(3)},${pinnedCoord.lng.toFixed(3)}…` : "Ask or command…"}
              className="flex-1 px-3 py-2 rounded-lg bg-white/70 border border-amber-200/60
                         text-xs text-gray-700 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition-all"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold
                         hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
