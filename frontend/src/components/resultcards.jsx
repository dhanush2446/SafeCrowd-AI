import { motion } from "framer-motion";
import RiskGauge from "./riskgauge";

export default function ResultCards({ result }) {
  const riskLabel = result.riskCategory || "Unknown";

  let badgeColor = "bg-green-100 text-green-700";
  if (riskLabel === "Medium") badgeColor = "bg-amber-100 text-amber-700";
  if (riskLabel === "High" || riskLabel === "Critical")
    badgeColor = "bg-red-100 text-red-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-sm border p-6"
    >
      <h3 className="text-lg font-semibold mb-2">
        Risk Prediction
      </h3>

      {/* RISK LABEL */}
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}
      >
        {riskLabel} Risk
      </span>

      {/* GAUGE */}
      <RiskGauge value={result.stampedeProb} />

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-600 mt-4 text-center">
        Predicted stampede probability based on crowd density and venue capacity
      </p>
    </motion.div>
  );
}
