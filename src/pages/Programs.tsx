import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Star, Target, Zap, Heart, Flame, Award, Users, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProgramType } from '../types';
import './Programs.css';

interface Program {
  id: ProgramType;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ElementType;
  color: string;
  tags: string[];
  weeks: ProgramWeek[];
}

interface ProgramWeek {
  week: number;
  focus: string;
  sessions: string[];
}

const programs: Program[] = [
  {
    id: 'weight_loss',
    title: 'Weight Loss',
    subtitle: 'Burn fat, build confidence',
    description: 'A balanced combination of cardio and resistance training designed to maximize calorie burn while preserving lean muscle mass.',
    duration: '12 weeks',
    difficulty: 'Beginner',
    icon: Flame,
    color: '#e63946',
    tags: ['Cardio', 'HIIT', 'Resistance', 'Nutrition'],
    weeks: [
      { week: 1, focus: 'Foundation & Movement', sessions: ['Full Body Circuit', 'Cardio Walk/Jog', 'Active Recovery', 'Full Body Circuit', 'HIIT Cardio'] },
      { week: 2, focus: 'Building Intensity', sessions: ['Upper Body', 'Lower Body', 'Cardio', 'Full Body', 'HIIT'] },
      { week: 3, focus: 'Metabolic Boost', sessions: ['Push Day', 'Pull Day', 'Leg Day', 'Cardio LISS', 'Full Body HIIT'] },
    ],
  },
  {
    id: 'weight_gain',
    title: 'Weight Gain',
    subtitle: 'Build mass & size',
    description: 'A calorie-surplus driven hypertrophy program focused on progressive overload and compound movements to add quality mass.',
    duration: '16 weeks',
    difficulty: 'Intermediate',
    icon: Dumbbell,
    color: '#f5a623',
    tags: ['Hypertrophy', 'Compounds', 'Nutrition', 'Recovery'],
    weeks: [
      { week: 1, focus: 'Volume Foundation', sessions: ['Chest & Triceps', 'Back & Biceps', 'Rest', 'Legs & Core', 'Shoulders', 'Rest', 'Rest'] },
      { week: 2, focus: 'Increase Volume', sessions: ['Chest & Triceps', 'Back & Biceps', 'Rest', 'Legs & Core', 'Shoulders', 'Full Body', 'Rest'] },
    ],
  },
  {
    id: 'fat_loss',
    title: 'Fat Loss',
    subtitle: 'Shred & define',
    description: 'A cutting program that preserves muscle while aggressively targeting body fat through strategic training and nutrition timing.',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    icon: Target,
    color: '#8b5cf6',
    tags: ['Cutting', 'HIIT', 'Superset', 'Macro Tracking'],
    weeks: [
      { week: 1, focus: 'Metabolic Conditioning', sessions: ['Push A', 'Pull A', 'Leg A', 'Cardio', 'Push B', 'Cardio', 'Rest'] },
    ],
  },
  {
    id: 'post_pregnancy',
    title: 'Post-Pregnancy',
    subtitle: 'Safe return to fitness',
    description: 'A gentle yet effective return-to-fitness plan designed for postpartum recovery, focusing on core restoration, pelvic floor, and full-body strength.',
    duration: '16 weeks',
    difficulty: 'Beginner',
    icon: Heart,
    color: '#f472b6',
    tags: ['Pelvic Floor', 'Core Restore', 'Low Impact', 'Breathwork'],
    weeks: [
      { week: 1, focus: 'Breath & Core Reconnect', sessions: ['Breathing & Diaphragm', 'Gentle Walk', 'Pelvic Floor', 'Gentle Yoga', 'Walk'] },
      { week: 2, focus: 'Gentle Activation', sessions: ['Core Activation', 'Glute Bridges', 'Walk', 'Bodyweight Squat', 'Mobility'] },
    ],
  },
  {
    id: 'pre_wedding',
    title: 'Pre-Wedding',
    subtitle: 'Look your best on the big day',
    description: 'A bridal/groom transformation plan focused on toning, posture, skin health, and stress management for your wedding day.',
    duration: '12 weeks',
    difficulty: 'Intermediate',
    icon: Star,
    color: '#fbbf24',
    tags: ['Toning', 'Posture', 'HIIT', 'Nutrition', 'Stress Mgmt'],
    weeks: [
      { week: 1, focus: 'Total Body Tone', sessions: ['Upper Tone', 'Lower Tone', 'Cardio Dance', 'Core & Posture', 'Full Body', 'Active Rest'] },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Transformation',
    subtitle: 'Healthy habits for life',
    description: 'A holistic program that builds sustainable fitness habits, improving energy, sleep quality, and overall wellbeing through balanced training and nutrition.',
    duration: 'Ongoing',
    difficulty: 'Beginner',
    icon: Zap,
    color: '#2ecc71',
    tags: ['Balanced', 'Habits', 'Mindfulness', 'Mobility'],
    weeks: [
      { week: 1, focus: 'Building Habits', sessions: ['Full Body', 'Walk 30min', 'Yoga/Stretch', 'Full Body', 'Active Play'] },
    ],
  },
  {
    id: 'strength',
    title: 'Strength Training',
    subtitle: 'Get brutally strong',
    description: 'A powerlifting-inspired strength program focusing on the big compound lifts with progressive overload to maximize strength gains.',
    duration: '16 weeks',
    difficulty: 'Advanced',
    icon: Award,
    color: '#3b82f6',
    tags: ['Powerlifting', 'Compounds', 'Progressive Overload', 'Peaking'],
    weeks: [
      { week: 1, focus: 'Strength Foundation', sessions: ['Squat Focus', 'Bench Focus', 'Rest', 'Deadlift Focus', 'OHP Focus', 'Accessory', 'Rest'] },
    ],
  },
  {
    id: 'bodybuilding',
    title: 'Bodybuilding',
    subtitle: 'Sculpt a stage-ready physique',
    description: 'A classic bodybuilding split focused on maximum muscle hypertrophy, symmetry, and definition using isolation and compound exercises.',
    duration: '20 weeks',
    difficulty: 'Advanced',
    icon: Users,
    color: '#e63946',
    tags: ['Hypertrophy', 'Isolation', 'Symmetry', 'Peak Week'],
    weeks: [
      { week: 1, focus: 'Hypertrophy Base', sessions: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Calves & Abs', 'Rest'] },
      { week: 2, focus: 'Volume Increase', sessions: ['Chest + Triceps', 'Back + Biceps', 'Shoulders', 'Arms Superset', 'Quads', 'Hamstrings + Glutes', 'Rest'] },
    ],
  },
];

const difficultyColors = {
  Beginner: 'badge-green',
  Intermediate: 'badge-gold',
  Advanced: 'badge-red',
};

export default function Programs() {
  const { profile, setProfile } = useApp();
  const [selected, setSelected] = useState<Program | null>(null);

  const handleEnroll = (p: Program) => {
    setProfile({ ...profile, fitnessGoal: p.id, program: `${p.title} – ${p.duration}` });
    setSelected(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="section-title">Training Programs</h1>
        <p>Choose a program aligned with your goal. Currently enrolled: <strong style={{ color: 'var(--accent)' }}>{profile.program ?? 'None'}</strong></p>
      </div>

      <div className="programs-grid">
        {programs.map(p => (
          <div
            key={p.id}
            className={`program-card ${profile.fitnessGoal === p.id ? 'enrolled' : ''}`}
            style={{ '--prog-color': p.color } as React.CSSProperties}
          >
            <div className="prog-card-top">
              <div className="prog-icon-wrap" style={{ background: `${p.color}20`, color: p.color }}>
                <p.icon size={24} />
              </div>
              <div className="prog-badges">
                <span className={`badge ${difficultyColors[p.difficulty]}`}>{p.difficulty}</span>
                {profile.fitnessGoal === p.id && (
                  <span className="badge badge-green"><CheckCircle2 size={11} /> Enrolled</span>
                )}
              </div>
            </div>

            <div className="prog-title">{p.title}</div>
            <div className="prog-subtitle">{p.subtitle}</div>
            <p className="prog-desc">{p.description}</p>

            <div className="prog-tags">
              {p.tags.map(t => <span key={t} className="prog-tag">{t}</span>)}
            </div>

            <div className="prog-footer">
              <span className="prog-duration">⏱ {p.duration}</span>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelected(p)}>
                View Plan <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${selected.color}25`, color: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <selected.icon size={20} />
              </div>
              {selected.title}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>{selected.description}</p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.9rem' }}>Sample Weekly Plan</div>
              {selected.weeks.map(w => (
                <div key={w.week} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>Week {w.week} — {w.focus}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {w.sessions.map((s, i) => (
                      <span key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(selected)}>
                <CheckCircle2 size={14} /> Enroll in Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
