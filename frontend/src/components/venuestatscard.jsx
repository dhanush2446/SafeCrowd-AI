export default function VenueStatsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-800 mb-4">
        Venue Overview & Statistics
      </h2>

      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full border-8 border-amber-400 flex items-center justify-center text-sm text-slate-600">
          77%
        </div>

        <div className="text-sm text-slate-600">
          Crowd: <b>15,000</b> / Capacity: <b>20,000</b>
        </div>
      </div>
    </div>
  );
}
