import { useState } from "react";
import { planEvent } from "../api";

export default function PlanFormCard() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    date: "",
    attendees: "",
    capacity: "",
    instructions: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const data = await planEvent(form);
      setResult(data);
    } catch (err) {
      setError("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* TOP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT — FORM */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Create New Safety Plan
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input name="name" placeholder="Event Name" onChange={handleChange} className="border p-2 rounded" />
            <input name="location" placeholder="Location" onChange={handleChange} className="border p-2 rounded" />
            <input type="date" name="date" onChange={handleChange} className="border p-2 rounded" />
            <input name="attendees" placeholder="Expected Crowd" onChange={handleChange} className="border p-2 rounded" />
            <input name="capacity" placeholder="Venue Capacity" onChange={handleChange} className="border p-2 rounded" />
          </div>

          <textarea
            name="instructions"
            placeholder="Special Instructions"
            onChange={handleChange}
            className="mt-3 w-full border rounded-lg p-2"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white w-full py-2 rounded-lg transition"
          >
            {loading ? "Analyzing..." : "Generate Plan"}
          </button>

          {error && (
            <p className="text-red-600 mt-3">{error}</p>
          )}
        </div>

        {/* RIGHT — RISK CARD */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-3">
              Risk Prediction
            </h3>

            <p className="text-2xl font-bold text-amber-700 mb-4">
              {result.riskCategory || "Unknown"}
            </p>

            {/* Gauge placeholder (same card) */}
            <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-700"
                style={{ width: `${result.stampedeProb || 0}%` }}
              />
            </div>

            <p className="text-sm text-gray-600 mt-2">
              Risk Level Indicator
            </p>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS — FULL WIDTH */}
      {result && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-3">
            Safety & Traffic Instructions
          </h3>

          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {result?.trafficPlan?.detailed_strategy || "No instructions generated"}
          </div>
        </div>
      )}
    </div>
  );
}
