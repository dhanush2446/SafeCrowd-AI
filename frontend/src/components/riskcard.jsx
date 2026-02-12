export default function RiskCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-sm text-slate-500 mb-1">
        Risk Estimation
      </h2>
      <p className="text-3xl font-bold text-emerald-600">
        MEDIUM
      </p>

      <div className="mt-4 text-xs text-slate-500">
        Based on crowd density & historical patterns
      </div>
    </div>
  );
}
