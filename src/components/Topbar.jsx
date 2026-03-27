import { FiSearch, FiSun, FiMoon, FiBell } from 'react-icons/fi';

export default function Topbar({ title, collapsed, darkMode, onToggleDark }) {
  return (
    <header className={`topbar ${collapsed ? 'collapsed' : ''}`}>
      <div className="topbar-left">
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search SKUs, stores…" />
        </div>

        <button
          className="theme-toggle"
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="icon" key={darkMode ? 'moon' : 'sun'}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </span>
        </button>

        <button className="theme-toggle" aria-label="Notifications">
          <FiBell />
        </button>

        <div className="user-avatar" title="Admin User">
          AU
        </div>
      </div>
    </header>
  );
}
