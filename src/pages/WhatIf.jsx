import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { fetchSkus, simulateWhatIfApi, simulateSafetyStockApi } from '../data/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from 'recharts';
import { FiSliders, FiZap, FiShield, FiArrowUp, FiArrowDown } from 'react-icons/fi';

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

export default function WhatIf() {
  const [skuIndex, setSkuIndex] = useState(0);
  const [discount, setDiscount] = useState(15);
  const [duration, setDuration] = useState(2);
  const [riskLevel, setRiskLevel] = useState(5);

  const { data: skuList, loading: skuLoading } = useApi(fetchSkus);

  // Simulation data
  const [simData, setSimData] = useState(null);
  const [safetyData, setSafetyData] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    setSimLoading(true);
    simulateWhatIfApi(discount, duration, skuIndex)
      .then(setSimData)
      .finally(() => setSimLoading(false));
  }, [discount, duration, skuIndex]);

  useEffect(() => {
    simulateSafetyStockApi(riskLevel).then(setSafetyData);
  }, [riskLevel]);

  if (skuLoading) return <div className="page-content"><Loader text="Loading simulator..." /></div>;

  const baseData = simData?.baseData || [];
  const cannibalization = simData?.cannibalization || [];
  const safety = safetyData || { holdingCost: '—', stockoutRisk: '—', safetyDays: 0, inventoryValue: '—' };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🧪 What-If Simulator</h2>
        <p>Explore causal demand impact of promotions and safety stock tradeoffs</p>
      </div>

      <div className="chart-grid">
        <div className="chart-card chart-grid-full">
          <div className="chart-card-header">
            <div className="chart-card-title"><FiZap className="title-icon" /> Promotion Impact Simulator</div>
            <span className="badge info">Causal AI</span>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <select className="select-styled" value={skuIndex}
                onChange={(e) => setSkuIndex(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 16 }}>
                {(skuList || []).map((s, i) => (
                  <option key={s.id} value={i}>{s.name}</option>
                ))}
              </select>

              <div className="slider-container" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="slider-label">Discount Depth</span>
                  <span className="slider-value" style={{ fontSize: 16 }}>{discount}%</span>
                </div>
                <input type="range" min="5" max="50" value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))} className="slider-input" />
              </div>

              <div className="slider-container">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="slider-label">Promo Duration (weeks)</span>
                  <span className="slider-value" style={{ fontSize: 16 }}>{duration}w</span>
                </div>
                <input type="range" min="1" max="6" value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))} className="slider-input" />
              </div>
            </div>

            <div style={{ flex: 2, minWidth: 300 }}>
              {simLoading ? <Loader /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={baseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="baseline" name="Baseline Demand" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withPromo" name="With Promo" radius={[4, 4, 0, 0]}>
                      {baseData.map((entry, i) => (
                        <Cell key={i} fill={entry.isPromo ? '#7c3aed' : '#c4b5fd'} opacity={entry.isPromo ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
            <div className="section-title">
              <FiZap style={{ color: 'var(--text-accent)' }} />
              Cross-Product Impact (Cannibalization & Halo Effect)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
              {cannibalization.map((item, i) => (
                <div key={i} style={{
                  padding: '14px 18px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: item.type === 'halo' ? 'var(--mint-light)' : 'var(--peach-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    color: item.type === 'halo' ? '#059669' : '#dc2626',
                  }}>
                    {item.type === 'halo' ? <FiArrowUp /> : <FiArrowDown />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.product.split(' ').slice(0, 3).join(' ')}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.effect > 0 ? '#059669' : '#dc2626' }}>
                      {item.effect > 0 ? '+' : ''}{item.effect}% demand
                    </div>
                  </div>
                  <span className={`badge ${item.type === 'halo' ? 'success' : 'critical'}`}>
                    {item.type === 'halo' ? '✨ Halo' : '⚡ Cannibalize'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card chart-grid-full">
          <div className="chart-card-header">
            <div className="chart-card-title"><FiShield className="title-icon" /> Dynamic Safety Stock Optimizer</div>
            <span className="badge info">Cost-Aware</span>
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="slider-container" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏃 Lean Inventory</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🛡️ Aggressive Protection</span>
                </div>
                <input type="range" min="1" max="10" value={riskLevel}
                  onChange={(e) => setRiskLevel(Number(e.target.value))} className="slider-input" />
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-accent)' }}>
                  Risk Level: {riskLevel} / 10
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Holding Cost', value: safety.holdingCost, icon: '💰' },
                  { label: 'Stockout Risk', value: safety.stockoutRisk, icon: '⚠️' },
                  { label: 'Safety Days', value: `${safety.safetyDays} days`, icon: '📦' },
                  { label: 'Inventory Value', value: safety.inventoryValue, icon: '📊' },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', background: 'var(--bg-input)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
