import { NavLink } from 'react-router-dom';
import {
  FiHome, FiTrendingUp, FiGrid, FiBell,
  FiShoppingCart, FiSliders, FiBarChart2,
  FiChevronLeft, FiChevronRight, FiPackage,
} from 'react-icons/fi';

const navItems = [
  { to: '/', icon: <FiHome />, label: 'Executive Overview' },
  { to: '/forecast', icon: <FiTrendingUp />, label: 'SKU Forecast' },
  { to: '/inventory', icon: <FiGrid />, label: 'Inventory Health' },
  { to: '/alerts', icon: <FiBell />, label: 'Alert Center' },
  { to: '/reorder', icon: <FiShoppingCart />, label: 'Reorder Workbench' },
  { to: '/what-if', icon: <FiSliders />, label: 'What-If Simulator' },
  { to: '/models', icon: <FiBarChart2 />, label: 'Model Scorecard' },
  { to: '/data', icon: <FiPackage />, label: 'Data Manager' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <FiPackage />
        </div>
        <span className="logo-text">DemandPulse</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
