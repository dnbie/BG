import { useState } from 'react';
import {
  Users, TrendingUp, AlertTriangle,
  Search, Eye, Footprints, Moon, Dumbbell,
  CheckCircle2, Clock, XCircle, Sparkles, ChevronDown, ChevronUp, Mail,
  UserPlus, Pencil, Trash2, X
} from 'lucide-react';
import { mockClients } from '../data/clients';
import type { ClientRecord, ClientStatus } from '../data/clients';
import type { ProgramType } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import './Admin.css';

const PROGRAM_OPTIONS: { value: ProgramType; label: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'post_pregnancy', label: 'Post-Pregnancy' },
  { value: 'pre_wedding', label: 'Pre-Wedding' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'strength', label: 'Strength' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
];

interface ClientFormState {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  status: ClientStatus;
  program: ProgramType;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  weeklySteps: number;
  avgSleep: number;
  workoutsThisMonth: number;
  bodyFat: number | '';
  membershipExpiry: string;
  progress: number;
  notes: string;
}

const emptyForm: ClientFormState = {
  name: '', email: '', age: 25, gender: 'male', status: 'new',
  program: 'weight_loss', startWeight: 70, currentWeight: 70, targetWeight: 65,
  weeklySteps: 0, avgSleep: 0, workoutsThisMonth: 0, bodyFat: '',
  membershipExpiry: '', progress: 0, notes: '',
};

const statusConfig: Record<ClientStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active:   { label: 'Active',   color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  icon: CheckCircle2 },
  inactive: { label: 'Inactive', color: '#e63946', bg: 'rgba(230,57,70,0.12)',   icon: XCircle },
  paused:   { label: 'Paused',   color: '#f5a623', bg: 'rgba(245,166,35,0.12)',  icon: Clock },
  new:      { label: 'New',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Sparkles },
};

const programColors: Record<string, string> = {
  weight_loss: '#e63946', weight_gain: '#f5a623', fat_loss: '#8b5cf6',
  post_pregnancy: '#f472b6', pre_wedding: '#fbbf24', lifestyle: '#2ecc71',
  strength: '#3b82f6', bodybuilding: '#e63946',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getLastSeenLabel(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: ClientStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="prog-track">
      <div className="prog-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

type SortKey = 'name' | 'lastSeen' | 'status' | 'progress' | 'workoutsThisMonth';

export default function Admin() {
  const [clients, setClients] = useState<ClientRecord[]>(mockClients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('lastSeen');
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Add / edit client modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (client: ClientRecord) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      age: client.age,
      gender: client.gender,
      status: client.status,
      program: client.program,
      startWeight: client.startWeight,
      currentWeight: client.currentWeight,
      targetWeight: client.targetWeight,
      weeklySteps: client.weeklySteps,
      avgSleep: client.avgSleep,
      workoutsThisMonth: client.workoutsThisMonth,
      bodyFat: client.bodyFat ?? '',
      membershipExpiry: client.membershipExpiry,
      progress: client.progress,
      notes: client.notes ?? '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const programLabel = PROGRAM_OPTIONS.find(p => p.value === form.program)?.label ?? form.program;
    const base = {
      name: form.name.trim(),
      email: form.email.trim(),
      age: Number(form.age) || 0,
      gender: form.gender,
      status: form.status,
      program: form.program,
      programLabel,
      startWeight: Number(form.startWeight) || 0,
      currentWeight: Number(form.currentWeight) || 0,
      targetWeight: Number(form.targetWeight) || 0,
      weeklySteps: Number(form.weeklySteps) || 0,
      avgSleep: Number(form.avgSleep) || 0,
      workoutsThisMonth: Number(form.workoutsThisMonth) || 0,
      bodyFat: form.bodyFat === '' ? undefined : Number(form.bodyFat),
      membershipExpiry: form.membershipExpiry || today,
      progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
      notes: form.notes.trim() || undefined,
    };

    if (editingId) {
      setClients(prev => prev.map(c => (c.id === editingId ? { ...c, ...base } : c)));
    } else {
      const newClient: ClientRecord = {
        id: `c${Date.now()}`,
        joinDate: today,
        lastSeen: today,
        ...base,
      };
      setClients(prev => [newClient, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (client: ClientRecord) => {
    if (!window.confirm(`Delete ${client.name}? This cannot be undone.`)) return;
    setClients(prev => prev.filter(c => c.id !== client.id));
    if (expanded === client.id) setExpanded(null);
  };

  const counts = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    paused: clients.filter(c => c.status === 'paused').length,
    new: clients.filter(c => c.status === 'new').length,
  };

  const avgProgress = clients.length
    ? Math.round(clients.reduce((a, c) => a + c.progress, 0) / clients.length)
    : 0;

  const filtered = clients
    .filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.programLabel.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'lastSeen') cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortKey === 'progress') cmp = a.progress - b.progress;
      else if (sortKey === 'workoutsThisMonth') cmp = a.workoutsThisMonth - b.workoutsThisMonth;
      return sortAsc ? cmp : -cmp;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p>Manage all clients, monitor progress, and track programme status</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={16} /> Add Client
        </button>
      </div>

      {/* Stat overview */}
      <div className="admin-stat-row">
        <div className="admin-stat-card">
          <div className="stat-icon blue"><Users size={20} /></div>
          <div>
            <div className="stat-label">Total Clients</div>
            <div className="stat-value">{counts.total}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon green"><CheckCircle2 size={20} /></div>
          <div>
            <div className="stat-label">Active</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{counts.active}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon red"><XCircle size={20} /></div>
          <div>
            <div className="stat-label">Inactive</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{counts.inactive}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon gold"><Clock size={20} /></div>
          <div>
            <div className="stat-label">Paused</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{counts.paused}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon purple"><Sparkles size={20} /></div>
          <div>
            <div className="stat-label">New Clients</div>
            <div className="stat-value" style={{ color: 'var(--purple)' }}>{counts.new}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-label">Avg Progress</div>
            <div className="stat-value">{avgProgress}<span style={{ fontSize: '1rem' }}>%</span></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name, email or programme…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {(['all', 'active', 'inactive', 'paused', 'new'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? `All (${counts.total})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s as keyof typeof counts]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>Client <SortIcon k="name" /></th>
                <th>Programme</th>
                <th className="sortable" onClick={() => handleSort('status')}>Status <SortIcon k="status" /></th>
                <th className="sortable" onClick={() => handleSort('lastSeen')}>Last Active <SortIcon k="lastSeen" /></th>
                <th className="sortable" onClick={() => handleSort('progress')}>Progress <SortIcon k="progress" /></th>
                <th>Weight</th>
                <th><Footprints size={13} style={{ verticalAlign: 'middle' }} /> Steps/wk</th>
                <th><Moon size={13} style={{ verticalAlign: 'middle' }} /> Avg Sleep</th>
                <th className="sortable" onClick={() => handleSort('workoutsThisMonth')}><Dumbbell size={13} style={{ verticalAlign: 'middle' }} /> Sessions <SortIcon k="workoutsThisMonth" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const isExpanded = expanded === client.id;
                const cfg = statusConfig[client.status];
                const pColor = programColors[client.program] ?? 'var(--accent)';
                const weightDiff = client.currentWeight - client.startWeight;

                return (
                  <>
                    <tr key={client.id} className={`client-row ${client.status === 'inactive' ? 'row-dim' : ''}`}>
                      <td>
                        <div className="client-name-cell">
                          <div className="client-avatar" style={{ background: `${pColor}22`, color: pColor }}>
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <div className="client-name">{client.name}</div>
                            <div className="client-email">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="prog-chip" style={{ background: `${pColor}18`, color: pColor, borderColor: `${pColor}33` }}>
                          {client.programLabel}
                        </span>
                      </td>
                      <td><StatusBadge status={client.status} /></td>
                      <td className="last-seen">{getLastSeenLabel(client.lastSeen)}</td>
                      <td>
                        <div style={{ minWidth: 100 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.78rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                            <span style={{ fontWeight: 700 }}>{client.progress}%</span>
                          </div>
                          <ProgressBar value={client.progress} color={pColor} />
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 700 }}>{client.currentWeight} kg</span>
                          <div style={{ fontSize: '0.75rem', color: weightDiff < 0 ? 'var(--green)' : weightDiff > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                            {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{client.weeklySteps > 0 ? (client.weeklySteps / 1000).toFixed(1) + 'K' : '—'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontWeight: 600 }}>{client.avgSleep > 0 ? client.avgSleep.toFixed(1) : '—'}</span>
                          {client.avgSleep > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>hrs</span>}
                          {client.avgSleep > 0 && client.avgSleep < 6.5 && (
                            <AlertTriangle size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600 }}>{client.workoutsThisMonth}</span>
                          {client.workoutsThisMonth < 5 && client.status === 'active' && (
                            <AlertTriangle size={12} style={{ color: 'var(--accent)' }} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" title="View Details" onClick={() => setExpanded(isExpanded ? null : client.id)}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Edit Client" onClick={() => openEdit(client)}>
                            <Pencil size={14} />
                          </button>
                          <a href={`mailto:${client.email}`} className="btn btn-ghost btn-icon btn-sm" title="Send Email">
                            <Mail size={14} />
                          </a>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Delete Client" onClick={() => handleDelete(client)}>
                            <Trash2 size={14} style={{ color: 'var(--accent)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${client.id}-exp`} className="expanded-row">
                        <td colSpan={10}>
                          <div className="client-detail-panel">
                            <div className="detail-grid">
                              <div className="detail-section">
                                <div className="detail-section-title">Personal Info</div>
                                <div className="detail-item"><span>Age</span><strong>{client.age} yrs</strong></div>
                                <div className="detail-item"><span>Gender</span><strong>{client.gender.charAt(0).toUpperCase() + client.gender.slice(1)}</strong></div>
                                <div className="detail-item"><span>Member Since</span><strong>{format(new Date(client.joinDate), 'MMM d, yyyy')}</strong></div>
                                <div className="detail-item"><span>Membership Expires</span><strong>{format(new Date(client.membershipExpiry), 'MMM d, yyyy')}</strong></div>
                              </div>
                              <div className="detail-section">
                                <div className="detail-section-title">Body Metrics</div>
                                <div className="detail-item"><span>Start Weight</span><strong>{client.startWeight} kg</strong></div>
                                <div className="detail-item"><span>Current Weight</span><strong>{client.currentWeight} kg</strong></div>
                                <div className="detail-item"><span>Target Weight</span><strong>{client.targetWeight} kg</strong></div>
                                {client.bodyFat && <div className="detail-item"><span>Body Fat</span><strong>{client.bodyFat}%</strong></div>}
                              </div>
                              <div className="detail-section">
                                <div className="detail-section-title">This Month</div>
                                <div className="detail-item"><span>Workouts</span><strong>{client.workoutsThisMonth} sessions</strong></div>
                                <div className="detail-item"><span>Avg Steps/wk</span><strong>{client.weeklySteps > 0 ? client.weeklySteps.toLocaleString() : '—'}</strong></div>
                                <div className="detail-item"><span>Avg Sleep</span><strong>{client.avgSleep > 0 ? `${client.avgSleep} hrs` : '—'}</strong></div>
                              </div>
                              {client.notes && (
                                <div className="detail-section">
                                  <div className="detail-section-title">Coach Notes</div>
                                  <p className="detail-notes">{client.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No clients match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit client modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="modal-title" style={{ marginBottom: 0 }}>
                {editingId ? 'Edit Client' : 'Add New Client'}
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeForm} title="Close">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sarah Mitchell" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="input" type="number" min={0} value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Programme</label>
                <select className="input" value={form.program} onChange={e => setForm({ ...form, program: e.target.value as ProgramType })}>
                  {PROGRAM_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ClientStatus })}>
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Weight (kg)</label>
                <input className="input" type="number" min={0} value={form.startWeight} onChange={e => setForm({ ...form, startWeight: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Weight (kg)</label>
                <input className="input" type="number" min={0} value={form.currentWeight} onChange={e => setForm({ ...form, currentWeight: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Weight (kg)</label>
                <input className="input" type="number" min={0} value={form.targetWeight} onChange={e => setForm({ ...form, targetWeight: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Body Fat (%)</label>
                <input className="input" type="number" min={0} value={form.bodyFat} onChange={e => setForm({ ...form, bodyFat: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="optional" />
              </div>
              <div className="form-group">
                <label className="form-label">Weekly Steps</label>
                <input className="input" type="number" min={0} value={form.weeklySteps} onChange={e => setForm({ ...form, weeklySteps: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Avg Sleep (hrs)</label>
                <input className="input" type="number" min={0} step={0.1} value={form.avgSleep} onChange={e => setForm({ ...form, avgSleep: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Sessions / Month</label>
                <input className="input" type="number" min={0} value={form.workoutsThisMonth} onChange={e => setForm({ ...form, workoutsThisMonth: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Progress (%)</label>
                <input className="input" type="number" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Membership Expiry</label>
                <input className="input" type="date" value={form.membershipExpiry} onChange={e => setForm({ ...form, membershipExpiry: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Coach Notes</label>
                <textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes about this client…" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim() || !form.email.trim()}>
                {editingId ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
