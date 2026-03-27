import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchModelPerformance, fetchCategoryPerformance } from '../data/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
} from 'recharts';
import { FiBarChart2, FiAward, FiCpu } from 'react-icons/fi';

const MODEL_COLORS = ['#c4b5fd', '#7dd3fc', '#6ee7b7', '#fca5a5', '#f9a8d4', '#7c3aed'];
const MODELS = ['Prophet', 'LightGBM', 'XGBoost', 'Croston', 'LSTM', 'Ensemble'];

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

export default function ModelPerformance() {
  const { data: perfData, loading: perfLoading } = useApi(fetchModelPerformance);
  const { data: catData, loading: catLoading } = useApi(fetchCategoryPerformance);

  if (perfLoading) return <div className="page-content"><Loader text="Loading model metrics..." /></div>;

  const modelData = perfData || [];
  const bestModel = modelData.length > 0
    ? modelData.reduce((best, m) => m.mape < best.mape ? m : best)
    : { name: '—', mape: 0, rmse: 0, bias: 0, r2: 0 };

  const radarData = modelData.map(m => ({
    model: m.name,
    Accuracy: Math.max(0, 100 - m.mape),
    R2: m.r2 * 100,
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🏆 Model Performance Scorecard</h2>
        <p>Compare forecasting models across accuracy metrics and categories</p>
      </div>

      <div className="chart-card" style={{
        marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(125, 211, 252, 0.08))',
        border: '1px solid rgba(124, 58, 237, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: 'white',
          }}><FiAward /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Best Performing Model</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{bestModel.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              MAPE: {bestModel.mape}% · RMSE: {bestModel.rmse} · R²: {bestModel.r2} · Bias: {bestModel.bias}%
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title"><FiBarChart2 className="title-icon" /> MAPE by Model (Lower is Better)</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mape" name="MAPE %" radius={[0, 6, 6, 0]}>
                {modelData.map((_, i) => (<Cell key={i} fill={MODEL_COLORS[i]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title"><FiCpu className="title-icon" /> Multi-Metric Comparison</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="model" stroke="var(--text-muted)" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} />
              <Radar name="Accuracy" dataKey="Accuracy" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="R²" dataKey="R2" stroke="#7dd3fc" fill="#7dd3fc" fillOpacity={0.1} strokeWidth={2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: 8 }}>
        <div className="chart-card-header">
          <div className="chart-card-title"><FiBarChart2 className="title-icon" /> Detailed Model Metrics</div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Model</th><th>MAPE (%)</th><th>RMSE</th><th>Bias (%)</th><th>R² Score</th><th>Verdict</th></tr>
          </thead>
          <tbody>
            {modelData.map((m) => (
              <tr key={m.name}>
                <td style={{ fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCpu style={{ color: 'var(--text-accent)' }} />
                    {m.name}
                    {m.name === bestModel.name && <span className="badge success" style={{ marginLeft: 4 }}>🏆 Best</span>}
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ color: m.mape < 10 ? '#059669' : m.mape < 15 ? '#eab308' : '#dc2626' }}>{m.mape}%</span>
                </td>
                <td>{m.rmse}</td>
                <td style={{ color: Math.abs(m.bias) < 3 ? '#059669' : '#f97316' }}>
                  {m.bias > 0 ? '+' : ''}{m.bias}%
                </td>
                <td style={{ fontWeight: 600 }}>{m.r2}</td>
                <td>
                  <span className={`badge ${m.mape < 10 ? 'success' : m.mape < 15 ? 'medium' : 'high'}`}>
                    {m.mape < 10 ? 'Excellent' : m.mape < 15 ? 'Good' : 'Needs Tuning'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-card" style={{ marginTop: 28 }}>
        <div className="chart-card-header">
          <div className="chart-card-title"><FiBarChart2 className="title-icon" /> MAPE by Category × Model</div>
        </div>
        {catLoading ? <Loader /> : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={catData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {MODELS.map((m, i) => (
                <Bar key={m} dataKey={m} fill={MODEL_COLORS[i]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
