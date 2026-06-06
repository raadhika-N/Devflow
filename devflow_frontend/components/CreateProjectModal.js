'use client';

import { useState } from 'react';
import { createProjectApi } from '../api/projects.api';

export default function CreateProjectModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createProjectApi(title, description);
      onCreated(response.data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#111118',
        border: '1px solid #1e1e2e',
        borderRadius: '12px',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '480px'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '500', margin: 0 }}>
            Create new project
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#475569',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#ef444420',
            border: '1px solid #ef444440',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '1rem',
            color: '#ef4444',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreate}>

          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Project title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DevFlow Backend"
              required
              style={{
                width: '100%',
                backgroundColor: '#0a0a0f',
                border: '1px solid #1e1e2e',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              style={{
                width: '100%',
                backgroundColor: '#0a0a0f',
                border: '1px solid #1e1e2e',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #1e1e2e',
                borderRadius: '8px',
                padding: '10px 20px',
                color: '#475569',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#4f52b8' : '#6366f1',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                color: '#fff',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}