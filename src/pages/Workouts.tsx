import React, { useState } from 'react';
import { Plus, Dumbbell, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { WorkoutSession } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export default function Workouts() {
  const { workouts, setWorkouts } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', date: '', duration: '', notes: '' });

  const handleAdd = () => {
    const session: WorkoutSession = {
      id: uuidv4(),
      name: form.name || 'Workout',
      date: form.date || new Date().toISOString().split('T')[0],
      duration: parseInt(form.duration) || 60,
      exercises: [],
      notes: form.notes || undefined,
    };
    setWorkouts([session, ...workouts]);
    setShowModal(false);
    setForm({ name: '', date: '', duration: '', notes: '' });
  };

  const totalSets = workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0);
  const totalTime = workouts.reduce((a, w) => a + w.duration, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Workouts</h1>
          <p>Log and review your training sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Workout
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon red"><Dumbbell size={22} /></div>
          <div>
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value">{workouts.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><Clock size={22} /></div>
          <div>
            <div className="stat-label">Total Time</div>
            <div className="stat-value">{Math.floor(totalTime / 60)}<span style={{ fontSize: '1rem' }}>h</span> {totalTime % 60}<span style={{ fontSize: '1rem' }}>m</span></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Dumbbell size={22} /></div>
          <div>
            <div className="stat-label">Total Sets Logged</div>
            <div className="stat-value">{totalSets}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Clock size={22} /></div>
          <div>
            <div className="stat-label">Avg Duration</div>
            <div className="stat-value">{workouts.length ? Math.round(totalTime / workouts.length) : 0}<span style={{ fontSize: '1rem' }}>min</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {workouts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
            No workouts logged yet. Log your first session!
          </div>
        )}
        {workouts.map(w => (
          <div key={w.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="stat-icon red" style={{ width: 40, height: 40 }}><Dumbbell size={18} /></div>
                <div>
                  <div style={{ fontWeight: 700 }}>{w.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {format(new Date(w.date), 'EEE, MMM d yyyy')} · {w.duration} min · {w.exercises.length} exercises
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={e => { e.stopPropagation(); setWorkouts(workouts.filter(x => x.id !== w.id)); }}
                >
                  <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                {expanded === w.id ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>

            {expanded === w.id && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {w.exercises.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No exercises logged for this session.</p>
                ) : (
                  <table className="t-table">
                    <thead>
                      <tr><th>Exercise</th><th>Sets</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {w.exercises.map(ex => (
                        <tr key={ex.id}>
                          <td><strong>{ex.name}</strong></td>
                          <td>{ex.sets.length}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {ex.sets.map((s, i) => `${s.weight > 0 ? s.weight + 'kg' : 'BW'} × ${s.reps}`).join(' | ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {w.notes && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📝 {w.notes}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log Workout Session</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Session Name</label>
                <input className="input" list="session-list" placeholder="e.g. Push Day A" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <datalist id="session-list">
                  {['Push Day A','Pull Day A','Leg Day','Upper Body','Lower Body','Full Body','Cardio','HIIT','Active Recovery'].map(n => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input className="input" type="number" placeholder="60" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="input" placeholder="How did the session go?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
