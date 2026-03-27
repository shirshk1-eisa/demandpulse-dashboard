import KpiCard from '../components/KpiCard';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchKpis, fetchSalesTrend, fetchCategories, fetchAlerts } from '../data/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { FiTrendingUp, FiPieChart, FiBell, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="value">
          <span className="dot" style={{ background: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: kpis, loading: kpiLoading } = useApi(fetchKpis);
  const { data: salesTrend, loading: salesLoading } = useApi(fetchSalesTrend);
  const { data: categories, loading: catLoading } = useApi(fetchCategories);
  const { data: alerts, loading: alertsLoading } = useApi(() => fetchAlerts(null, 'active'));

  if (kpiLoading && salesLoading) return <div className="page-content"><Loader text="Loading dashboard..." /></div>;

  const topAlerts = (alerts || []).slice(0, 5);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📊 Executive Overview</h2>
        <p>Weekly demand intelligence snapshot — March 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {(kpis || []).map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        {/* Sales Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <FiTrendingUp className="title-icon" />
              Sales Trend vs Forecast
            </div>
          </div>
          {salesLoading ? <Loader /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={2.5}
                  dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6, fill: '#7c3aed' }} name="Actual Sales" />
                <Line type="monotone" dataKey="forecast" stroke="#7dd3fc" strokeWidth={2}
                  strokeDasharray="5 5" dot={{ fill: '#7dd3fc', r: 3 }} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <FiPieChart className="title-icon" />
              Revenue by Category
            </div>
          </div>
          {catLoading ? <Loader /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                  dataKey="value" stroke="var(--bg-card)" strokeWidth={3}
                  label={({ name, value }) => `${name} ${value}%`} animationDuration={800}>
                  {(categories || []).map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Active Alerts Summary */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-title">
            <FiBell className="title-icon" />
            Active Alerts
          </div>
          <Link to="/alerts" className="btn btn-secondary btn-sm">
            View All <FiArrowRight size={12} />
          </Link>
        </div>
        {alertsLoading ? <Loader /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Alert</th>
                <th>SKU</th>
                <th>Store</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {topAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td><span className={`badge ${alert.priority}`}>{alert.icon} {alert.priority}</span></td>
                  <td style={{ fontWeight: 500 }}>{alert.type}</td>
                  <td style={{ fontSize: 13 }}>{alert.sku}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{alert.store}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alert.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
