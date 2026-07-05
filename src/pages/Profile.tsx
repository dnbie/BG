import React, { useState } from 'react';
import { Save, User, Heart, AlertCircle, Phone, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProgramType } from '../types';
import './Profile.css';

const programLabels: Record<ProgramType, string> = {
  weight_loss: 'Weight Loss',
  weight_gain: 'Weight Gain',
  fat_loss: 'Fat Loss',
  post_pregnancy: 'Post-Pregnancy Weight Loss',
  pre_wedding: 'Pre-Wedding Transformation',
  lifestyle: 'Lifestyle Transformation',
  strength: 'Strength Training',
  bodybuilding: 'Bodybuilding',
};

export default function Profile() {
  const { profile, setProfile } = useApp();
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const update = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="section-title">Profile & Settings</h1>
        <p>Manage your personal info, health history, and program goals</p>
      </div>

      <div className="profile-grid">
        {/* Personal Info */}
        <div className="card">
          <div className="card-section-title">
            <User size={18} />
            Personal Information
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="input" type="number" value={form.age} onChange={e => update('age', parseInt(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="input" value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="input" type="number" value={form.height} onChange={e => update('height', parseFloat(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="input" type="number" value={form.weight} onChange={e => update('weight', parseFloat(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Join Date</label>
              <input className="input" type="date" value={form.joinDate} onChange={e => update('joinDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Medical & Health */}
        <div className="card">
          <div className="card-section-title">
            <Heart size={18} />
            Health & Medical History
          </div>

          <div className="form-grid-single">
            <div className="form-group">
              <label className="form-label"><AlertCircle size={13} style={{ display: 'inline', marginRight: 4 }} />Medical History</label>
              <textarea className="input" value={form.medicalHistory} onChange={e => update('medicalHistory', e.target.value)} placeholder="Any past injuries, surgeries, chronic conditions..." />
            </div>
            <div className="form-group">
              <label className="form-label">Allergies</label>
              <textarea className="input" value={form.allergies} onChange={e => update('allergies', e.target.value)} placeholder="Food, medication, or environmental allergies..." />
            </div>
            <div className="form-group">
              <label className="form-label">Current Medications</label>
              <textarea className="input" value={form.currentMedications} onChange={e => update('currentMedications', e.target.value)} placeholder="List any current medications or supplements..." />
            </div>
            <div className="form-group">
              <label className="form-label"><Phone size={13} style={{ display: 'inline', marginRight: 4 }} />Emergency Contact</label>
              <input className="input" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} placeholder="Name – Phone number" />
            </div>
          </div>
        </div>

        {/* Program Goal */}
        <div className="card program-goal-card">
          <div className="card-section-title">
            <Calendar size={18} />
            Fitness Goal & Program
          </div>

          <div className="program-grid">
            {(Object.entries(programLabels) as [ProgramType, string][]).map(([key, label]) => (
              <button
                key={key}
                className={`program-chip ${form.fitnessGoal === key ? 'active' : ''}`}
                onClick={() => update('fitnessGoal', key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">Program Description</label>
            <input
              className="input"
              value={form.program ?? ''}
              onChange={e => update('program', e.target.value)}
              placeholder="e.g. Bodybuilding – 12-week hypertrophy"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="save-row">
        <button className={`btn btn-primary ${saved ? 'saved' : ''}`} onClick={handleSave}>
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
