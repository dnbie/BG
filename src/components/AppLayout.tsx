import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Bell, Settings, ShieldCheck, PanelLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: "Your daily performance overview" },
  '/activity': { title: 'Activity & Steps', sub: 'Weekly step count and movement' },
  '/workouts': { title: 'Workouts', sub: 'Training sessions & exercises' },
  '/strength': { title: 'Strength PRs', sub: 'Personal records tracker' },
  '/measurements': { title: 'Body Measurements', sub: 'Track your body composition' },
  '/photos': { title: 'Progress Photos', sub: 'Before & after visual journey' },
  '/nutrition': { title: 'Nutrition & Diet', sub: 'Food tracking and macros' },
  '/sleep': { title: 'Sleep Tracker', sub: 'Recovery and rest analysis' },
  '/programs': { title: 'My Program', sub: 'Training programs and goals' },
  '/admin': { title: 'Admin Dashboard', sub: 'Client overview and management' },
  '/import': { title: 'Import Data', sub: 'Upload any format — AI maps it automatically' },
};

export default function AppLayout() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 900 : true
  );
  const page = pageTitles[location.pathname] ?? { title: 'Train to Transform', sub: '' };

  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onNavigate={closeOnMobile} />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className={`main-content${sidebarOpen ? '' : ' expanded'}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-btn sidebar-toggle"
              onClick={() => setSidebarOpen(v => !v)}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-label="Toggle sidebar"
            >
              <PanelLeft size={16} />
            </button>
            <div>
              <div className="topbar-title">{page.title}</div>
              <div className="topbar-subtitle">{page.sub}</div>
            </div>
          </div>
          <div className="topbar-right">
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--gold-light)', fontWeight: 600 }}>
                <ShieldCheck size={14} style={{ color: 'var(--gold)' }} />
                Admin
              </div>
            )}
            {user && (
              <div className="topbar-username" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                {user.name}
              </div>
            )}
            <button className="topbar-btn"><Bell size={16} /></button>
            {!isAdmin && (
              <NavLink to="/profile" className="topbar-btn">
                <Settings size={16} />
              </NavLink>
            )}
          </div>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
