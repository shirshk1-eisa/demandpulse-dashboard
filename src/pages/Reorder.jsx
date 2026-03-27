import { useState, useCallback } from 'react';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchReorders, updateReorderStatus, bulkApproveReorders } from '../data/api';
import { FiCheck, FiDownload, FiEdit3 } from 'react-icons/fi';

export default function Reorder() {
  const { data: rawOrders, loading, setData: setRawOrders } = useApi(fetchReorders);
  const [selected, setSelected] = useState(new Set());

  if (loading) return <div className="page-content"><Loader text="Loading reorders..." /></div>;

  const orders = rawOrders || [];

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map(o => o.id)));
  };

  const approveOne = async (id) => {
    await updateReorderStatus(id, 'approved');
    setRawOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o));
  };

  const approveSelected = async () => {
    const ids = [...selected];
    await bulkApproveReorders(ids);
    setRawOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: 'approved' } : o));
    setSelected(new Set());
  };

  const exportCSV = () => {
    const header = 'ID,SKU,Supplier,ROQ,MOQ,Order Date,Delivery Date,Status,Cost\n';
    const rows = orders.map(o =>
      `${o.id},${o.sku},${o.supplier},${o.roq},${o.moq},${o.orderDate},${o.deliveryDate},${o.status},${o.costEstimate}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reorder_suggestions.csv'; a.click();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🛒 Reorder Workbench</h2>
        <p>Review, edit, and approve reorder suggestions — export to CSV for ERP import</p>
      </div>

      <div className="filter-bar">
        <button className="btn btn-primary" onClick={approveSelected} disabled={selected.size === 0}>
          <FiCheck size={14} /> Approve Selected ({selected.size})
        </button>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <FiDownload size={14} /> Export CSV
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-secondary)' }}>
          {orders.length} suggestions • {orders.filter(o => o.status === 'approved').length} approved
        </div>
      </div>

      <div className="chart-card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={selected.size === orders.length && orders.length > 0}
                  onChange={toggleAll} style={{ cursor: 'pointer' }} />
              </th>
              <th>ID</th><th>SKU</th><th>Supplier</th><th>ROQ</th><th>MOQ</th>
              <th>Stock</th><th>Forecast</th><th>Order</th><th>Delivery</th>
              <th>Cost</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><input type="checkbox" checked={selected.has(o.id)}
                  onChange={() => toggleSelect(o.id)} style={{ cursor: 'pointer' }} /></td>
                <td style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>{o.id}</td>
                <td style={{ fontWeight: 500, fontSize: 13, maxWidth: 180 }}>{o.sku}</td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{o.supplier}</td>
                <td style={{ fontWeight: 700, color: 'var(--text-accent)' }}>{o.roq}</td>
                <td style={{ fontSize: 13 }}>{o.moq}</td>
                <td style={{ fontSize: 13 }}>{o.currentStock}</td>
                <td style={{ fontSize: 13 }}>{o.forecastDemand}</td>
                <td style={{ fontSize: 12 }}>{o.orderDate}</td>
                <td style={{ fontSize: 12 }}>{o.deliveryDate}</td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{o.costEstimate}</td>
                <td>
                  <span className={`badge ${o.status === 'approved' ? 'success' : o.status === 'urgent' ? 'critical' : 'medium'}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-success" onClick={() => approveOne(o.id)} title="Approve">
                      <FiCheck size={12} />
                    </button>
                    <button className="btn btn-sm btn-secondary" title="Edit"><FiEdit3 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
