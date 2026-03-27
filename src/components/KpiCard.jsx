import { useEffect, useState } from 'react';
import {
  FiDollarSign, FiAlertTriangle, FiPackage, FiTarget,
  FiTrendingUp, FiTrendingDown,
} from 'react-icons/fi';

const iconMap = {
  revenue: <FiDollarSign />,
  stockout: <FiAlertTriangle />,
  overstock: <FiPackage />,
  accuracy: <FiTarget />,
};

export default function KpiCard({ data }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`kpi-card ${data.color}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className={`kpi-icon ${data.color}`}>
        {iconMap[data.id] || <FiPackage />}
      </div>
      <div className="kpi-info">
        <div className="kpi-label">{data.label}</div>
        <div className="kpi-value">{data.value}</div>
        <div className={`kpi-trend ${data.trendDirection}`}>
          {data.trendDirection === 'up' ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
          {data.trend}
        </div>
      </div>
    </div>
  );
}
