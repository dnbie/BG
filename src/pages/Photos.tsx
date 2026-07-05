import React, { useState, useRef } from 'react';
import { Plus, Trash2, Camera, ZoomIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProgressPhoto } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import './Photos.css';

const tagColors: Record<string, string> = {
  front: 'badge-blue',
  side: 'badge-gold',
  back: 'badge-purple',
  other: 'badge-green',
};

export default function Photos() {
  const { photos, setPhotos } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [lightbox, setLightbox] = useState<ProgressPhoto | null>(null);
  const [filter, setFilter] = useState<'all' | ProgressPhoto['tag']>('all');
  const [form, setForm] = useState({ date: '', tag: 'front' as ProgressPhoto['tag'], notes: '', url: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(p => ({ ...p, url }));
  };

  const handleAdd = () => {
    if (!form.url) return;
    const photo: ProgressPhoto = {
      id: uuidv4(),
      date: form.date || new Date().toISOString().split('T')[0],
      url: form.url,
      tag: form.tag,
      notes: form.notes,
    };
    setPhotos([...photos, photo]);
    setShowModal(false);
    setForm({ date: '', tag: 'front', notes: '', url: '' });
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const filtered = filter === 'all' ? photos : photos.filter(p => p.tag === filter);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title">Progress Photos</h1>
          <p>Document your physical transformation journey</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Photo
        </button>
      </div>

      {/* Filter tabs */}
      <div className="photo-filters">
        {(['all', 'front', 'side', 'back', 'other'] as const).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span className="filter-count">{photos.filter(p => p.tag === f).length}</span>}
            {f === 'all' && <span className="filter-count">{photos.length}</span>}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div className="photos-empty">
          <Camera size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No progress photos yet.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Add your first photo to start tracking your transformation!</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>
            <Camera size={16} /> Upload First Photo
          </button>
        </div>
      ) : (
        <div className="photos-grid">
          {filtered.map(photo => (
            <div key={photo.id} className="photo-card">
              <div className="photo-img-wrap" onClick={() => setLightbox(photo)}>
                <img src={photo.url} alt={photo.tag} />
                <div className="photo-overlay"><ZoomIn size={24} /></div>
              </div>
              <div className="photo-meta">
                <div className="photo-meta-left">
                  <span className={`badge ${tagColors[photo.tag]}`}>{photo.tag}</span>
                  <span className="photo-date">{format(new Date(photo.date), 'MMM d, yyyy')}</span>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deletePhoto(photo.id)}>
                  <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              {photo.notes && <div className="photo-notes">{photo.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Progress Photo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Upload area */}
              <div
                className={`upload-zone ${form.url ? 'has-image' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {form.url ? (
                  <img src={form.url} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <>
                    <Camera size={32} style={{ color: 'var(--text-muted)' }} />
                    <p>Click to upload photo</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP supported</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">View Angle</label>
                  <select className="input" value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value as ProgressPhoto['tag'] }))}>
                    <option value="front">Front</option>
                    <option value="side">Side</option>
                    <option value="back">Back</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="input" placeholder="e.g. Week 4 – feeling stronger" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!form.url}>Save Photo</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.tag} />
            <div className="lightbox-meta">
              <span className={`badge ${tagColors[lightbox.tag]}`}>{lightbox.tag}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{format(new Date(lightbox.date), 'MMMM d, yyyy')}</span>
              {lightbox.notes && <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{lightbox.notes}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
