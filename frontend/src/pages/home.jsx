// Home.jsx
import { useState, useEffect, useRef } from "react";
import PlanFormCard from "../components/planformcard";

// ── Floating particle background ──
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(217, 119, 6, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 119, 6, ${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

// ── Live clock widget ──
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="font-mono text-amber-700/80 text-sm tabular-nums tracking-wide">
      {time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </div>
  );
}

// ── Interactive tip carousel ──
function TipCarousel() {
  const tips = [
    {
      icon: "🏟️",
      title: "Venue Capacity",
      text: "Always plan for 15–20% more than expected attendance.",
    },
    {
      icon: "🚦",
      title: "Traffic Windows",
      text: "Stagger entry times to reduce peak congestion by up to 40%.",
    },
    {
      icon: "🛡️",
      title: "Safety Zones",
      text: "Maintain at least 2 emergency exits per 1,000 attendees.",
    },
    {
      icon: "📡",
      title: "Real-time Monitoring",
      text: "Deploy crowd sensors at choke points for live density feeds.",
    },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="space-y-3">
      <h4
        className="text-xs uppercase tracking-[0.2em] text-amber-600/70 font-semibold mb-4"
        style={{ fontFamily: "'Faustina', serif" }}
      >
        Smart Tips
      </h4>
      {tips.map((tip, i) => (
        <div
          key={i}
          onClick={() => setActive(i)}
          className={`
            cursor-pointer rounded-xl px-4 py-3 
            transition-all duration-500 ease-out
            ${
              active === i
                ? "bg-amber-600 text-white shadow-lg shadow-amber-400/30 scale-[1.02]"
                : "bg-white/50 text-gray-600 hover:bg-white/80 border border-transparent hover:border-amber-200"
            }
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{tip.icon}</span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  active === i ? "text-white" : "text-amber-800"
                }`}
                style={{ fontFamily: "'Faustina', serif" }}
              >
                {tip.title}
              </p>
              <p
                className={`text-xs mt-1 leading-relaxed transition-all duration-500 overflow-hidden ${
                  active === i
                    ? "max-h-20 opacity-100 text-amber-50"
                    : "max-h-0 opacity-0"
                }`}
                style={{ fontFamily: "'Faustina', serif" }}
              >
                {tip.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pulse ring status indicator ──
function StatusPulse() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-3 h-3">
        <div className="absolute inset-0 rounded-full bg-emerald-500" />
        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
      </div>
      <span
        className="text-xs text-emerald-700 font-medium"
        style={{ fontFamily: "'Faustina', serif" }}
      >
        AI Engine Online
      </span>
    </div>
  );
}

// ── Helper: render text with **bold** highlights ──
function HighlightedText({ text, className = "" }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <span key={i} className="font-bold text-amber-700">
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ━━━━━━━━━━━━━━━━ MAIN HOME COMPONENT ━━━━━━━━━━━━━━━━
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const instructions = [
    "**Security & Access Control**: For an event of this nature, with a low risk estimation, I recommend deploying 50 security personnel around the N Convention premises. Checkpoints will be established at the main entrance on Hitex Road, the secondary entrance on Kondapur Main Road, and at the rear gate near the DLF Building. These checkpoints will ensure that all attendees are screened before entry.",
    "Select the **event type** and **date** to help AI tailor its risk model.",
    "Hit **Generate Plan** and receive a full **safety & traffic strategy** in seconds.",
  ];

  return (
    <div className="min-h-screen bg-[#fff7ed] relative overflow-hidden">
      <ParticleField />

      {/* ── Top toolbar ── */}
      <div
        className={`
          relative z-10 flex items-center justify-between 
          max-w-7xl mx-auto px-6 pt-6
          transition-all duration-700 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        `}
      >
        <StatusPulse />
        <LiveClock />
      </div>

      {/* ── Main grid layout ── */}
      <div
        className={`
          relative z-10 max-w-7xl mx-auto px-6 mt-12 pb-16
          grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8
          transition-all duration-700 delay-200 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
      >
        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-6">
          {/* Tips */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-amber-100/60">
            <TipCarousel />
          </div>

          {/* How-to instructions */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-amber-100/60">
            <h4
              className="text-xs uppercase tracking-[0.2em] text-amber-600/70 font-semibold mb-4"
              style={{ fontFamily: "'Faustina', serif" }}
            >
              Sample Output
            </h4>
            <div className="space-y-4">
              {instructions.map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p
                    className="text-[13px] text-gray-600 leading-relaxed"
                    style={{ fontFamily: "'Faustina', serif" }}
                  >
                    <HighlightedText text={text} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main form area ── */}
        <main>
          <div
            className="
              relative
              bg-white/60 backdrop-blur-lg
              rounded-3xl
              border border-white/70
              shadow-[0_4px_40px_-8px_rgba(180,120,60,0.12)]
              p-6 md:p-10
              transition-shadow duration-500
              hover:shadow-[0_8px_60px_-8px_rgba(180,120,60,0.2)]
              group
            "
          >
            {/* Animated border glow on hover */}
            <div
              className="
                absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-amber-300/20 via-orange-200/20 to-amber-300/20
                transition-opacity duration-700 -z-10 blur-sm
              "
            />

            {/* macOS-style window chrome */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-amber-100/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <span
                className="text-sm text-amber-700/60 font-medium ml-2"
                style={{ fontFamily: "'Faustina', serif" }}
              >
                safecrowd://event-planner
              </span>
            </div>

            <PlanFormCard />
          </div>
        </main>
      </div>
    </div>
  );
}
