'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import CreateProjectModal from '../../components/CreateProjectModal';
import { getProjectsApi } from '../../api/projects.api';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjectsApi();
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>

      <Sidebar />

      <div style={{ marginLeft: '220px', flex: 1, padding: '2rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '500', margin: '0 0 4px' }}>
              Projects
            </h1>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            + New Project
          </button>
        </div>

        {/* Search */}
        <div style={{
          backgroundColor: '#111118',
          border: '1px solid #1e1e2e',
          borderRadius: '8px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.5rem'
        }}>
          <span style={{ color: '#475569' }}>🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
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

        {/* Projects grid */}
        {loading ? (
          <p style={{ color: '#475569' }}>Loading projects...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>

            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => router.push(`/projects/${project._id}`)}
                style={{
                  backgroundColor: '#111118',
                  border: '1px solid #1e1e2e',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e2e'}
              >
                {/* Project title + badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <h3 style={{
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '500',
                    margin: 0,
                    flex: 1
                  }}>
                    {project.title}
                  </h3>
                  <span style={{
                    backgroundColor: '#6366f115',
                    color: '#6366f1',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    marginLeft: '8px',
                    flexShrink: 0
                  }}>
                    Active
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  color: '#475569',
                  fontSize: '13px',
                  margin: '0 0 1rem',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.description || 'No description'}
                </p>

                {/* Footer — members + owner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {/* Member avatars */}
                  <div style={{ display: 'flex' }}>
                    {project.members?.slice(0, 3).map((member, index) => (
                      <div
                        key={member._id}
                        title={member.name}
                        style={{
                          width: '26px',
                          height: '26px',
                          backgroundColor: ['#6366f1', '#22c55e', '#f59e0b'][index % 3],
                          borderRadius: '50%',
                          border: '2px solid #111118',
                          marginLeft: index > 0 ? '-8px' : 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}
                      >
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div style={{
                        width: '26px',
                        height: '26px',
                        backgroundColor: '#1e1e2e',
                        borderRadius: '50%',
                        border: '2px solid #111118',
                        marginLeft: '-8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                        fontSize: '10px'
                      }}>
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>

                  <span style={{ color: '#475569', fontSize: '12px' }}>
                    {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}

            {/* Create new project card */}
            <div
              onClick={() => setShowModal(true)}
              style={{
                backgroundColor: 'transparent',
                border: '1px dashed #1e1e2e',
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '140px',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e2e'}
            >
              <span style={{ color: '#334155', fontSize: '28px' }}>+</span>
              <span style={{ color: '#334155', fontSize: '13px' }}>Create new project</span>
            </div>

          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}

    </div>
  );
}