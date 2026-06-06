'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Sidebar from '../../components/Sidebar';
import { getProjectsApi } from '../../api/projects.api';
import { getActivityApi } from '../../api/activity.api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await getProjectsApi();
      const fetchedProjects = projectsRes.data.projects || [];
      setProjects(fetchedProjects);

      // Fetch activity from first project if exists
      if (fetchedProjects.length > 0) {
        try {
          const activityRes = await getActivityApi(fetchedProjects[0]._id);
          setActivities(activityRes.data.activities || []);
        } catch {
          setActivities([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = projects.reduce((acc, p) => {
    const ids = p.members?.map((m) => m._id) || [];
    ids.forEach((id) => acc.add(id));
    return acc;
  }, new Set()).size;

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ marginLeft: '220px', flex: 1, padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '500', margin: '0 0 4px' }}>
            Good morning, {user?.name || 'there'} 👋
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
            Here's what's happening across your projects
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Projects', value: projects.length, color: '#fff' },
            { label: 'Active Projects', value: projects.length, color: '#f59e0b' },
            { label: 'Team Members', value: totalMembers, color: '#22c55e' },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 8px' }}>
                {stat.label}
              </p>
              <p style={{ color: stat.color, fontSize: '28px', fontWeight: '500', margin: 0 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Projects */}
          <div style={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: '500', margin: 0 }}>
                Your Projects
              </h2>
              <button
                onClick={() => router.push('/projects')}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #1e1e2e',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  color: '#475569',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                View all
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#475569', fontSize: '13px' }}>Loading...</p>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <p style={{ color: '#334155', fontSize: '13px', marginBottom: '1rem' }}>
                  No projects yet
                </p>
                <button
                  onClick={() => router.push('/projects')}
                  style={{
                    backgroundColor: '#6366f1',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Create first project
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project._id}
                    onClick={() => router.push(`/projects/${project._id}`)}
                    style={{
                      backgroundColor: '#0a0a0f',
                      border: '1px solid #1e1e2e',
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e2e'}
                  >
                    <div>
                      <p style={{
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '500',
                        margin: '0 0 3px'
                      }}>
                        {project.title}
                      </p>
                      <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>
                        {project.members?.length || 0} members
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: '#6366f115',
                      color: '#6366f1',
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div style={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '15px',
              fontWeight: '500',
              margin: '0 0 1rem'
            }}>
              Recent Activity
            </h2>

            {activities.length === 0 ? (
              <p style={{ color: '#334155', fontSize: '13px' }}>
                No activity yet. Start by creating a task!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.slice(0, 8).map((activity) => (
                  <div key={activity._id} style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#6366f120',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6366f1',
                      fontSize: '10px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {activity.performedBy?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Message */}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: '#cbd5e1',
                        fontSize: '12px',
                        margin: '0 0 2px',
                        lineHeight: 1.5
                      }}>
                        {activity.message}
                      </p>
                      <p style={{ color: '#334155', fontSize: '11px', margin: 0 }}>
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}