'use client';

import { useEffect, useState } from 'react';
import { getCommentsApi, addCommentApi, deleteCommentApi } from '../api/comments.api';
import { updateTaskApi, deleteTaskApi } from '../api/tasks.api';

export default function TaskDetailPanel({ task, projectId, onClose, onUpdated, onDeleted }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [status, setStatus] = useState(task.status);

  useEffect(() => {
    fetchComments();
  }, [task._id]);

  const fetchComments = async () => {
    try {
      const response = await getCommentsApi(projectId, task._id);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatus(newStatus);
      const response = await updateTaskApi(projectId, task._id, { status: newStatus });
      onUpdated(response.data.task);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSendingComment(true);

    try {
      const response = await addCommentApi(projectId, task._id, newComment);
      setComments((prev) => [...prev, response.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(projectId, task._id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskApi(projectId, task._id);
      onDeleted(task._id);
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const priorityColors = {
    high: { bg: '#ef444420', text: '#ef4444' },
    medium: { bg: '#f59e0b20', text: '#f59e0b' },
    low: { bg: '#22c55e20', text: '#22c55e' }
  };

  const statusColors = {
    todo: '#6366f1',
    in_progress: '#f59e0b',
    done: '#22c55e'
  };

  const priorityColor = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '380px',
      backgroundColor: '#0d0d15',
      borderLeft: '1px solid #1e1e2e',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 500,
      overflowY: 'auto'
    }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid #1e1e2e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#475569', fontSize: '13px' }}>Task detail</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDeleteTask}
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
            Delete
          </button>
          <button onClick={onClose} style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#475569',
            fontSize: '20px',
            cursor: 'pointer'
          }}>×</button>
        </div>
      </div>

      <div style={{ padding: '1.25rem', flex: 1 }}>

        {/* Title */}
        <h2 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: '500',
          margin: '0 0 8px'
        }}>
          {task.title}
        </h2>

        {/* Description */}
        {task.description && (
          <p style={{
            color: '#64748b',
            fontSize: '13px',
            margin: '0 0 1.25rem',
            lineHeight: 1.6
          }}>
            {task.description}
          </p>
        )}

        {/* Info grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '1.25rem'
        }}>

          {/* Status */}
          <div style={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '10px'
          }}>
            <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 6px' }}>Status</p>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: statusColors[status] || '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
                width: '100%'
              }}
            >
              <option value="todo" style={{ backgroundColor: '#111118' }}>Todo</option>
              <option value="in_progress" style={{ backgroundColor: '#111118' }}>In Progress</option>
              <option value="done" style={{ backgroundColor: '#111118' }}>Done</option>
            </select>
          </div>

          {/* Priority */}
          <div style={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '10px'
          }}>
            <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 6px' }}>Priority</p>
            <span style={{
              backgroundColor: priorityColor.bg,
              color: priorityColor.text,
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
            </span>
          </div>

          {/* Assigned to */}
          <div style={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '10px'
          }}>
            <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 6px' }}>Assigned to</p>
            <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
              {task.assignedTo?.name || 'Unassigned'}
            </p>
          </div>

          {/* Due date */}
          <div style={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '10px'
          }}>
            <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 6px' }}>Due date</p>
            <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : 'No due date'}
            </p>
          </div>

        </div>

        {/* Created by */}
        <div style={{
          backgroundColor: '#111118',
          border: '1px solid #1e1e2e',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '1.25rem'
        }}>
          <p style={{ color: '#475569', fontSize: '11px', margin: '0 0 4px' }}>Created by</p>
          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
            {task.createdBy?.name || 'Unknown'}
          </p>
        </div>

        {/* Comments section */}
        <p style={{
          color: '#94a3b8',
          fontSize: '13px',
          fontWeight: '500',
          margin: '0 0 12px'
        }}>
          Comments ({comments.length})
        </p>

        {loadingComments ? (
          <p style={{ color: '#475569', fontSize: '13px' }}>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#334155', fontSize: '13px', marginBottom: '1rem' }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
            {comments.map((comment) => (
              <div key={comment._id} style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#6366f1',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {comment.author?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Comment bubble */}
                <div style={{
                  backgroundColor: '#111118',
                  border: '1px solid #1e1e2e',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  flex: 1
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                      {comment.author?.name} · {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#334155',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add comment input — always at bottom */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #1e1e2e'
      }}>
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{
              flex: 1,
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              padding: '9px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={sendingComment || !newComment.trim()}
            style={{
              backgroundColor: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 14px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}