
import DashboardTop from "./DashboardTop";
import DashboardMiddle from "./DashboardMiddle";
import DashboardMidMiddle from "./DashboardMidMiddle";
import RecentActivityLogs from "./RecentActivityLogs";

export default function Dashboard() {
  return (
    <main className="space-y-6 -mt-3">
      {/* Dashboard Header */}
      <DashboardTop />

      {/* KPI Cards */}
      <DashboardMiddle />

      {/* Cargo + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <DashboardMidMiddle />
        <RecentActivityLogs />
      </div>
    </main>
  );
}
