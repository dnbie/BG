import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trophy, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PREntry } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

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

export default function Strength() {
  const { prs, setPRs } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ exercise: '', weight: '', reps: '', date: '', notes: '' });

  const exercises = [...new Set(prs.map(p => p.exercise))];
  const [selectedExercise, setSelectedExercise] = useState(exercises[0] ?? '');

  const exercisePRs = prs
    .filter(p => p.exercise === selectedExercise)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const topPRs = exercises.map(ex => {
    const best = prs.filter(p => p.exercise === ex).sort((a, b) => b.weight - a.weight)[0];
    return best;
  }).filter(Boolean);

  const handleAdd = () => {
    const entry: PREntry = {
      id: uuidv4(),
      exercise: form.exercise,
      weight: parseFloat(form.weight) || 0,
      reps: parseInt(form.reps) || 1,
      date: form.date || new Date().toISOString().split('T')[0],
      notes: form.notes || undefined,
    };
    setPRs([...prs, entry]);
    if (!exercises.includes(form.exercise)) setSelectedExercise(form.exercise);
    setShowModal(false);
    setForm({ exercise: '', weight: '', reps: '', date: '', notes: '' });
  };

  const deletePR = (id: string) => setPRs(prs.filter(p => p.id !== id));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Strength PRs</h1>
          <p>Personal records for all major lifts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log PR
        </button>
      </div>

      {/* PR Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {topPRs.slice(0, 6).map(pr => (
          <div key={pr.id} className="stat-card">
            <div className="stat-icon gold"><Trophy size={22} /></div>
            <div>
              <div className="stat-label">{pr.exercise}</div>
              <div className="stat-value">{pr.weight > 0 ? `${pr.weight}` : 'BW'}<span style={{ fontSize: '1rem', fontWeight: 500 }}>{pr.weight > 0 ? 'kg' : ''}</span></div>
              <div className="stat-sub">{pr.reps} reps · {format(new Date(pr.date), 'MMM d')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise PRs Chart */}
      {exercises.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700 }}>PR Progress Over Time</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Track weight lifted per exercise</div>
            </div>
            <select
              className="input"
              style={{ width: 'auto' }}
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
            >
              {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={exercisePRs.map(p => ({ date: format(new Date(p.date), 'MMM d'), Weight: p.weight, Reps: p.reps }))} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Weight" stroke="var(--gold)" strokeWidth={2.5} dot={{ fill: 'var(--gold)', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* All PRs horizontal bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Best Lifts Comparison</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Max weight across all tracked exercises</div>
        <ResponsiveContainer width="100%" height={Math.max(180, topPRs.length * 40)}>
          <BarChart data={topPRs.map(p => ({ name: p.exercise, 'Max Weight (kg)': p.weight }))} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} unit=" kg" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Max Weight (kg)" fill="var(--accent)" radius={[0, 6, 6, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full Log */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Full PR Log</div>
        <table className="t-table">
          <thead>
            <tr><th>Exercise</th><th>Weight</th><th>Reps</th><th>Date</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {[...prs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(pr => (
              <tr key={pr.id}>
                <td><strong>{pr.exercise}</strong></td>
                <td><span className="badge badge-gold">{pr.weight > 0 ? `${pr.weight} kg` : 'Bodyweight'}</span></td>
                <td>{pr.reps} reps</td>
                <td style={{ color: 'var(--text-secondary)' }}>{format(new Date(pr.date), 'MMM d, yyyy')}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{pr.notes ?? '—'}</td>
                <td>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deletePR(pr.id)}>
                    <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log Personal Record</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Exercise</label>
                <input className="input" list="exercise-list" placeholder="e.g. Bench Press" value={form.exercise} onChange={e => setForm(p => ({ ...p, exercise: e.target.value }))} />
                <datalist id="exercise-list">
                  {['Bench Press','Squat','Deadlift','Overhead Press','Pull-ups','Barbell Row','Romanian Deadlift','Incline Press','Dip','Leg Press'].map(e => <option key={e} value={e} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg) — 0 for BW</label>
                <input className="input" type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Reps</label>
                <input className="input" type="number" value={form.reps} onChange={e => setForm(p => ({ ...p, reps: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="input" placeholder="e.g. Belt used, new PR!" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save PR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
