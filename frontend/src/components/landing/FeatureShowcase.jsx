import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  MapPin,
  Car,
  FileCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "risk-engine",
      title: "Predictive AI Risk & Bottleneck Model",
      icon: Brain,
      tag: "CORE MACHINE LEARNING",
      description:
        "Continuously computes real-time crowd compression, exit throughput constraints, and stampede probability across thousands of spatial datapoints.",
      highlights: [
        "Predicts critical crush hazards 45 minutes before occurrence",
        "Calculates exact crowd evacuation velocity per exit width",
        "Weather-adjusted risk scaling (rain, storm, heat stress factors)",
      ],
      previewWidget: (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              LIVE TELEMETRY WAVEFORM
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPTIMAL (88.4% SAFE)
            </span>
          </div>

          <div className="h-32 flex items-end justify-between gap-1.5 pt-4 border-b border-slate-800 pb-2">
            {[35, 42, 38, 55, 62, 48, 75, 82, 60, 45, 30, 25, 40, 52, 68, 88, 70, 42, 35].map((val, idx) => (
              <div
                key={idx}
                className="w-full rounded-t transition-all duration-300 group relative"
                style={{
                  height: `${val}%`,
                  backgroundColor: val > 75 ? "#ef4444" : val > 55 ? "#f59e0b" : "#10b981",
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-[10px] text-white font-mono px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none z-10 whitespace-nowrap">
                  {val}% load
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">STAMPEDE RISK</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">2.4% LOW</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">CRUSH POINT</div>
              <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">STAGE A-2</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">LATENCY</div>
              <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">140ms</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "spatial-canvas",
      title: "Interactive Drag & Drop Spatial Planner",
      icon: MapPin,
      tag: "SPATIAL COMMAND & CONTROL",
      description:
        "Design venue layouts directly on interactive satellite maps. Place stages, gates, emergency corridors, medical hubs, and security perimeters with auto-calibration.",
      highlights: [
        "Real-time lat/lng coordinate locking for precise field deployment",
        "Automatic safety radius calculations for stage noise & crowd pressure",
        "Supports custom high-resolution blueprint PNG/SVG overlays",
      ],
      previewWidget: (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-semibold">LAYOUT ELEMENTS PALETTE</span>
            <span className="text-slate-400">8 ELEMENTS PLACED</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "Stage Block", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
              { name: "Main Gate", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
              { name: "Med Tent", color: "bg-red-500/20 text-red-400 border-red-500/40" },
              { name: "Security Post", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" },
              { name: "Barricade", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
              { name: "Food Hub", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
              { name: "EV Exit Gate", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
              { name: "Parking P1", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center hover:scale-105 transition-transform cursor-pointer ${item.color}`}
              >
                {item.name}
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Auto-Calibrated Venue Boundary Area:</span>
            <span className="font-mono text-amber-400 font-bold">14,250 m²</span>
          </div>
        </div>
      ),
    },
    {
      id: "traffic-dispatch",
      title: "Localized Traffic & Parking Dispatch Plan",
      icon: Car,
      tag: "TRAFFIC & VEHICLE LOGISTICS",
      description:
        "Generates targeted vehicle ingress and egress plans, parking lot distribution schedules, VIP priority corridors, and pedestrian walk channels.",
      highlights: [
        "Prevents main road gridlock through staggering arrival windows",
        "Calculates parking lot saturation times based on hourly inflow rate",
        "Integrated emergency vehicle fast-lane routing",
      ],
      previewWidget: (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-purple-400 font-semibold">VEHICLE INGRESS DISPATCH</span>
            <span className="text-emerald-400">92% FLOW RATE</span>
          </div>

          <div className="space-y-2.5">
            {[
              { route: "North Highway 101 -> Gate A", load: "78%", status: "Optimal Flow", color: "text-emerald-400" },
              { route: "East Express Ring -> Parking Lot B", load: "91%", status: "Heavy Slowdown", color: "text-amber-400" },
              { route: "Emergency VIP Corridor West", load: "12%", status: "Clear Channel", color: "text-cyan-400" },
            ].map((r, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{r.route}</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${r.color}`}>{r.status}</div>
                </div>
                <div className="font-mono font-bold text-amber-400">{r.load}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "decision-intel",
      title: "Decision-Ready Execution & Export Plan",
      icon: FileCheck,
      tag: "COMMAND INTELLIGENCE",
      description:
        "Generates formal safety compliance documentation, hazard checklists, and instantly downloadable operational PDFs for police, fire, and event personnel.",
      highlights: [
        "Instant one-click operational safety PDF export",
        "Actionable risk reduction guidelines tailored to local laws",
        "Real-time weather alert triggers and emergency protocols",
      ],
      previewWidget: (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SAFETY PLAN CERTIFIED
            </span>
            <span className="text-[10px] font-mono text-slate-400">DOC #SF-9942</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gate A exit width verified for 25,000 attendee burst flow</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Medical triage station placed within 90s response distance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Traffic perimeter clear for 25 emergency vehicles</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
            <span>Export Formats: PDF, GeoJSON, Executive Brief</span>
            <span className="text-amber-400 font-bold">READY</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Next-Generation Crowd Safety Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Built for High-Stakes Events & Public Safety
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            SafeCrowd AI bridges machine learning risk forecasting with real-time spatial venue command to prevent crowd disasters before they happen.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${
                  activeTab === idx
                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 scale-105"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl">
          {/* Left Text Column */}
          <motion.div
            key={features[activeTab].id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
              {features[activeTab].tag}
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {features[activeTab].title}
            </h3>

            <p className="text-slate-300 text-base leading-relaxed">
              {features[activeTab].description}
            </p>

            <div className="space-y-3 pt-2">
              {features[activeTab].highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                  </div>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Preview Column */}
          <motion.div
            key={`preview-${features[activeTab].id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6"
          >
            {features[activeTab].previewWidget}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
