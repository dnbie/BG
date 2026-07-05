import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BodyMeasurement } from '../types';
import { format } from 'date-fns';

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

export default function Measurements() {
  const { measurements, setMeasurements } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: '', weight: '', chest: '', waist: '', hips: '', thighs: '', arms: '', bodyFat: '' });

  const latest = measurements[measurements.length - 1];
  const prev = measurements[measurements.length - 2];

  const diff = (curr: number, p: number) => {
    const d = (curr - p).toFixed(1);
    return { val: d, positive: parseFloat(d) > 0 };
  };

  const handleAdd = () => {
    const entry: BodyMeasurement = {
      date: form.date || new Date().toISOString().split('T')[0],
      weight: parseFloat(form.weight) || latest.weight,
      chest: parseFloat(form.chest) || latest.chest,
      waist: parseFloat(form.waist) || latest.waist,
      hips: parseFloat(form.hips) || latest.hips,
      thighs: parseFloat(form.thighs) || latest.thighs,
      arms: parseFloat(form.arms) || latest.arms,
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
    };
    setMeasurements([...measurements, entry]);
    setShowModal(false);
    setForm({ date: '', weight: '', chest: '', waist: '', hips: '', thighs: '', arms: '', bodyFat: '' });
  };

  const chartData = measurements.map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    Weight: parseFloat(m.weight.toFixed(1)),
    Chest: m.chest,
    Waist: m.waist,
    Hips: m.hips,
    Arms: m.arms,
    'Body Fat %': m.bodyFat,
  }));

  const stats = [
    { label: 'Weight', key: 'weight', unit: 'kg', color: 'var(--accent)' },
    { label: 'Chest', key: 'chest', unit: 'cm', color: 'var(--blue)' },
    { label: 'Waist', key: 'waist', unit: 'cm', color: 'var(--gold)' },
    { label: 'Hips', key: 'hips', unit: 'cm', color: 'var(--purple)' },
    { label: 'Thighs', key: 'thighs', unit: 'cm', color: 'var(--green)' },
    { label: 'Arms', key: 'arms', unit: 'cm', color: 'var(--accent-light)' },
    { label: 'Body Fat', key: 'bodyFat', unit: '%', color: 'var(--gold)' },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Body Measurements</h1>
          <p>Track your body composition changes over time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Measurements
        </button>
      </div>

      {/* Latest measurements */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.slice(0, 4).map(s => {
          const curr = latest?.[s.key as keyof BodyMeasurement] as number | undefined;
          const p = prev?.[s.key as keyof BodyMeasurement] as number | undefined;
          const d = curr !== undefined && p !== undefined ? diff(curr, p) : null;
          return (
            <div key={s.key} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{s.unit}</span>
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{curr?.toFixed(1) ?? '--'}<span style={{ fontSize: '1rem', fontWeight: 500 }}>{s.unit}</span></div>
                {d && (
                  <div className="stat-sub" style={{ color: d.positive ? 'var(--accent)' : 'var(--green)' }}>
                    {d.positive ? '+' : ''}{d.val}{s.unit} from last
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Weight & Body Fat Trend</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Track body composition over time</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[5, 40]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="Weight" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="Body Fat %" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: 'var(--gold)', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Circumference Measurements</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Chest, Waist, Hips, Arms (cm)</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Chest" stroke="var(--blue)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Waist" stroke="var(--gold)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Hips" stroke="var(--purple)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Arms" stroke="var(--green)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History Table */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Measurement History</div>
        <table className="t-table">
          <thead>
            <tr><th>Date</th><th>Weight</th><th>Chest</th><th>Waist</th><th>Hips</th><th>Arms</th><th>Body Fat</th></tr>
          </thead>
          <tbody>
            {[...measurements].reverse().map((m, i) => (
              <tr key={i}>
                <td>{format(new Date(m.date), 'MMM d, yyyy')}</td>
                <td><strong>{m.weight.toFixed(1)} kg</strong></td>
                <td>{m.chest} cm</td>
                <td>{m.waist} cm</td>
                <td>{m.hips} cm</td>
                <td>{m.arms} cm</td>
                <td>{m.bodyFat ? `${m.bodyFat.toFixed(1)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log Body Measurements</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              {[
                { key: 'weight', label: 'Weight (kg)' },
                { key: 'chest', label: 'Chest (cm)' },
                { key: 'waist', label: 'Waist (cm)' },
                { key: 'hips', label: 'Hips (cm)' },
                { key: 'thighs', label: 'Thighs (cm)' },
                { key: 'arms', label: 'Arms (cm)' },
                { key: 'bodyFat', label: 'Body Fat (%)' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="input" type="number" step="0.1" value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
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
