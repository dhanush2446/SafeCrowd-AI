export default function TopNav() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            🛡
          </div>
          <h1 className="font-semibold text-slate-800">
            SafeCrowd AI
          </h1>
        </div>

        <div className="flex gap-6 text-sm text-slate-600">
          <span className="font-medium text-amber-600">Dashboard</span>
          <span className="hover:text-slate-800 cursor-pointer">New Plan</span>
          <span className="hover:text-slate-800 cursor-pointer">Analytics</span>
          <span className="hover:text-slate-800 cursor-pointer">Reports</span>
        </div>
      </div>
    </div>
  );
}
