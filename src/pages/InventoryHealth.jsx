import { useState } from 'react';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchHeatmap } from '../data/api';
import { FiGrid, FiFilter } from 'react-icons/fi';

const CATEGORIES = ['Dairy', 'Bakery', 'Beverages', 'Produce', 'Protein', 'Snacks'];

function getColor(days) {
  if (days < 5) return '#ef4444';
  if (days < 10) return '#f97316';
  if (days < 15) return '#fcd34d';
  if (days < 20) return '#6ee7b7';
  return '#7dd3fc';
}

function getLabel(days) {
  if (days < 5) return 'Critical';
  if (days < 10) return 'Low';
  if (days < 15) return 'Adequate';
  if (days < 20) return 'Good';
  return 'Overstock';
}

export default function InventoryHealth() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const { data: heatmapData, loading } = useApi(fetchHeatmap);

  if (loading) return <div className="page-content"><Loader text="Loading inventory data..." /></div>;

  const stores = [...new Set((heatmapData || []).map(d => d.store))];
  const skus = [...new Set((heatmapData || []).map(d => d.sku))];

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🗺️ Inventory Health Heatmap</h2>
        <p>Store × SKU grid colored by days-of-cover — hover for details</p>
      </div>

      <div className="filter-bar">
        <FiFilter style={{ color: 'var(--text-muted)' }} />
        {['All', ...CATEGORIES].map(c => (
          <button key={c} className={`filter-chip ${filterCategory === c ? 'active' : ''}`}
            onClick={() => setFilterCategory(c)}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 12, flexWrap: 'wrap' }}>
        {[
          { color: '#ef4444', label: '< 5 days (Critical)' },
          { color: '#f97316', label: '5-10 days (Low)' },
          { color: '#fcd34d', label: '10-15 days (Adequate)' },
          { color: '#6ee7b7', label: '15-20 days (Good)' },
          { color: '#7dd3fc', label: '> 20 days (Overstock)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div className="chart-card" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 2 }}>Store</th>
              {skus.map(sku => (
                <th key={sku} style={{ fontSize: 10, padding: '8px 4px', textAlign: 'center', textTransform: 'none' }}>
                  {sku.split(' ').slice(0, 2).join(' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map((store, si) => (
              <tr key={store}>
                <td style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1, fontWeight: 600, fontSize: 13 }}>
                  {store}
                </td>
                {skus.map((sku, pi) => {
                  const cell = (heatmapData || []).find(d => d.store === store && d.sku === sku);
                  if (!cell) return <td key={sku} />;
                  const isHovered = hoveredCell === `${si}-${pi}`;
                  return (
                    <td key={sku} style={{ padding: 4, position: 'relative' }}
                      onMouseEnter={() => setHoveredCell(`${si}-${pi}`)}
                      onMouseLeave={() => setHoveredCell(null)}>
                      <div style={{
                        width: '100%', height: 42, borderRadius: 6,
                        background: getColor(cell.daysOfCover),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                        color: cell.daysOfCover < 10 ? 'white' : '#1e1b4b',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                        zIndex: isHovered ? 5 : 1, position: 'relative',
                      }}>
                        {cell.daysOfCover}d
                      </div>
                      {isHovered && (
                        <div style={{
                          position: 'absolute', bottom: 'calc(100% + 4px)',
                          left: '50%', transform: 'translateX(-50%)',
                          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                          borderRadius: 10, padding: '10px 14px', fontSize: 12,
                          whiteSpace: 'nowrap', zIndex: 20, boxShadow: 'var(--shadow-lg)',
                          color: 'var(--text-primary)',
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{sku}</div>
                          <div>Days of Cover: <strong>{cell.daysOfCover}</strong></div>
                          <div>Current Stock: <strong>{cell.currentStock}</strong></div>
                          <div>Weekly Demand: <strong>{cell.weeklyDemand}</strong></div>
                          <div>Status: <span className={`badge ${cell.status === 'critical' ? 'critical' : cell.status === 'warning' ? 'medium' : cell.status === 'overstock' ? 'info' : 'success'}`}>
                            {getLabel(cell.daysOfCover)}
                          </span></div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
