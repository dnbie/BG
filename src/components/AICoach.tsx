import { useState } from 'react';
import { Bot, Sparkles, RefreshCw, AlertTriangle, Star, WifiOff, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useOllama } from '../context/OllamaContext';
import { useApp } from '../context/AppContext';
import type { CoachInsights } from '../services/ollama';
import { format } from 'date-fns';
import './AICoach.css';

function buildClientSummary(profile: ReturnType<typeof useApp>['profile'], steps: ReturnType<typeof useApp>['steps'], measurements: ReturnType<typeof useApp>['measurements'], prs: ReturnType<typeof useApp>['prs'], sleep: ReturnType<typeof useApp>['sleep'], nutrition: ReturnType<typeof useApp>['nutrition'], workouts: ReturnType<typeof useApp>['workouts']): string {
  const avgSteps = steps.length ? Math.round(steps.reduce((a, s) => a + s.steps, 0) / steps.length) : 0;
  const avgSleep = sleep.length ? (sleep.reduce((a, s) => a + s.hoursSlept, 0) / sleep.length).toFixed(1) : '?';
  const latest = measurements[measurements.length - 1];
  const avgCal = nutrition.length ? Math.round(nutrition.reduce((a, n) => a + n.calories, 0) / nutrition.length) : 0;
  const avgProtein = nutrition.length ? Math.round(nutrition.reduce((a, n) => a + n.protein, 0) / nutrition.length) : 0;
  const topPR = [...prs].sort((a, b) => b.weight - a.weight)[0];
  const weekWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 86400000;
  }).length;

  return `
Client: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
Goal: ${profile.fitnessGoal?.replace(/_/g, ' ')}, Program: ${profile.program ?? 'none'}
Height: ${profile.height}cm, Current weight: ${latest?.weight.toFixed(1) ?? profile.weight}kg
Body fat: ${latest?.bodyFat ? latest.bodyFat.toFixed(1) + '%' : 'unknown'}
Waist: ${latest?.waist ?? '?'}cm

This week (7 days):
- Avg daily steps: ${avgSteps.toLocaleString()} (goal 10,000)
- Avg sleep: ${avgSleep} hrs/night
- Workouts completed: ${weekWorkouts} sessions
- Avg calories: ${avgCal} kcal/day
- Avg protein: ${avgProtein}g/day

Body measurements trend: Started ${measurements[0]?.weight.toFixed(1) ?? '?'}kg → now ${latest?.weight.toFixed(1) ?? '?'}kg
${topPR ? `Top PR: ${topPR.exercise} ${topPR.weight > 0 ? topPR.weight + 'kg' : 'bodyweight'} × ${topPR.reps} reps (${format(new Date(topPR.date), 'MMM d')})` : 'No PRs logged yet'}
  `.trim();
}

export default function AICoach() {
  const { isConnected, getInsights, model, provider } = useOllama();
  const { profile, steps, measurements, prs, sleep, nutrition, workouts } = useApp();
  const [insights, setInsights] = useState<CoachInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleGetInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const summary = buildClientSummary(profile, steps, measurements, prs, sleep, nutrition, workouts);
      const result = await getInsights(summary);
      setInsights(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-coach-card ${insights ? 'has-insights' : ''}`}>
      <div className="ai-coach-header" onClick={() => insights && setCollapsed(v => !v)}>
        <div className="ai-coach-title-row">
          <div className="ai-bot-icon">
            <Bot size={20} />
          </div>
          <div>
            <div className="ai-coach-title">AI Coach</div>
            <div className="ai-coach-sub">Powered by {isConnected ? `${provider === 'cloud' ? 'Cloud AI' : 'Ollama'} · ${model}` : 'AI'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isConnected && !loading && (
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple)', border: '1px solid rgba(139,92,246,0.3)', gap: 6 }}
              onClick={e => { e.stopPropagation(); handleGetInsights(); }}
            >
              {insights ? <><RefreshCw size={13} /> Refresh</> : <><Sparkles size={13} /> Get Insights</>}
            </button>
          )}
          {insights && (collapsed ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />)}
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Not connected */}
          {!isConnected && (
            <div className="ai-offline">
              <WifiOff size={28} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
              <p>Install Ollama locally to get personalised AI coaching insights.</p>
              <a href="https://ollama.com/download" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                Get Ollama <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Loading */}
          {isConnected && loading && (
            <div className="ai-loading">
              <div className="ai-loading-bar" />
              <span>Analysing your data with {model}…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="ai-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Idle — not yet fetched */}
          {isConnected && !loading && !insights && !error && (
            <div className="ai-idle">
              <p>Click <strong>"Get Insights"</strong> to receive personalised coaching recommendations based on your current data.</p>
            </div>
          )}

          {/* Insights */}
          {insights && !loading && (
            <div className="ai-insights">
              {insights.alert && (
                <div className="ai-alert-banner">
                  <AlertTriangle size={14} />
                  <span><strong>Priority:</strong> {insights.alert}</span>
                </div>
              )}
              <div className="ai-insights-list">
                {insights.insights.map((tip, i) => (
                  <div key={i} className="ai-insight-item">
                    <div className="ai-insight-num">{i + 1}</div>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
              {insights.praise && (
                <div className="ai-praise-banner">
                  <Star size={14} style={{ flexShrink: 0 }} />
                  <span><strong>Doing great:</strong> {insights.praise}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
