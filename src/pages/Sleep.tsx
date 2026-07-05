import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SleepEntry } from '../types';
import { format } from 'date-fns';

const qualityColors: Record<string, string> = {
  poor: 'var(--accent)',
  fair: 'var(--gold)',
  good: 'var(--blue)',
  excellent: 'var(--green)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: '0.78rem' }}>{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
      </div>
    );
  }
  return null;
};

export default function Sleep() {
  const { sleep, setSleep } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: '', bedtime: '22:00', wakeTime: '06:30', quality: 'good' as SleepEntry['quality'] });

  const avgSleep = (sleep.reduce((a, s) => a + s.hoursSlept, 0) / sleep.length).toFixed(1);
  const bestNight = Math.max(...sleep.map(s => s.hoursSlept)).toFixed(1);
  const today = sleep[sleep.length - 1];

  const chartData = sleep.map(s => ({
    date: format(new Date(s.date), 'EEE'),
    Hours: parseFloat(s.hoursSlept.toFixed(1)),
    Recommended: 8,
  }));

  const qualityData = sleep.map(s => ({
    date: format(new Date(s.date), 'EEE'),
    Score: s.quality === 'excellent' ? 4 : s.quality === 'good' ? 3 : s.quality === 'fair' ? 2 : 1,
  }));

  const handleAdd = () => {
    if (!form.date) return;
    const bed = parseInt(form.bedtime.split(':')[0]) * 60 + parseInt(form.bedtime.split(':')[1]);
    const wake = parseInt(form.wakeTime.split(':')[0]) * 60 + parseInt(form.wakeTime.split(':')[1]);
    const hrs = wake > bed ? (wake - bed) / 60 : (wake + 1440 - bed) / 60;
    const entry: SleepEntry = { ...form, hoursSlept: parseFloat(hrs.toFixed(2)) };
    setSleep([...sleep, entry]);
    setShowModal(false);
    setForm({ date: '', bedtime: '22:00', wakeTime: '06:30', quality: 'good' });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Sleep Tracker</h1>
          <p>Monitor your rest and recovery patterns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Moon size={22} /></div>
          <div>
            <div className="stat-label">Last Night</div>
            <div className="stat-value">{today?.hoursSlept.toFixed(1)}<span style={{ fontSize: '1rem' }}>hrs</span></div>
            <div className="stat-sub" style={{ color: qualityColors[today?.quality ?? 'good'] }}>{today?.quality ?? '--'} quality</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Sun size={22} /></div>
          <div>
            <div className="stat-label">7-Day Average</div>
            <div className="stat-value">{avgSleep}<span style={{ fontSize: '1rem' }}>hrs</span></div>
            <div className="stat-sub">Recommended: 7–9hrs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><Moon size={22} /></div>
          <div>
            <div className="stat-label">Best Night</div>
            <div className="stat-value">{bestNight}<span style={{ fontSize: '1rem' }}>hrs</span></div>
            <div className="stat-sub">This week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Moon size={22} /></div>
          <div>
            <div className="stat-label">Tonight's Goal</div>
            <div className="stat-value">8<span style={{ fontSize: '1rem' }}>hrs</span></div>
            <div className="stat-sub">Bedtime: 10:30 PM</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Hours Slept</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Daily hours vs. 8hr recommendation</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 12]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Hours" stroke="var(--blue)" fill="url(#sleepAreaGrad)" strokeWidth={2.5} dot={{ fill: 'var(--blue)', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Sleep Quality Score</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>1=Poor, 2=Fair, 3=Good, 4=Excellent</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={qualityData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 4]} ticks={[1, 2, 3, 4]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Score" fill="var(--purple)" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Log Table */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Sleep Log</div>
        <table className="t-table">
          <thead>
            <tr><th>Date</th><th>Bedtime</th><th>Wake Time</th><th>Duration</th><th>Quality</th></tr>
          </thead>
          <tbody>
            {[...sleep].reverse().map((s, i) => (
              <tr key={i}>
                <td>{format(new Date(s.date), 'EEE, MMM d')}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.bedtime}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.wakeTime}</td>
                <td><strong>{s.hoursSlept.toFixed(1)} hrs</strong></td>
                <td>
                  <span className="badge" style={{ background: `${qualityColors[s.quality]}22`, color: qualityColors[s.quality] }}>
                    {s.quality}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log Sleep</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Bedtime</label>
                  <input className="input" type="time" value={form.bedtime} onChange={e => setForm(p => ({ ...p, bedtime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Wake Time</label>
                  <input className="input" type="time" value={form.wakeTime} onChange={e => setForm(p => ({ ...p, wakeTime: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sleep Quality</label>
                <select className="input" value={form.quality} onChange={e => setForm(p => ({ ...p, quality: e.target.value as SleepEntry['quality'] }))}>
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Log Sleep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
