import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight, Activity, ExternalLink } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#fffbeb] border-t border-amber-200/80 text-slate-600 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Banner CTA */}
        <div className="bg-white/90 border border-amber-200 rounded-3xl p-8 sm:p-12 mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left shadow-xl shadow-amber-900/5">
          <div>
            <h3 className="text-2xl sm:text-4xl font-bold text-amber-950 font-serif tracking-tight">
              Ready to Make Your Next Event 100% Safe?
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Launch SafeCrowd AI Command Center now to generate spatial layouts, compute crowd compression risks, and export decision-ready safety plans.
            </p>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-lg shadow-amber-600/25 hover:scale-105 transition-all shrink-0"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Footer Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-amber-200/80">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                <Shield className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-serif text-lg font-bold text-amber-950">
                SafeCrowd<span className="text-amber-600">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              SafeCrowd AI provides intelligent spatial planning and stampede prevention models to make large-scale public events safer.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-amber-950 uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#features" className="hover:text-amber-700 transition-colors">AI Risk Forecasting</a></li>
              <li><a href="#how-it-works" className="hover:text-amber-700 transition-colors">Spatial Venue Planning</a></li>
              <li><a href="#venue-3d" className="hover:text-amber-700 transition-colors">3D Tactical Inspection</a></li>
              <li><a href="/home" className="hover:text-amber-700 transition-colors">Command Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-amber-950 uppercase tracking-wider mb-3">
              System Telemetry
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Risk Latency: &lt;150ms</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>GIS Spatial Sync</span>
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                <span>Decision-Ready PDF Export</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-amber-950 uppercase tracking-wider mb-3">
              Engine Status
            </h4>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Prediction Model</span>
                <span className="text-emerald-700 font-mono font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Spatial Calibrator</span>
                <span className="text-emerald-700 font-mono font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} SafeCrowd AI. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
