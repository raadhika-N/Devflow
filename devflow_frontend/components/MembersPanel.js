'use client';

import { useState } from 'react';
import { addMemberApi, removeMemberApi } from '../api/projects.api';
import useAuthStore from '../store/authStore';

export default function MembersPanel({ project, onClose, onUpdated }) {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwner = project.owner?._id === user?.id ||
    project.owner === user?.id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await addMemberApi(project._id, email);
      setSuccess(`${email} added successfully!`);
      setEmail('');
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    if (!confirm(`Remove ${memberEmail} from this project?`)) return;
    setError('');

    try {
      await removeMemberApi(project._id, memberEmail);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
        maxWidth: '480px',
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
            Team Members
          </h2>
          <button onClick={onClose} style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#475569',
            fontSize: '22px',
            cursor: 'pointer'
          }}>×</button>
        </div>

        {/* Error / Success */}
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
        {success && (
          <div style={{
            backgroundColor: '#22c55e20',
            border: '1px solid #22c55e40',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '1rem',
            color: '#22c55e',
            fontSize: '13px'
          }}>{success}</div>
        )}

        {/* Current members list */}
        <p style={{
          color: '#94a3b8',
          fontSize: '13px',
          fontWeight: '500',
          margin: '0 0 10px'
        }}>
          Current Members ({project.members?.length || 0})
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '1.5rem'
        }}>
          {project.members?.map((member) => {
            const isProjectOwner = project.owner?._id === member._id ||
              project.owner === member._id;

            return (
              <div
                key={member._id}
                style={{
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #1e1e2e',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                {/* Avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#6366f1',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                      {member.name}
                      {isProjectOwner && (
                        <span style={{
                          backgroundColor: '#6366f120',
                          color: '#6366f1',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginLeft: '6px'
                        }}>Owner</span>
                      )}
                    </p>
                    <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Remove button — only owner can remove, can't remove self */}
                {isOwner && !isProjectOwner && member._id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.email)}
                    style={{
                      backgroundColor: '#ef444415',
                      border: '1px solid #ef444430',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add member form — only visible to owner */}
        {isOwner && (
          <div>
            <p style={{
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: '500',
              margin: '0 0 10px'
            }}>
              Add New Member
            </p>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@gmail.com"
                required
                style={{
                  flex: 1,
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #1e1e2e',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#4f52b8' : '#6366f1',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  flexShrink: 0
                }}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </form>
            <p style={{ color: '#334155', fontSize: '12px', margin: '8px 0 0' }}>
              The user must already have a DevFlow account.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}