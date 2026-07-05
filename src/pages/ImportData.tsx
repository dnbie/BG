import { useState, useRef, useCallback } from 'react';
import {
  Upload, Sparkles, CheckCircle2, AlertCircle, RefreshCw,
  FileText, Table2, Dumbbell, Moon, Footprints, Utensils,
  Activity, Settings2, ChevronDown, ChevronUp, Wifi, WifiOff,
  Info, X, Download
} from 'lucide-react';
import { useOllama } from '../context/OllamaContext';
import { useApp } from '../context/AppContext';
import { readFileAsText } from '../services/ollama';
import type { ParseResult, DataType } from '../services/ollama';
import type { StepEntry, BodyMeasurement, PREntry, SleepEntry, NutritionEntry, WorkoutSession } from '../types';
import { v4 as uuidv4 } from 'uuid';
import './ImportData.css';

const TODAY = new Date().toISOString().split('T')[0];

const DATA_TYPE_META: Record<DataType | 'unknown', { icon: React.ElementType; label: string; color: string; fields: string[] }> = {
  steps:        { icon: Footprints, label: 'Step Count',         color: 'var(--accent)',  fields: ['date','steps','goal'] },
  measurements: { icon: Activity,   label: 'Body Measurements',  color: 'var(--blue)',    fields: ['date','weight','chest','waist','hips','arms','bodyFat'] },
  prs:          { icon: Dumbbell,   label: 'Strength PRs',       color: 'var(--gold)',    fields: ['exercise','weight','reps','date','notes'] },
  sleep:        { icon: Moon,       label: 'Sleep Data',         color: 'var(--purple)',  fields: ['date','hoursSlept','quality','bedtime','wakeTime'] },
  nutrition:    { icon: Utensils,   label: 'Nutrition Log',      color: 'var(--green)',   fields: ['date','calories','protein','carbs','fat','water'] },
  workouts:     { icon: Dumbbell,   label: 'Workout Sessions',   color: 'var(--accent)',  fields: ['name','date','duration','notes'] },
  unknown:      { icon: FileText,   label: 'Unknown',            color: 'var(--text-muted)', fields: [] },
};

const ACCEPTED = '.csv,.json,.txt,.xlsx,.xls,.tsv';

const SAMPLE_FILES: Record<string, string> = {
  'steps_sample.csv': `date,steps,goal\n2026-06-17,9234,10000\n2026-06-18,11023,10000\n2026-06-19,7800,10000\n2026-06-20,12450,10000`,
  'measurements_sample.json': JSON.stringify([
    { date: '2026-06-10', weight: 82.5, chest: 100, waist: 85, hips: 96, thighs: 58, arms: 35, bodyFat: 18 },
    { date: '2026-06-17', weight: 81.8, chest: 99.5, waist: 84.5, hips: 95.5, thighs: 57.8, arms: 35.2, bodyFat: 17.5 },
  ], null, 2),
  'sleep_sample.csv': `Date,Bedtime,Wake time,Total sleep,Sleep quality\n2026-06-17,22:30,06:45,8.25,good\n2026-06-18,23:00,06:30,7.5,fair\n2026-06-19,22:00,07:00,9.0,excellent`,
  'prs_sample.csv': `Exercise,Weight (kg),Reps,Date,Notes\nBench Press,102.5,3,2026-06-20,New PR!\nSquat,140,5,2026-06-18,\nDeadlift,185,1,2026-06-15,Belt used`,
};

// ── Merge helpers ──────────────────────────────────────────────────────────────

function mergeByDate<T extends { date: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map(existing.map(e => [e.date, e]));
  incoming.forEach(item => map.set(item.date, { ...map.get(item.date), ...item }));
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function safeStr(v: unknown, fallback = ''): string {
  return v !== null && v !== undefined ? String(v) : fallback;
}

type Step = 'upload' | 'parsing' | 'preview' | 'done';

export default function ImportData() {
  const { parseData, isConnected, isChecking, checkConnection, baseUrl, setBaseUrl, model, setModel, availableModels, provider } = useOllama();
  const { setSteps, setMeasurements, setPRs, setSleep, setNutrition, setWorkouts, steps, measurements, prs, sleep, nutrition, workouts } = useApp();

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawContent, setRawContent] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [tempUrl, setTempUrl] = useState(baseUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError('');
    setResult(null);
    setStep('upload');
    try {
      const text = await readFileAsText(f);
      setRawContent(text);
    } catch {
      setError('Failed to read file. Make sure it is a valid text, CSV, JSON, or Excel file.');
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleParse = async () => {
    if (!rawContent) return;
    setStep('parsing');
    setError('');
    try {
      const r = await parseData(rawContent);
      setResult(r);
      setStep('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parsing failed. Make sure Ollama is running and the model is loaded.');
      setStep('upload');
    }
  };

  const handleApply = () => {
    if (!result || result.dataType === 'unknown') return;
    const { dataType, data } = result;

    if (dataType === 'steps') {
      const incoming: StepEntry[] = data.map(d => ({ date: safeStr(d.date, TODAY), steps: safeNum(d.steps), goal: safeNum(d.goal, 10000) }));
      setSteps(mergeByDate(steps, incoming));
    } else if (dataType === 'measurements') {
      const incoming: BodyMeasurement[] = data.map(d => ({
        date: safeStr(d.date, TODAY), weight: safeNum(d.weight), chest: safeNum(d.chest),
        waist: safeNum(d.waist), hips: safeNum(d.hips), thighs: safeNum(d.thighs),
        arms: safeNum(d.arms), bodyFat: d.bodyFat ? safeNum(d.bodyFat) : undefined,
      }));
      setMeasurements(mergeByDate(measurements, incoming));
    } else if (dataType === 'prs') {
      const incoming: PREntry[] = data.map(d => ({
        id: uuidv4(), exercise: safeStr(d.exercise, 'Unknown'),
        weight: safeNum(d.weight), reps: safeNum(d.reps, 1),
        date: safeStr(d.date, TODAY), notes: d.notes ? safeStr(d.notes) : undefined,
      }));
      setPRs([...prs, ...incoming]);
    } else if (dataType === 'sleep') {
      const qMap: Record<string, SleepEntry['quality']> = { poor:'poor', fair:'fair', good:'good', excellent:'excellent' };
      const incoming: SleepEntry[] = data.map(d => ({
        date: safeStr(d.date, TODAY), hoursSlept: safeNum(d.hoursSlept, 7),
        quality: qMap[safeStr(d.quality, 'good').toLowerCase()] ?? 'good',
        bedtime: safeStr(d.bedtime, '22:00'), wakeTime: safeStr(d.wakeTime, '06:00'),
      }));
      setSleep(mergeByDate(sleep, incoming));
    } else if (dataType === 'nutrition') {
      const incoming: NutritionEntry[] = data.map(d => ({
        date: safeStr(d.date, TODAY), calories: safeNum(d.calories), protein: safeNum(d.protein),
        carbs: safeNum(d.carbs), fat: safeNum(d.fat), water: safeNum(d.water, 2),
        meals: [],
      }));
      setNutrition(mergeByDate(nutrition, incoming));
    } else if (dataType === 'workouts') {
      const incoming: WorkoutSession[] = data.map(d => ({
        id: uuidv4(), name: safeStr(d.name, 'Workout'),
        date: safeStr(d.date, TODAY), duration: safeNum(d.duration, 60),
        exercises: [], notes: d.notes ? safeStr(d.notes) : undefined,
      }));
      setWorkouts([...workouts, ...incoming]);
    }

    setStep('done');
  };

  const reset = () => { setStep('upload'); setFile(null); setRawContent(''); setResult(null); setError(''); };

  const downloadSample = (name: string) => {
    const content = SAMPLE_FILES[name];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const meta = result ? DATA_TYPE_META[result.dataType] : null;
  const previewCols = meta?.fields ?? [];
  const previewRows = result?.data.slice(0, 8) ?? [];

  return (
    <div className="import-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Import Data</h1>
          <p>Upload any file format — AI maps it to the right schema automatically</p>
        </div>
        <div className={`ollama-status-pill ${isConnected ? 'connected' : 'disconnected'}`}>
          {isChecking ? <RefreshCw size={13} className="spin" /> : isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isChecking ? 'Checking…' : isConnected ? `${provider === 'cloud' ? 'Cloud AI' : 'Ollama'} · ${model}` : 'AI offline'}
          {!isConnected && !isChecking && (
            <button className="pill-btn" onClick={checkConnection}>Retry</button>
          )}
        </div>
      </div>

      {/* Steps indicator */}
      <div className="import-steps">
        {(['upload', 'parsing', 'preview', 'done'] as Step[]).map((s, i) => (
          <div key={s} className={`import-step-item ${step === s ? 'current' : ['done', 'preview'].includes(step) && i <= (['upload','parsing','preview','done'] as Step[]).indexOf(step) ? 'done' : ''}`}>
            <div className="import-step-num">{['done','preview'].includes(step) && i < (['upload','parsing','preview','done'] as Step[]).indexOf(step) ? <CheckCircle2 size={14} /> : i + 1}</div>
            <span>{['Upload File', 'AI Parsing', 'Preview & Confirm', 'Done'][i]}</span>
          </div>
        ))}
      </div>

      {/* STEP 1 — Upload */}
      {(step === 'upload') && (
        <div className="import-section">
          {!isConnected && (
            <div className="ollama-warning">
              <AlertCircle size={16} />
              <div>
                <strong>AI service unavailable.</strong> For local development, start Ollama.
                On the deployed site, AI runs automatically via the cloud backend.
                <a href="https://ollama.com/download" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', marginLeft: 8 }}>
                  Download Ollama →
                </a>
                <div style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.8 }}>
                  Then run: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>ollama pull llama3.2</code>
                </div>
              </div>
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {file ? (
              <div className="file-selected">
                <FileText size={32} style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); reset(); }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="drop-zone-inner">
                <div className="drop-zone-icon"><Upload size={32} /></div>
                <div className="drop-zone-title">Drop your file here</div>
                <div className="drop-zone-sub">or click to browse</div>
                <div className="format-chips">
                  {['CSV', 'JSON', 'Excel (.xlsx)', 'TXT', 'TSV'].map(f => (
                    <span key={f} className="format-chip">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="import-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {file && rawContent && (
            <div className="raw-preview-wrap">
              <div className="raw-preview-header" onClick={() => setShowRaw(v => !v)}>
                <FileText size={14} />
                <span>Raw file content preview ({rawContent.length.toLocaleString()} chars)</span>
                {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {showRaw && (
                <pre className="raw-preview">{rawContent.slice(0, 1500)}{rawContent.length > 1500 ? '\n…[truncated]' : ''}</pre>
              )}
            </div>
          )}

          <div className="import-actions">
            <button
              className="btn btn-primary"
              onClick={handleParse}
              disabled={!file || !rawContent || !isConnected}
              style={{ minWidth: 180 }}
            >
              <Sparkles size={16} />
              {isConnected ? 'Analyze with AI' : 'Ollama Required'}
            </button>
          </div>

          {/* Sample files */}
          <div className="samples-section">
            <div className="samples-label"><Info size={13} /> Try a sample file</div>
            <div className="samples-grid">
              {Object.keys(SAMPLE_FILES).map(name => (
                <button key={name} className="sample-btn" onClick={() => downloadSample(name)}>
                  <Download size={13} /> {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 — Parsing */}
      {step === 'parsing' && (
        <div className="parsing-overlay">
          <div className="parsing-card">
            <div className="parsing-spinner" />
            <div className="parsing-title">AI is analyzing your data…</div>
            <div className="parsing-sub">Model: <strong>{model}</strong> · Mapping columns to fitness schema</div>
            <div className="parsing-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — Preview */}
      {step === 'preview' && result && meta && (
        <div className="import-section">
          {/* Result header */}
          <div className="result-header">
            <div className="result-type-badge" style={{ background: `${meta.color}18`, borderColor: `${meta.color}40`, color: meta.color }}>
              <meta.icon size={20} />
              <div>
                <div className="result-type-name">{meta.label}</div>
                <div className="result-type-sub">Detected data type</div>
              </div>
            </div>

            <div className="result-stats">
              <div className="result-stat">
                <div className="result-stat-val">{result.data.length}</div>
                <div className="result-stat-label">Rows parsed</div>
              </div>
              <div className="result-stat">
                <div className="result-stat-val" style={{ color: result.confidence >= 80 ? 'var(--green)' : result.confidence >= 50 ? 'var(--gold)' : 'var(--accent)' }}>
                  {result.confidence}%
                </div>
                <div className="result-stat-label">Confidence</div>
              </div>
            </div>
          </div>

          {result.notes && (
            <div className="result-notes">
              <Info size={14} />
              <span>{result.notes}</span>
            </div>
          )}

          {result.confidence < 60 && (
            <div className="import-error" style={{ borderColor: 'rgba(245,166,35,0.4)', background: 'rgba(245,166,35,0.08)', color: 'var(--gold-light)' }}>
              <AlertCircle size={16} />
              <span>Low confidence ({result.confidence}%) — review the preview carefully before applying.</span>
            </div>
          )}

          {/* Preview table */}
          <div className="preview-table-wrap">
            <div className="preview-table-title">Data Preview ({Math.min(8, result.data.length)} of {result.data.length} rows)</div>
            {previewRows.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="t-table preview-table">
                  <thead>
                    <tr>
                      {previewCols.map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {previewCols.map(col => (
                          <td key={col}>{row[col] !== undefined && row[col] !== '' ? String(row[col]) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No rows to preview</div>
            )}
          </div>

          {/* Raw response collapsible */}
          {result.rawResponse && (
            <div className="raw-preview-wrap">
              <div className="raw-preview-header" onClick={() => setShowRaw(v => !v)}>
                <Table2 size={14} />
                <span>Raw model response</span>
                {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {showRaw && <pre className="raw-preview">{result.rawResponse.slice(0, 2000)}</pre>}
            </div>
          )}

          <div className="import-actions">
            <button className="btn btn-ghost" onClick={() => { setStep('upload'); setResult(null); }}>
              ← Back
            </button>
            <button className="btn btn-secondary" onClick={handleParse}>
              <RefreshCw size={15} /> Re-parse
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={result.dataType === 'unknown' || result.data.length === 0}
            >
              <CheckCircle2 size={16} />
              Apply {result.data.length} rows to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Done */}
      {step === 'done' && result && meta && (
        <div className="done-card">
          <div className="done-icon" style={{ color: meta.color }}>
            <CheckCircle2 size={56} />
          </div>
          <h2 className="done-title">Data Applied!</h2>
          <p className="done-sub">
            <strong>{result.data.length} {meta.label}</strong> records have been merged into your dashboard.
          </p>
          <div className="import-actions" style={{ justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={reset}>Import More</button>
            <a href="/" className="btn btn-primary"><CheckCircle2 size={15} /> Go to Dashboard</a>
          </div>
        </div>
      )}

      {/* Ollama Settings panel */}
      <div className="settings-panel">
        <button className="settings-toggle" onClick={() => setShowSettings(v => !v)}>
          <Settings2 size={15} />
          AI Settings (Ollama)
          {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showSettings && (
          <div className="settings-body">
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Ollama API URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="http://localhost:11434" />
                  <button className="btn btn-secondary btn-sm" onClick={() => { setBaseUrl(tempUrl); setTimeout(checkConnection, 200); }}>
                    Save & Test
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                {availableModels.length > 0 ? (
                  <select className="input" value={model} onChange={e => setModel(e.target.value)}>
                    {availableModels.map(m => (
                      <option key={m.name} value={m.name}>{m.name} ({(m.size / 1e9).toFixed(1)}GB)</option>
                    ))}
                  </select>
                ) : (
                  <input className="input" value={model} onChange={e => setModel(e.target.value)} placeholder="llama3.2" />
                )}
              </div>
            </div>
            <div className="settings-info">
              <Info size={13} />
              <span>
                Ollama must be running locally. Start with:
                <code> ollama serve</code> then
                <code> ollama pull {model}</code>.
                If you see CORS errors, start with:
                <code> OLLAMA_ORIGINS=* ollama serve</code>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
