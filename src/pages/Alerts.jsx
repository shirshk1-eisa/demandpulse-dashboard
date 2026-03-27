import { useState, useCallback } from 'react';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchAlerts, updateAlertStatus } from '../data/api';
import { FiBell, FiCheck, FiFilter } from 'react-icons/fi';

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const { data: alerts, loading, setData: setAlerts } = useApi(
    () => fetchAlerts(filter !== 'all' ? filter : null, statusFilter !== 'all' ? statusFilter : null),
    [filter, statusFilter]
  );

  const handleResolve = useCallback(async (id) => {
    await updateAlertStatus(id, 'resolved');
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  }, [setAlerts]);

  const allAlerts = alerts || [];
  const counts = {
    all: allAlerts.length,
    critical: allAlerts.filter(a => a.priority === 'critical').length,
    high: allAlerts.filter(a => a.priority === 'high').length,
    medium: allAlerts.filter(a => a.priority === 'medium').length + allAlerts.filter(a => a.priority === 'info').length,
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🔔 Alert Center</h2>
        <p>All active stock alerts — sortable by priority, filterable by type</p>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Alerts', value: counts.all, color: 'lavender' },
          { label: 'Critical', value: counts.critical, color: 'peach' },
          { label: 'High', value: counts.high, color: 'sky' },
          { label: 'Medium + Info', value: counts.medium, color: 'mint' },
        ].map((item) => (
          <div key={item.label} className={`kpi-card ${item.color}`}>
            <div className={`kpi-icon ${item.color}`}><FiBell /></div>
            <div className="kpi-info">
              <div className="kpi-label">{item.label}</div>
              <div className="kpi-value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <FiFilter style={{ color: 'var(--text-muted)' }} />
        {['all', 'critical', 'high', 'medium', 'info'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['active', 'resolved', 'all'].map(s => (
            <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-card">
        {loading ? <Loader text="Loading alerts..." /> : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Store</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td><span className={`badge ${alert.priority}`}>{alert.icon} {alert.priority}</span></td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{alert.type}</td>
                    <td style={{ fontSize: 13, maxWidth: 350 }}>{alert.message}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{alert.store}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alert.time}</td>
                    <td>
                      {alert.status === 'resolved'
                        ? <span className="badge success"><FiCheck size={10} /> Resolved</span>
                        : <span className="status-dot active" title="Active" />}
                    </td>
                    <td>
                      {alert.status === 'active' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleResolve(alert.id)}>
                          <FiCheck size={12} /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allAlerts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <p>No alerts match the current filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
