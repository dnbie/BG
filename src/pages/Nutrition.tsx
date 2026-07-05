import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { Plus, Trash2, Apple, Droplets, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MealEntry } from '../types';
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

const CALORIE_GOAL = 2400;
const PROTEIN_GOAL = 160;
const CARBS_GOAL = 280;
const FAT_GOAL = 80;
const WATER_GOAL = 3.0;

export default function Nutrition() {
  const { nutrition, setNutrition } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', time: '' });

  const today = nutrition[nutrition.length - 1];
  const caloriesLeft = CALORIE_GOAL - (today?.calories ?? 0);

  const addMeal = () => {
    const meal: MealEntry = {
      id: uuidv4(),
      name: newMeal.name || 'Meal',
      calories: parseFloat(newMeal.calories) || 0,
      protein: parseFloat(newMeal.protein) || 0,
      carbs: parseFloat(newMeal.carbs) || 0,
      fat: parseFloat(newMeal.fat) || 0,
      time: newMeal.time || '12:00',
    };
    const updated = [...nutrition];
    const last = { ...updated[updated.length - 1] };
    last.meals = [...(last.meals ?? []), meal];
    last.calories += meal.calories;
    last.protein += meal.protein;
    last.carbs += meal.carbs;
    last.fat += meal.fat;
    updated[updated.length - 1] = last;
    setNutrition(updated);
    setShowModal(false);
    setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', time: '' });
  };

  const removeMeal = (id: string) => {
    const updated = [...nutrition];
    const last = { ...updated[updated.length - 1] };
    const meal = last.meals.find(m => m.id === id);
    if (!meal) return;
    last.meals = last.meals.filter(m => m.id !== id);
    last.calories -= meal.calories;
    last.protein -= meal.protein;
    last.carbs -= meal.carbs;
    last.fat -= meal.fat;
    updated[updated.length - 1] = last;
    setNutrition(updated);
  };

  const macroRing = [
    { name: 'Protein', value: Math.round((today?.protein ?? 0) / PROTEIN_GOAL * 100), fill: 'var(--accent)' },
    { name: 'Carbs', value: Math.round((today?.carbs ?? 0) / CARBS_GOAL * 100), fill: 'var(--gold)' },
    { name: 'Fat', value: Math.round((today?.fat ?? 0) / FAT_GOAL * 100), fill: 'var(--blue)' },
  ];

  const weeklyCalories = nutrition.map(n => ({
    date: format(new Date(n.date), 'EEE'),
    Calories: n.calories,
    Goal: CALORIE_GOAL,
  }));

  const macroTrend = nutrition.map(n => ({
    date: format(new Date(n.date), 'EEE'),
    Protein: n.protein,
    Carbs: n.carbs,
    Fat: n.fat,
  }));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Nutrition & Diet</h1>
          <p>Track your meals, macros, and hydration</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Meal
        </button>
      </div>

      {/* Today's summary */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon red"><Flame size={22} /></div>
          <div>
            <div className="stat-label">Calories</div>
            <div className="stat-value">{today?.calories.toLocaleString() ?? 0}</div>
            <div className="stat-sub">{caloriesLeft > 0 ? `${caloriesLeft} kcal left` : `${Math.abs(caloriesLeft)} kcal over`}</div>
            <div className="progress-bar-wrap" style={{ marginTop: 8, width: 110 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, ((today?.calories ?? 0) / CALORIE_GOAL) * 100)}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red" style={{ background: 'rgba(230,57,70,0.12)', color: 'var(--accent)' }}><Apple size={22} /></div>
          <div>
            <div className="stat-label">Protein</div>
            <div className="stat-value">{today?.protein ?? 0}<span style={{ fontSize: '1rem' }}>g</span></div>
            <div className="stat-sub">Goal: {PROTEIN_GOAL}g</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><Apple size={22} /></div>
          <div>
            <div className="stat-label">Carbs</div>
            <div className="stat-value">{today?.carbs ?? 0}<span style={{ fontSize: '1rem' }}>g</span></div>
            <div className="stat-sub">Goal: {CARBS_GOAL}g</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Droplets size={22} /></div>
          <div>
            <div className="stat-label">Water</div>
            <div className="stat-value">{today?.water.toFixed(1) ?? 0}<span style={{ fontSize: '1rem' }}>L</span></div>
            <div className="stat-sub">Goal: {WATER_GOAL}L</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Weekly Calories Chart */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Weekly Calorie Intake</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Daily vs. goal</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyCalories} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Calories" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="Goal" stroke="var(--gold)" strokeDasharray="4 4" dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Macro Trend */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Macro Breakdown</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Protein, Carbs & Fat this week</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={macroTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="carbsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Protein" stroke="var(--accent)" fill="url(#proteinGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Carbs" stroke="var(--gold)" fill="url(#carbsGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Fat" stroke="var(--blue)" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Meals */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Today's Meals</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{format(new Date(), 'EEEE, MMMM d')}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add
          </button>
        </div>
        {(today?.meals?.length ?? 0) === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No meals logged today. Add your first meal!
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr><th>Meal</th><th>Time</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th></th></tr>
            </thead>
            <tbody>
              {today?.meals.map(m => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.time}</td>
                  <td><span className="badge badge-red">{m.calories} kcal</span></td>
                  <td style={{ color: 'var(--accent)' }}>{m.protein}g</td>
                  <td style={{ color: 'var(--gold)' }}>{m.carbs}g</td>
                  <td style={{ color: 'var(--blue)' }}>{m.fat}g</td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeMeal(m.id)}>
                      <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Meal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Log a Meal</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Meal Name</label>
                <input className="input" placeholder="e.g. Chicken Rice Bowl" value={newMeal.name} onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="input" type="time" value={newMeal.time} onChange={e => setNewMeal(p => ({ ...p, time: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Calories (kcal)</label>
                <input className="input" type="number" value={newMeal.calories} onChange={e => setNewMeal(p => ({ ...p, calories: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Protein (g)</label>
                <input className="input" type="number" value={newMeal.protein} onChange={e => setNewMeal(p => ({ ...p, protein: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Carbs (g)</label>
                <input className="input" type="number" value={newMeal.carbs} onChange={e => setNewMeal(p => ({ ...p, carbs: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fat (g)</label>
                <input className="input" type="number" value={newMeal.fat} onChange={e => setNewMeal(p => ({ ...p, fat: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={addMeal}>Log Meal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
