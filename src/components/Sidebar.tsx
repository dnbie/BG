import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Dumbbell, Utensils, Moon,
  Camera, Activity, Target, Heart, Zap, ShieldCheck, LogOut, Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/activity', icon: Activity, label: 'Activity & Steps' },
    ]
  },
  {
    label: 'Training',
    items: [
      { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
      { to: '/strength', icon: Zap, label: 'Strength PRs' },
    ]
  },
  {
    label: 'Body',
    items: [
      { to: '/measurements', icon: Target, label: 'Body Measurements' },
      { to: '/photos', icon: Camera, label: 'Progress Photos' },
    ]
  },
  {
    label: 'Wellness',
    items: [
      { to: '/nutrition', icon: Utensils, label: 'Nutrition & Diet' },
      { to: '/sleep', icon: Moon, label: 'Sleep Tracker' },
    ]
  },
  {
    label: 'AI & Tools',
    items: [
      { to: '/import', icon: Upload, label: 'Import Data' },
    ]
  },
  {
    label: 'Programs',
    items: [
      { to: '/programs', icon: Heart, label: 'My Program' },
      { to: '/profile', icon: User, label: 'Profile & Settings' },
    ]
  }
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { profile } = useApp();
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name ?? profile.name).split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const displayName = user?.name ?? profile.name;
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🏋️</div>
          <div className="logo-text">
            <span className="brand">Train to Transform</span>
            <span className="tagline">Elite Performance</span>
          </div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="avatar">
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt={displayName} />
            : initials}
        </div>
        <div className="user-info">
          <div className="name">{displayName}</div>
          <div className="program">
            {isAdmin
              ? <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.72rem' }}>⚡ Admin / Coach</span>
              : (profile.program ?? 'No program set')}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <div className="nav-group">
            <div className="nav-group-label">Administration</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              style={{ background: 'rgba(245,166,35,0.08)', borderColor: 'rgba(245,166,35,0.2)', color: 'var(--gold-light)' }}
            >
              <ShieldCheck className="nav-icon" size={18} style={{ color: 'var(--gold)' }} />
              Admin Dashboard
            </NavLink>
          </div>
        ) : (
          navGroups.map(group => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <item.icon className="nav-icon" size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))
        )}
      </nav>

      <div className="sidebar-footer">
        {!isAdmin && (
          <div className="health-connect-badge">
            <span className="dot" />
            <span>Connect Health App</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ marginTop: 8, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
          onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-dark)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-light)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
