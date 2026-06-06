'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import CreateTaskModal from '../../../components/CreateTaskModal';
import TaskDetailPanel from '../../../components/TaskDetailPanel';
import MembersPanel from '../../../components/MembersPanel';
import { getProjectApi } from '../../../api/projects.api';
import { getTasksApi } from '../../../api/tasks.api';

const COLUMNS = [
  { key: 'todo', label: 'Todo', color: '#6366f1' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#22c55e' }
];

const PRIORITY_COLORS = {
  high: { bg: '#ef444420', text: '#ef4444' },
  medium: { bg: '#f59e0b20', text: '#f59e0b' },
  low: { bg: '#22c55e20', text: '#22c55e' }
};

export default function ProjectPage() {
  const router = useRouter();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        getProjectApi(id),
        getTasksApi(id)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;
    return matchesSearch && matchesPriority;
  });

  const getTasksByStatus = (status) =>
    filteredTasks.filter((t) => t.status === status);

  if (loading) {
    return (
      <div style={{ display: 'flex', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ marginLeft: '220px', flex: 1, padding: '2rem' }}>
          <p style={{ color: '#475569' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{
        marginLeft: '220px',
        flex: 1,
        padding: '2rem',
        marginRight: selectedTask ? '380px' : '0',
        transition: 'margin-right 0.2s'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div>
            <button
              onClick={() => router.push('/projects')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#475569',
                fontSize: '13px',
                cursor: 'pointer',
                padding: 0,
                marginBottom: '4px',
                display: 'block'
              }}
            >
              ← Projects
            </button>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '500', margin: '0 0 4px' }}>
              {project?.title}
            </h1>
            <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>
              {project?.description || 'No description'}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Member avatars */}
            <div style={{ display: 'flex' }}>
              {project?.members?.slice(0, 4).map((member, index) => (
                <div
                  key={member._id}
                  title={member.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'][index % 4],
                    borderRadius: '50%',
                    border: '2px solid #0a0a0f',
                    marginLeft: index > 0 ? '-8px' : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            {/* Members button */}
            <button
              onClick={() => setShowMembersPanel(true)}
              style={{
                backgroundColor: '#111118',
                border: '1px solid #1e1e2e',
                borderRadius: '8px',
                padding: '9px 16px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              👥 Members
            </button>
            {/* Ask AI button */}
<button
  onClick={() => router.push(`/projects/${id}/ai`)}
  style={{
    backgroundColor: '#6366f115',
    border: '1px solid #6366f140',
    borderRadius: '8px',
    padding: '9px 16px',
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}
>
  ✨ Ask AI
</button> 

            {/* Add task button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: '#6366f1',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              + Add Task
            </button>

          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{
            flex: 1,
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '9px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#475569' }}>🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              padding: '9px 14px',
              color: filterPriority ? '#fff' : '#475569',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Kanban board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          alignItems: 'start'
        }}>
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.key);
            return (
              <div
                key={column.key}
                style={{
                  backgroundColor: '#111118',
                  border: '1px solid #1e1e2e',
                  borderRadius: '12px',
                  padding: '1rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: column.color,
                    borderRadius: '50%'
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
                    {column.label}
                  </span>
                  <span style={{
                    backgroundColor: '#1e1e2e',
                    color: '#64748b',
                    fontSize: '11px',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    marginLeft: 'auto'
                  }}>
                    {columnTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {columnTasks.map((task) => {
                    const pColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                    const isSelected = selectedTask?._id === task._id;

                    return (
                      <div
                        key={task._id}
                        onClick={() => setSelectedTask(isSelected ? null : task)}
                        style={{
                          backgroundColor: '#0a0a0f',
                          border: `1px solid ${isSelected ? column.color : '#1e1e2e'}`,
                          borderRadius: '10px',
                          padding: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            backgroundColor: pColor.bg,
                            color: pColor.text,
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            textTransform: 'capitalize'
                          }}>
                            {task.priority}
                          </span>

                          {task.assignedTo && (
                            <div
                              title={task.assignedTo.name}
                              style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: '#6366f1',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '9px',
                                fontWeight: '600'
                              }}
                            >
                              {task.assignedTo.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <p style={{
                          color: column.key === 'done' ? '#64748b' : '#e2e8f0',
                          fontSize: '13px',
                          fontWeight: '500',
                          margin: '0 0 4px',
                          textDecoration: column.key === 'done' ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </p>

                        {task.description && (
                          <p style={{
                            color: '#475569',
                            fontSize: '11px',
                            margin: 0,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {task.description}
                          </p>
                        )}

                        {task.dueDate && (
                          <p style={{ color: '#334155', fontSize: '11px', margin: '6px 0 0' }}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: '#1e1e2e',
                      fontSize: '12px',
                      border: '1px dashed #1e1e2e',
                      borderRadius: '8px'
                    }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectId={id}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {/* Create task modal */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={id}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* Members panel */}
      {showMembersPanel && (
        <MembersPanel
          project={project}
          onClose={() => setShowMembersPanel(false)}
          onUpdated={() => {
            fetchData();
            setShowMembersPanel(false);
          }}
        />
      )}

    </div>
  );
}