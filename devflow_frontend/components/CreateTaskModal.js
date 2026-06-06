'use client';

import { useState } from 'react';
import { createTaskApi } from '../api/tasks.api';

export default function CreateTaskModal({ projectId, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createTaskApi(projectId, {
        title,
        description,
        priority,
        status,
        dueDate: dueDate || null
      });
      onCreated(response.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '6px'
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '500', margin: 0 }}>
            Create new task
          </h2>
          <button onClick={onClose} style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#475569',
            fontSize: '22px',
            cursor: 'pointer'
          }}>×</button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ef444420',
            border: '1px solid #ef444440',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '1rem',
            color: '#ef4444',
            fontSize: '13px'
          }}>{error}</div>
        )}

        <form onSubmit={handleCreate}>

          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Task title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix JWT authentication bug"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Priority + Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={inputStyle}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              backgroundColor: 'transparent',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#475569',
              fontSize: '14px',
              cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              backgroundColor: loading ? '#4f52b8' : '#6366f1',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              color: '#fff',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Creating...' : 'Create task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}