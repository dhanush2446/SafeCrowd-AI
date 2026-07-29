import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight, Activity } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-md border border-amber-200/80 rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg shadow-amber-900/5">
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-serif text-lg font-bold text-amber-950 tracking-tight">
              SafeCrowd<span className="text-amber-600 font-extrabold">.AI</span>
            </div>
            <div className="text-[10px] text-amber-700 font-mono tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              AI SAFETY ENGINE
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-amber-600 transition-colors"
          >
            Capabilities
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-amber-600 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("venue-3d")}
            className="hover:text-amber-600 transition-colors"
          >
            3D Spatial View
          </button>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>AI ENGINE ONLINE</span>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Start Planning</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
}
