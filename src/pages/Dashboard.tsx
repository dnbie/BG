import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Footprints, Flame, Dumbbell, Moon, TrendingUp, Trophy, Apple, Droplets } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import AICoach from '../components/AICoach';
import './Dashboard.css';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { profile, steps, measurements, prs, sleep, nutrition } = useApp();

  const todaySteps = steps[steps.length - 1]?.steps ?? 0;
  const stepGoal = steps[steps.length - 1]?.goal ?? 10000;
  const stepPct = Math.min(100, Math.round((todaySteps / stepGoal) * 100));

  const latestWeight = measurements[measurements.length - 1]?.weight.toFixed(1) ?? '--';
  const prevWeight = measurements[measurements.length - 2]?.weight ?? 0;
  const weightDiff = measurements.length > 1
    ? (measurements[measurements.length - 1].weight - prevWeight).toFixed(1)
    : '0';

  const topPR = [...prs].sort((a, b) => b.weight - a.weight)[0];

  const todaySleep = sleep[sleep.length - 1]?.hoursSlept.toFixed(1) ?? '--';
  const todayCalories = nutrition[nutrition.length - 1]?.calories ?? 0;
  const todayProtein = nutrition[nutrition.length - 1]?.protein ?? 0;
  const todayWater = nutrition[nutrition.length - 1]?.water.toFixed(1) ?? '--';

  const stepsChartData = steps.map(s => ({
    date: format(new Date(s.date), 'EEE'),
    Steps: s.steps,
    Goal: s.goal,
  }));

  const weightChartData = measurements.slice(-8).map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    Weight: parseFloat(m.weight.toFixed(1)),
    'Body Fat %': m.bodyFat ? parseFloat(m.bodyFat.toFixed(1)) : undefined,
  }));

  const strengthData = prs.slice(0, 6).map(p => ({
    exercise: p.exercise.length > 12 ? p.exercise.slice(0, 12) + '…' : p.exercise,
    'Weight (kg)': p.weight,
  }));

  const sleepData = sleep.map(s => ({
    date: format(new Date(s.date), 'EEE'),
    Hours: parseFloat(s.hoursSlept.toFixed(1)),
  }));

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Welcome back, {profile.name.split(' ')[0]} 💪</h1>
          <p className="welcome-sub">Keep pushing. Every rep counts. Let's have a great session today.</p>
        </div>
        <div className="welcome-streak">
          <div className="streak-num">🔥 7</div>
          <div className="streak-label">Day Streak</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon red"><Footprints size={22} /></div>
          <div>
            <div className="stat-label">Today's Steps</div>
            <div className="stat-value">{todaySteps.toLocaleString()}</div>
            <div className="stat-sub">{stepPct}% of {stepGoal.toLocaleString()} goal</div>
            <div className="progress-bar-wrap" style={{ marginTop: 8, width: 110 }}>
              <div className="progress-bar-fill" style={{ width: `${stepPct}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon gold"><Trophy size={22} /></div>
          <div>
            <div className="stat-label">Top PR</div>
            <div className="stat-value">{topPR?.weight ?? '--'}<span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span></div>
            <div className="stat-sub">{topPR?.exercise ?? '--'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-label">Body Weight</div>
            <div className="stat-value">{latestWeight}<span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span></div>
            <div className="stat-sub" style={{ color: parseFloat(weightDiff) < 0 ? 'var(--green)' : 'var(--accent)' }}>
              {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} kg this week
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><Moon size={22} /></div>
          <div>
            <div className="stat-label">Last Night's Sleep</div>
            <div className="stat-value">{todaySleep}<span style={{ fontSize: '1rem', fontWeight: 500 }}>hrs</span></div>
            <div className="stat-sub">{sleep[sleep.length - 1]?.quality ?? '--'} quality</div>
          </div>
        </div>
      </div>

      {/* Nutrition quick row */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon red"><Flame size={22} /></div>
          <div>
            <div className="stat-label">Calories Today</div>
            <div className="stat-value">{todayCalories.toLocaleString()}</div>
            <div className="stat-sub">Target: 2,400 kcal</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Apple size={22} /></div>
          <div>
            <div className="stat-label">Protein Today</div>
            <div className="stat-value">{todayProtein}<span style={{ fontSize: '1rem', fontWeight: 500 }}>g</span></div>
            <div className="stat-sub">Target: 160g</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Droplets size={22} /></div>
          <div>
            <div className="stat-label">Water Intake</div>
            <div className="stat-value">{todayWater}<span style={{ fontSize: '1rem', fontWeight: 500 }}>L</span></div>
            <div className="stat-sub">Target: 3.0 L</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Steps Chart */}
        <div className="card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Weekly Step Count</div>
              <div className="chart-sub">Daily steps vs. 10,000 goal</div>
            </div>
            <span className="badge badge-red">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stepsChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Steps" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="Goal" stroke="var(--gold)" strokeDasharray="4 4" dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Body Weight Chart */}
        <div className="card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Body Weight Progress</div>
              <div className="chart-sub">Weight & body fat over 8 weeks</div>
            </div>
            <span className="badge badge-green">8 Weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[5, 35]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="Weight" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="Body Fat %" stroke="var(--gold)" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: 'var(--gold)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Strength PRs */}
        <div className="card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Strength PRs</div>
              <div className="chart-sub">Top lifts – max weight</div>
            </div>
            <span className="badge badge-gold">PRs</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={strengthData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} unit=" kg" />
              <YAxis type="category" dataKey="exercise" tick={{ fontSize: 11 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Weight (kg)" fill="var(--gold)" radius={[0, 6, 6, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep Chart */}
        <div className="card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Sleep Pattern</div>
              <div className="chart-sub">Hours of sleep this week</div>
            </div>
            <span className="badge badge-blue">7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sleepData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Hours" stroke="var(--blue)" fill="url(#sleepGrad)" strokeWidth={2.5} dot={{ fill: 'var(--blue)', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Measurements Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Body Measurements Overview</div>
            <div className="chart-sub">Chest, Waist, Hips, Arms (cm) over 8 weeks</div>
          </div>
          <span className="badge badge-purple">8 Weeks</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={measurements.slice(-8).map(m => ({
              date: format(new Date(m.date), 'MMM d'),
              Chest: m.chest,
              Waist: m.waist,
              Hips: m.hips,
              Arms: m.arms,
            }))}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Chest" stroke="var(--accent)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Waist" stroke="var(--gold)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Hips" stroke="var(--purple)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Arms" stroke="var(--green)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Coach */}
      <AICoach />

      {/* Recent PRs Table */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="chart-title">Recent Personal Records</div>
            <div className="chart-sub">Your latest strength milestones</div>
          </div>
        </div>
        <table className="t-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Weight</th>
              <th>Reps</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {prs.map(pr => (
              <tr key={pr.id}>
                <td><strong>{pr.exercise}</strong></td>
                <td><span className="badge badge-gold">{pr.weight > 0 ? `${pr.weight} kg` : 'BW'}</span></td>
                <td>{pr.reps} reps</td>
                <td style={{ color: 'var(--text-secondary)' }}>{format(new Date(pr.date), 'MMM d, yyyy')}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{pr.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
