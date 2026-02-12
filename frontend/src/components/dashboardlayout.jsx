import TopNav from "./topnav";
import PlanFormCard from "./planformcard";
import RiskCard from "./riskcard";
import VenueStatsCard from "./venuestatscard";

export default function DashboardLayout() {
  return (
    <>
      <TopNav />

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <PlanFormCard />
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-6">
          <VenueStatsCard />
          <RiskCard />
        </div>
      </div>
    </>
  );
}
