import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchSkus, fetchTimeseries, fetchForecastMetrics } from '../data/api';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Legend, Line,
} from 'recharts';
import { FiTarget, FiTrendingUp, FiActivity, FiAlertCircle } from 'react-icons/fi';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="value">
          <span className="dot" style={{ background: p.color }} />
          {p.name}: {p.value ?? '—'}
        </div>
      ))}
    </div>
  );
}

export default function Forecast() {
  const [selectedSku, setSelectedSku] = useState(0);
  const [horizon, setHorizon] = useState('all');

  const { data: skuList, loading: skuLoading } = useApi(fetchSkus);
  const { data: metrics, loading: metricsLoading } = useApi(fetchForecastMetrics);

  const skuId = skuList?.[selectedSku]?.id || 'SKU-1000';
  const { data: rawData, loading: tsLoading } = useApi(() => fetchTimeseries(skuId), [skuId]);

  if (skuLoading) return <div className="page-content"><Loader text="Loading forecast..." /></div>;

  const sku = skuList?.[selectedSku] || { name: '', category: '' };
  let data = rawData || [];
  if (horizon === '4w') data = data.slice(-5);
  else if (horizon === '12w') data = data.slice(-13);

  const fm = metrics || { mape: '—', rmse: '—', bias: '—', accuracy: '—' };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📈 SKU-Level Forecast</h2>
        <p>Actual vs predicted demand with confidence intervals</p>
      </div>

      <div className="filter-bar">
        <select className="select-styled" value={selectedSku}
          onChange={(e) => setSelectedSku(Number(e.target.value))}>
          {(skuList || []).map((s, i) => (
            <option key={s.id} value={i}>{s.id} — {s.name}</option>
          ))}
        </select>
        <button className={`filter-chip ${horizon === '4w' ? 'active' : ''}`}
          onClick={() => setHorizon('4w')}>4 Weeks</button>
        <button className={`filter-chip ${horizon === '12w' ? 'active' : ''}`}
          onClick={() => setHorizon('12w')}>12 Weeks</button>
        <button className={`filter-chip ${horizon === 'all' ? 'active' : ''}`}
          onClick={() => setHorizon('all')}>All</button>
      </div>

      <div className="chart-card" style={{ marginBottom: 28 }}>
        <div className="chart-card-header">
          <div className="chart-card-title">
            <FiTrendingUp className="title-icon" />
            {sku.name} — Demand Forecast
          </div>
          <span className="badge info">{sku.category}</span>
        </div>
        {tsLoading ? <Loader /> : (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="conf95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="conf80" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="upper95" stroke="none" fill="url(#conf95)" name="95% Upper" dot={false} />
              <Area type="monotone" dataKey="lower95" stroke="none" fill="transparent" name="95% Lower" dot={false} />
              <Area type="monotone" dataKey="upper80" stroke="none" fill="url(#conf80)" name="80% Upper" dot={false} />
              <Area type="monotone" dataKey="lower80" stroke="none" fill="transparent" name="80% Lower" dot={false} />
              <Line type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={2.5}
                dot={{ r: 3, fill: '#7c3aed' }} name="Forecast" />
              <Line type="monotone" dataKey="actual" stroke="#6ee7b7" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6ee7b7', stroke: '#059669', strokeWidth: 1 }}
                activeDot={{ r: 6 }} name="Actual" connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="kpi-grid">
        <div className="kpi-card lavender">
          <div className="kpi-icon lavender"><FiTarget /></div>
          <div className="kpi-info">
            <div className="kpi-label">MAPE</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{fm.mape}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mean Abs % Error</div>
          </div>
        </div>
        <div className="kpi-card mint">
          <div className="kpi-icon mint"><FiActivity /></div>
          <div className="kpi-info">
            <div className="kpi-label">RMSE</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{fm.rmse}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Root Mean Sq Error</div>
          </div>
        </div>
        <div className="kpi-card peach">
          <div className="kpi-icon peach"><FiAlertCircle /></div>
          <div className="kpi-info">
            <div className="kpi-label">Bias</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{fm.bias}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Forecast Bias</div>
          </div>
        </div>
        <div className="kpi-card sky">
          <div className="kpi-icon sky"><FiTrendingUp /></div>
          <div className="kpi-info">
            <div className="kpi-label">Accuracy</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{fm.accuracy}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
