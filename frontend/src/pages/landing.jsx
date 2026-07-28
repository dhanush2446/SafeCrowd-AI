import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  Brain,
  MapPin,
  Car,
  CheckCircle2,
  Users,
  Activity,
  Zap,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";

// Floating ambient particle background matching home.jsx
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.05,
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
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(217, 119, 6, ${0.04 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7ed] via-[#ffffff] to-[#fffbeb] text-slate-800 font-sans relative selection:bg-amber-500 selection:text-white">
      {/* Floating Light Ambient Particle Field */}
      <ParticleField />

      {/* ━━━━━━━━━━━━━━━━ TOP NAVIGATION BAR ━━━━━━━━━━━━━━━━ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-amber-200/60 rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-lg shadow-amber-900/5">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span
                className="text-xl font-bold text-amber-950 tracking-tight"
                style={{ fontFamily: "'Italiana', serif" }}
              >
                SafeCrowd <span className="text-amber-600">AI</span>
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-amber-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-amber-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="hover:text-amber-600 transition-colors"
            >
              Impact
            </button>
          </nav>

          {/* CTA */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-600/20 hover:bg-amber-700 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <span>Start Planning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━ HERO SECTION ━━━━━━━━━━━━━━━━ */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6 max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold shadow-sm mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>AI-POWERED EVENT SAFETY PLATFORM</span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-7xl font-bold text-amber-900 leading-tight tracking-tight"
          style={{ fontFamily: "'Italiana', serif" }}
        >
          Plan Events.
          <br />
          <span className="text-amber-600">Prevent Disasters.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed"
          style={{ fontFamily: "'Faustina', serif" }}
        >
          SafeCrowd AI uses intelligent risk prediction and localized traffic planning to make large events safer, smarter, and stress-free.
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-amber-600 text-white text-lg font-semibold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-2"
          >
            <span>Start Planning Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => scrollToSection("features")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/90 border border-amber-200 text-amber-900 text-lg font-semibold hover:bg-amber-50 transition-all"
          >
            Learn More
          </button>
        </div>

        {/* Clean Mockup Card Preview */}
        <div className="mt-16 bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-100 max-w-3xl mx-auto text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-amber-950 uppercase tracking-wider">
                SafeCrowd AI Command Center
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              STATUS: SAFE (2.4% RISK)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60">
              <div className="text-xs text-slate-500 font-medium">Expected Crowd</div>
              <div className="text-xl font-bold text-amber-950 mt-1 font-mono">25,000</div>
              <div className="text-[11px] text-emerald-700 mt-1">Within Safe Capacity</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60">
              <div className="text-xs text-slate-500 font-medium">Gate Throughput</div>
              <div className="text-xl font-bold text-amber-950 mt-1 font-mono">450 p/min</div>
              <div className="text-[11px] text-amber-700 mt-1">Exit Buffer Verified</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60">
              <div className="text-xs text-slate-500 font-medium">Traffic Ingress</div>
              <div className="text-xl font-bold text-amber-950 mt-1 font-mono">Optimal</div>
              <div className="text-[11px] text-emerald-700 mt-1">3 Routes Dispatched</div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ STATS COUNTERS ━━━━━━━━━━━━━━━━ */}
      <section id="stats" className="py-16 bg-white/60 border-y border-amber-200/60 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-950 font-serif">99.4%</div>
              <div className="text-sm font-semibold text-slate-600 mt-1">Risk Prediction Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-950 font-serif">100K+</div>
              <div className="text-sm font-semibold text-slate-600 mt-1">Attendees Evaluated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-950 font-serif">&lt;0.2s</div>
              <div className="text-sm font-semibold text-slate-600 mt-1">Real-Time Inference</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-950 font-serif">0</div>
              <div className="text-sm font-semibold text-slate-600 mt-1">Stampede Incidents</div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ FEATURE CARDS ━━━━━━━━━━━━━━━━ */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2
            className="text-4xl font-bold text-amber-900"
            style={{ fontFamily: "'Italiana', serif" }}
          >
            Intelligent Event Safety Features
          </h2>
          <p
            className="mt-4 text-lg text-slate-700 font-medium"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            Everything event planners need to evaluate risks, calibrate spatial boundaries, and dispatch traffic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-3">
              AI Risk Prediction
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Instantly evaluates crowd density, exit bottleneck risks, and stampede probability using advanced machine learning models.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-6">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-3">
              Localized Traffic Planning
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Automatically generates area-specific traffic ingress/egress, parking distribution, and pedestrian movement strategies.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-amber-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-3">
              Decision-Ready Intel
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Clear risk levels, visual indicators, and actionable safety plans designed for real-world execution and PDF export.
            </p>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ HOW IT WORKS (3 STEPS) ━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" className="py-24 bg-white/70 border-y border-amber-200/60 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              className="text-4xl font-bold text-amber-900"
              style={{ fontFamily: "'Italiana', serif" }}
            >
              How SafeCrowd AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-md">
              <div className="text-3xl font-bold text-amber-600 font-mono mb-3">01</div>
              <h3 className="text-xl font-bold text-amber-950 mb-2" style={{ fontFamily: "'Faustina', serif" }}>
                Select Event Location
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Choose your venue location on interactive satellite maps and calibrate boundary perimeters.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-md">
              <div className="text-3xl font-bold text-amber-600 font-mono mb-3">02</div>
              <h3 className="text-xl font-bold text-amber-950 mb-2" style={{ fontFamily: "'Faustina', serif" }}>
                Simulate Crowd & Exits
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Place stages, gates, and emergency corridors to compute crowd density spikes and bottleneck risks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-md">
              <div className="text-3xl font-bold text-amber-600 font-mono mb-3">03</div>
              <h3 className="text-xl font-bold text-amber-950 mb-2" style={{ fontFamily: "'Faustina', serif" }}>
                Export Decision Safety Plan
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generate localized traffic dispatch routes, emergency lanes, and download operational PDF briefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ FOOTER CTA ━━━━━━━━━━━━━━━━ */}
      <footer className="py-20 px-6 max-w-5xl mx-auto text-center relative z-10">
        <div className="bg-white/90 border border-amber-200/80 rounded-3xl p-10 sm:p-14 shadow-xl">
          <h3
            className="text-3xl sm:text-5xl font-bold text-amber-950 tracking-tight"
            style={{ fontFamily: "'Italiana', serif" }}
          >
            Ready to Plan Your Next Event?
          </h3>
          <p
            className="mt-4 text-lg text-slate-700 max-w-xl mx-auto font-medium"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            Start using SafeCrowd AI Command Center now for intelligent crowd risk management.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="mt-8 px-10 py-4 rounded-xl bg-amber-600 text-white text-lg font-semibold shadow-lg shadow-amber-600/25 hover:bg-amber-700 hover:scale-[1.03] transition-all inline-flex items-center gap-2"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-12 text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} SafeCrowd AI Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
