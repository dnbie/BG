import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, Footprints, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { StepEntry } from '../types';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.78rem' }}>{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong></p>)}
      </div>
    );
  }
  return null;
};

export default function Activity() {
  const { steps, setSteps } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: '', steps: '', goal: '10000' });

  const today = steps[steps.length - 1];
  const totalWeek = steps.reduce((a, s) => a + s.steps, 0);
  const avg = Math.round(totalWeek / steps.length);
  const bestDay = steps.reduce((a, b) => b.steps > a.steps ? b : a, steps[0]);
  const daysHit = steps.filter(s => s.steps >= s.goal).length;

  const chartData = steps.map(s => ({
    date: format(new Date(s.date), 'EEE MMM d'),
    Steps: s.steps,
    Goal: s.goal,
  }));

  const handleAdd = () => {
    const entry: StepEntry = {
      date: form.date || new Date().toISOString().split('T')[0],
      steps: parseInt(form.steps) || 0,
      goal: parseInt(form.goal) || 10000,
    };
    setSteps([...steps, entry]);
    setShowModal(false);
    setForm({ date: '', steps: '', goal: '10000' });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Activity & Steps</h1>
          <p>Your daily step count and movement tracker</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Steps
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon red"><Footprints size={22} /></div>
          <div>
            <div className="stat-label">Today's Steps</div>
            <div className="stat-value">{today?.steps.toLocaleString() ?? 0}</div>
            <div className="stat-sub">{today?.goal.toLocaleString()} goal</div>
            <div className="progress-bar-wrap" style={{ marginTop: 8, width: 110 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (today?.steps ?? 0) / (today?.goal ?? 10000) * 100)}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Weekly Total</div>
            <div className="stat-value">{(totalWeek / 1000).toFixed(1)}<span style={{ fontSize: '1rem' }}>K</span></div>
            <div className="stat-sub">{totalWeek.toLocaleString()} steps</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Footprints size={22} /></div>
          <div>
            <div className="stat-label">Daily Average</div>
            <div className="stat-value">{avg.toLocaleString()}</div>
            <div className="stat-sub">This week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Goal Days Hit</div>
            <div className="stat-value">{daysHit}<span style={{ fontSize: '1rem' }}>/{steps.length}</span></div>
            <div className="stat-sub">Best: {bestDay?.steps.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Weekly Step Count</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Daily steps vs. 10,000 goal</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={10000} stroke="var(--gold)" strokeDasharray="4 4" label={{ value: 'Goal', fill: 'var(--gold)', fontSize: 11 }} />
            <Bar dataKey="Steps" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Step History</div>
        <table className="t-table">
          <thead>
            <tr><th>Date</th><th>Steps</th><th>Goal</th><th>Progress</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[...steps].reverse().map((s, i) => {
              const pct = Math.min(100, Math.round(s.steps / s.goal * 100));
              return (
                <tr key={i}>
                  <td>{format(new Date(s.date), 'EEE, MMM d')}</td>
                  <td><strong>{s.steps.toLocaleString()}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.goal.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar-wrap" style={{ width: 100 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'var(--accent)' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pct}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.steps >= s.goal ? 'badge-green' : 'badge-red'}`}>
                      {s.steps >= s.goal ? '✓ Reached' : 'Missed'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log Step Count</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Steps</label>
                <input className="input" type="number" placeholder="e.g. 8500" value={form.steps} onChange={e => setForm(p => ({ ...p, steps: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Goal</label>
                <input className="input" type="number" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
