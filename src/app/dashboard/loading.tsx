export default function DashboardLoading() {
  return (
    <div className="dashboard-page loading-page" aria-busy="true" aria-label="Loading dashboard">
      <div className="loading-heading" />
      <div className="metric-grid">
        {[1, 2, 3, 4].map((item) => <div className="loading-block loading-metric" key={item} />)}
      </div>
      <div className="dashboard-grid"><div className="loading-block loading-chart" /><div className="loading-block loading-chart" /></div>
    </div>
  );
}
