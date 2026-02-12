import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff7ed] flex flex-col items-center px-6">
      {/* HERO SECTION */}
      <section className="mt-24 text-center max-w-5xl">
        <h1
          className="text-6xl md:text-7xl font-bold text-amber-900 leading-tight"
          style={{ fontFamily: "'Italiana', serif" }}
        >
          Plan Events.
          <br />
          <span className="text-amber-600">Prevent Disasters.</span>
        </h1>

        <p
          className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto font-extrabold"
          style={{ fontFamily: "'Italiana', serif" }}
        >
          SafeCrowd AI uses intelligent risk prediction and localized traffic
          planning to make large events safer, smarter, and stress-free.
        </p>

        <button
          onClick={() => navigate("/home")}
          className="mt-10 px-10 py-4 rounded-xl bg-amber-600 text-white text-lg font-semibold shadow-lg hover:bg-amber-700 transition-all duration-300 hover:scale-[1.03]"
        >
          Start Planning
        </button>
      </section>

      {/* FEATURE CARDS */}
      <section className="mt-20 max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
          {/* CARD 1 */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-100
                       hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            <h3 className="text-2xl font-semibold text-amber-700 mb-4 text-center">
              AI Risk Prediction
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Instantly evaluates crowd density and stampede probability using
              advanced machine learning models.
            </p>
          </div>

          {/* CARD 2 */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-100
                       hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            <h3 className="text-2xl font-semibold text-amber-700 mb-4 text-center">
              Localized Traffic Planning
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Automatically generates area-specific traffic, parking, and
              pedestrian movement strategies.
            </p>
          </div>

          {/* CARD 3 */}
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-100
                       hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            style={{ fontFamily: "'Faustina', serif" }}
          >
            <h3 className="text-2xl font-semibold text-amber-700 mb-4 text-center">
              Decision-Ready Insights
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Clear risk levels, visual indicators, and actionable safety plans
              designed for real-world execution.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
