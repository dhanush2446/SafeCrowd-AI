import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Users, Shield, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function RoiCalculator() {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState("concert");
  const [attendees, setAttendees] = useState(30000);

  const calculateSpecs = () => {
    let baseDensityFactor = 1.0;
    if (eventType === "concert") baseDensityFactor = 1.25;
    if (eventType === "stadium") baseDensityFactor = 1.1;
    if (eventType === "rally") baseDensityFactor = 1.4;
    if (eventType === "festival") baseDensityFactor = 1.15;
    if (eventType === "expo") baseDensityFactor = 0.9;

    const reqGates = Math.max(3, Math.ceil((attendees / 5000) * baseDensityFactor));
    const totalGateWidth = reqGates * 2.5; // meters
    const reqSecurity = Math.ceil((attendees / 250) * baseDensityFactor);
    const reqMedical = Math.ceil(attendees / 3000);
    const riskReduction = Math.min(99.2, 94.5 + (reqGates * 0.4));

    return {
      reqGates,
      totalGateWidth,
      reqSecurity,
      reqMedical,
      riskReduction,
    };
  };

  const specs = calculateSpecs();

  return (
    <section id="calculator" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-8 lg:p-12 backdrop-blur-2xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description & Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase">
                <Calculator className="w-3.5 h-3.5" />
                <span>Instant Safety Recommendation Calculator</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Calculate Safety Requirements for Your Next Event
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Select your event type and estimated crowd size to instantly receive SafeCrowd AI's recommended spatial exit widths, security deployment ratios, and emergency triage capacities.
              </p>

              {/* Input 1: Event Type */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                  Select Event Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "concert", label: "Music Concert" },
                    { id: "stadium", label: "Stadium Sports" },
                    { id: "festival", label: "Cultural Fest" },
                    { id: "rally", label: "Public Rally" },
                    { id: "expo", label: "Trade Expo" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setEventType(cat.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                        eventType === cat.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 2: Attendance Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" /> Expected Attendees
                  </span>
                  <span className="text-amber-400 font-mono font-bold text-base">
                    {attendees.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="150000"
                  step="2500"
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Right Generated Recommendation Card */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    AI RECOMMENDATION MATRIX
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Safety Compliance Profile
                  </h3>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 font-mono text-xs font-bold">
                  {specs.riskReduction}% RISK REDUCTION
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">REQ. EXIT GATES</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {specs.reqGates} Gates
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Min Width: {specs.totalGateWidth} meters
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">SECURITY PERSONNEL</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {specs.reqSecurity} Officers
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Ratio 1:{Math.round(attendees / specs.reqSecurity)}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">MEDICAL TRIAGE BEDS</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {specs.reqMedical} Station Beds
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    First Aid Ready
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">BURST FLOW CAPACITY</div>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                    {Math.round(specs.reqGates * 450)} <span className="text-xs">p/min</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Safe Burst Evac
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate("/home")}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Deploy Layout with these Specs in Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
