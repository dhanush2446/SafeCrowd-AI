// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SAFECROWD AI — COMMAND CENTER (home.jsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useEffect, useRef, useMemo } from "react";
import { planEvent, autoPlaceElements } from "../api";
import CommandMap, { autoCalibrate, makePlanData } from "../components/CommandMap";
import ElementPalette, { ELEMENT_TYPES } from "../components/ElementPalette";
import IntelPanel from "../components/IntelPanel";
import PlanDrawer from "../components/PlanDrawer";

// ── Floating particle background ──
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.05,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 130) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(217, 119, 6, ${0.04 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 119, 6, ${p.opacity})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ── Live clock ──
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="font-mono text-amber-700/70 text-xs tabular-nums tracking-wide">
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </div>
  );
}

// ── Status pulse ──
function StatusPulse() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-2.5 h-2.5">
        <div className="absolute inset-0 rounded-full bg-emerald-500" />
        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
      </div>
      <span className="text-[11px] text-emerald-700 font-medium" style={{ fontFamily: "'Faustina', serif" }}>
        AI Engine Online
      </span>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━ MAIN HOME COMPONENT ━━━━━━━━━━━━━━━━
export default function Home() {
  // ── State ──
  const [mounted, setMounted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [calibrationVenue, setCalibrationVenue] = useState(null); // Only set by search bar, NOT map clicks
  const [activeTool, setActiveTool] = useState(null);
  const [placedElements, setPlacedElements] = useState([]);
  const [customMapUrl, setCustomMapUrl] = useState(null);
  const [elementsLocked, setElementsLocked] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", date: "", attendees: "", capacity: "",
    startTime: "10:00", endTime: "18:00", instructions: "",
    eventType: "concert",
  });

  const EVENT_TYPES = [
    { value: "concert", label: "🎵 Concert / Music" },
    { value: "sports", label: "⚽ Sports" },
    { value: "religious", label: "🕌 Religious / Cultural" },
    { value: "marathon", label: "🏃 Marathon / Race" },
    { value: "exhibition", label: "🎪 Exhibition / Fair" },
    { value: "festival", label: "🎉 Festival" },
    { value: "political", label: "📢 Political Rally" },
    { value: "corporate", label: "🏢 Corporate" },
  ];

  // Results
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Plan viz
  const [showPlanViz, setShowPlanViz] = useState(true); // ON by default
  const [planVizData, setPlanVizData] = useState(null);
  const [calibrating, setCalibrating] = useState(false);

  // Plan drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Left panel collapse
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  // Coordinate pipeline (Ctrl+hover from map → chatbot)
  const [hoveredCoord, setHoveredCoord] = useState(null);
  const [pinnedCoord, setPinnedCoord] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  // Compute attendee bracket for re-calibration trigger
  const attendeeBracket = useMemo(() => {
    const n = Number(form.attendees) || 5000;
    if (n >= 50000) return 50000;
    if (n >= 20000) return 20000;
    if (n >= 5000) return 5000;
    if (n >= 1000) return 1000;
    return 500;
  }, [form.attendees]);

  // ── Auto-calibrate ONLY when venue is selected via search bar ──
  // Re-triggers when attendee bracket or event type changes
  useEffect(() => {
    if (!calibrationVenue || !showPlanViz) return;
    let cancelled = false;
    setCalibrating(true);
    const calOpts = { attendees: Number(form.attendees) || 5000, eventType: form.eventType || "concert" };
    autoCalibrate(calibrationVenue, calOpts)
      .then(({ vizData, elements }) => {
        if (cancelled) return;
        setPlanVizData(vizData);
        setPlacedElements((prev) => [
          ...prev.filter((e) => e.source !== "calibration"),
          ...elements,
        ]);
        setCalibrating(false);
      })
      .catch(() => {
        if (cancelled) return;
        const { vizData, elements } = makePlanData(calibrationVenue, calOpts);
        setPlanVizData(vizData);
        setPlacedElements((prev) => [
          ...prev.filter((e) => e.source !== "calibration"),
          ...elements,
        ]);
        setCalibrating(false);
      });
    return () => { cancelled = true; };
  }, [calibrationVenue, showPlanViz, attendeeBracket, form.eventType]);

  // ── Venue selected from search bar (triggers calibration) ──
  const handleVenueSelect = (loc) => {
    setSelectedLocation(loc);
    setCalibrationVenue(loc); // This triggers auto-calibrate
  };

  // ── Map click (just moves view, does NOT recalibrate) ──
  const handleMapClick = (loc) => {
    setSelectedLocation(loc);
    // Does NOT set calibrationVenue — no recalibration
  };

  // ── Element placement handler ──
  const handleElementPlace = ({ lat, lng }) => {
    if (!activeTool) return;
    const def = ELEMENT_TYPES.find((t) => t.id === activeTool);
    const count = placedElements.filter((e) => e.type === activeTool).length;
    setPlacedElements((prev) => [
      ...prev,
      {
        id: `${activeTool}-${Date.now()}`,
        type: activeTool,
        label: `${def?.label || activeTool} ${count + 1}`,
        lat, lng,
      },
    ]);
  };

  // ── Auto Place Elements via AI API ──
  const handleAutoPlaceApi = async () => {
    try {
      const lat = selectedLocation?.lat || 17.3850;
      const lng = selectedLocation?.lng || 78.4867;
      const res = await autoPlaceElements({
        name: selectedLocation?.name || form.name || "Venue",
        lat: lat,
        lng: lng,
        attendees: Number(form.attendees) || 5000,
        capacity: Number(form.capacity) || 10000,
        eventType: form.eventType || "concert"
      });
      if (res && res.elements) {
        setPlacedElements(res.elements);
      }
    } catch (err) {
      console.error("Auto place error:", err);
    }
  };

  // ── Form submit ──
  const handleSubmit = async () => {
    if (!form.name || !form.name.trim()) {
      setError("⚠️ Please enter an Event Name before generating.");
      return;
    }
    if (!form.attendees || Number(form.attendees) <= 0) {
      setError("⚠️ Please enter expected attendee count (e.g. 5000).");
      return;
    }
    if (!selectedLocation && (!form.location || !form.location.trim())) {
      setError("⚠️ Please search or select a venue location on the map.");
      return;
    }

    setLoading(true); setError(null);
    try {
      const payload = {
        ...form,
        attendees: Number(form.attendees) || 0,
        capacity: Number(form.capacity) || 0,
        location: selectedLocation?.name || form.location || "Unknown Venue",
        placedElements: placedElements.map((e) => ({
          id: e.id, type: e.type, label: e.label, lat: e.lat, lng: e.lng,
        })),
      };
      const data = await planEvent(payload);
      setResult(data);
      setDrawerOpen(true);

      // Auto-calibrate plan visualization if not already done
      const venue = calibrationVenue || selectedLocation;
      const calOpts = { attendees: Number(form.attendees) || 5000, eventType: form.eventType || "concert" };
      if (venue && showPlanViz && !planVizData) {
        try {
          const { vizData, elements } = await autoCalibrate(venue, calOpts);
          setPlanVizData(vizData);
          setPlacedElements((prev) => [
            ...prev.filter((e) => e.source !== "calibration"),
            ...elements,
          ]);
        } catch {
          const { vizData, elements } = makePlanData(venue, calOpts);
          setPlanVizData(vizData);
          setPlacedElements((prev) => [
            ...prev.filter((e) => e.source !== "calibration"),
            ...elements,
          ]);
        }
      }
    } catch (err) {
      setError("Failed to generate plan. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Input style helper ──
  const inputClass = `w-full px-3 py-2 rounded-lg bg-white/70 border border-amber-200/50
    text-sm text-gray-700 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300
    transition-all`;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fff7ed] relative flex flex-col">
      <ParticleField />

      {/* ═══ TOP NAV BAR ═══ */}
      <header
        className={`
          relative z-20 flex items-center justify-between px-5 py-2.5
          bg-white/50 backdrop-blur-md border-b border-amber-100/60
          transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0 -translate-y-2"}
        `}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-amber-800 tracking-tight" style={{ fontFamily: "'Italiana', serif" }}>
            SafeCrowd<span className="text-amber-500"> AI</span>
          </h1>
          <div className="w-px h-5 bg-amber-200/60" />
          <span className="text-[11px] text-amber-600/60 font-medium tracking-widest uppercase hidden md:block"
            style={{ fontFamily: "'Faustina', serif" }}>
            Command Center
          </span>
        </div>

        <div className="flex items-center gap-5">
          <StatusPulse />
          <div className="w-px h-5 bg-amber-200/60 hidden sm:block" />
          <LiveClock />
        </div>
      </header>

      {/* ═══ ELEMENT PALETTE BAR (WITH AI AUTO PLACE) ═══ */}
      <div className={`relative z-20 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <ElementPalette
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          placedElements={placedElements}
          onClearAll={() => setPlacedElements([])}
          locked={elementsLocked}
          onToggleLock={() => { setElementsLocked(!elementsLocked); if (!elementsLocked) setActiveTool(null); }}
          onAutoPlace={handleAutoPlaceApi}
        />
      </div>

      {/* ═══ MAIN 3-COLUMN LAYOUT ═══ */}
      <div
        className={`
          relative z-10 flex-1 flex overflow-hidden
          transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0 translate-y-4"}
        `}
      >
        {/* ── LEFT PANEL: Event Form ── */}
        <aside
          className={`
            relative flex-shrink-0 bg-white/40 backdrop-blur-sm
            border-r border-amber-100/60 overflow-hidden
            transition-all duration-500 ease-out
            ${leftCollapsed ? "w-12" : "w-[340px]"}
          `}
        >
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="absolute top-3 right-2 z-10 w-6 h-6 rounded-full bg-amber-100/80
                       text-amber-600 text-xs flex items-center justify-center
                       hover:bg-amber-200 transition-colors"
          >
            {leftCollapsed ? "›" : "‹"}
          </button>

          {!leftCollapsed && (
            <div className="h-full overflow-y-auto cc-scroll p-5 pb-24 space-y-5">
              {/* Form header */}
              <div>
                <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2"
                  style={{ fontFamily: "'Faustina', serif" }}>
                  📋 Event Details
                </h2>
                <p className="text-[11px] text-gray-400 mt-1" style={{ fontFamily: "'Faustina', serif" }}>
                  Fill in your event info, then generate a plan
                </p>
              </div>

              {/* Location badge */}
              {selectedLocation && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/60 rounded-lg border border-amber-200/40">
                  <span className="text-amber-600 text-sm">📌</span>
                  <span className="text-xs text-gray-600 truncate" style={{ fontFamily: "'Faustina', serif" }}>
                    {selectedLocation.name}
                  </span>
                </div>
              )}

              {/* Event name */}
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Event Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Music Festival 2026" className={inputClass} />
              </div>

              {/* Event type */}
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Event Type</label>
                <select name="eventType" value={form.eventType} onChange={handleChange}
                  className={inputClass + " cursor-pointer"}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} />
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Start</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">End</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              {/* Crowd numbers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Expected Crowd</label>
                  <input name="attendees" value={form.attendees} onChange={handleChange}
                    placeholder="25000" className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Venue Capacity</label>
                  <input name="capacity" value={form.capacity} onChange={handleChange}
                    placeholder="30000" className={inputClass} />
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Special Instructions</label>
                <textarea name="instructions" value={form.instructions} onChange={handleChange}
                  placeholder="VIP area, rain contingency, etc."
                  rows={3} className={inputClass + " resize-none"} />
              </div>

              {/* Element stats */}
              {placedElements.length > 0 && (
                <div className="px-3 py-2.5 bg-white/60 rounded-lg border border-amber-200/40">
                  <h4 className="text-[10px] uppercase tracking-widest text-amber-600/60 font-semibold mb-2">
                    Placed Elements
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ELEMENT_TYPES.map((t) => {
                      const count = placedElements.filter((e) => e.type === t.id).length;
                      if (count === 0) return null;
                      return (
                        <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                          bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/50">
                          {t.emoji} {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`
                  w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300
                  flex items-center justify-center gap-2
                  ${loading
                    ? "bg-amber-400 text-white cursor-wait"
                    : "bg-amber-600 text-white shadow-lg shadow-amber-400/25 hover:bg-amber-700 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                  }
                `}
                style={{ fontFamily: "'Faustina', serif" }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  "🚀 Generate Safety Plan"
                )}
              </button>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {/* Calibration toggle */}
              {selectedLocation && (
                <button
                  type="button"
                  onClick={() => setShowPlanViz(!showPlanViz)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 border flex items-center justify-center gap-2
                    ${showPlanViz
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "bg-white/60 text-amber-600 border-amber-200 hover:bg-amber-50"}`}
                  style={{ fontFamily: "'Faustina', serif" }}
                >
                  {calibrating && <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />}
                  📐 {showPlanViz ? "Deactivate" : "Activate"} Auto-Calibration
                </button>
              )}
            </div>
          )}
        </aside>

        {/* ── CENTER: Interactive Map ── */}
        <main className="flex-1 relative p-2">
          <CommandMap
            location={selectedLocation}
            onMapClick={handleMapClick}
            onVenueSelect={handleVenueSelect}
            activeTool={activeTool}
            placedElements={placedElements}
            onElementPlace={handleElementPlace}
            showPlanViz={showPlanViz}
            planVizData={planVizData}
            customMapUrl={customMapUrl}
            onCustomMapUpload={setCustomMapUrl}
            onCustomMapRemove={() => setCustomMapUrl(null)}
            onCoordHover={setHoveredCoord}
            onCoordPin={(c) => { setPinnedCoord(c); setHoveredCoord(null); }}
            elementsLocked={elementsLocked}
            onRemoveElement={(id) => setPlacedElements((prev) => prev.filter((e) => e.id !== id))}
          />
        </main>

        {/* ── RIGHT PANEL: Intel (Alerts + Chat) ── */}
        <aside className="hidden lg:block w-[300px] flex-shrink-0 bg-white/40 backdrop-blur-sm border-l border-amber-100/60">
          <IntelPanel
            alerts={result?.alerts || []}
            result={result}
            selectedLocation={selectedLocation}
            placedElements={placedElements}
            onPlaceElement={(el) => {
              const def = ELEMENT_TYPES.find((t) => t.id === el.type);
              const count = placedElements.filter((e) => e.type === el.type).length;
              setPlacedElements((prev) => [
                ...prev,
                {
                  id: `${el.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  type: el.type,
                  label: el.label || `${def?.label || el.type} ${count + 1}`,
                  lat: el.lat,
                  lng: el.lng,
                },
              ]);
            }}
            onFlyTo={(loc) => setSelectedLocation(loc)}
            onClearElements={() => setPlacedElements([])}
            onRegeneratePlan={handleSubmit}
            hoveredCoord={hoveredCoord}
            pinnedCoord={pinnedCoord}
            onClearPinnedCoord={() => setPinnedCoord(null)}
            onSetPlacedElements={setPlacedElements}
          />
        </aside>
      </div>

      {/* ═══ BOTTOM PLAN DRAWER ═══ */}
      <PlanDrawer result={result} isOpen={drawerOpen} onToggle={() => setDrawerOpen(!drawerOpen)} />
    </div>
  );
}