'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../../../components/Sidebar';
import { askAIApi, getSprintSummaryApi } from '../../../../api/ai.api';
import { getProjectApi } from '../../../../api/projects.api';

const SUGGESTED_QUESTIONS = [
  'What tasks are still in progress?',
  'What high priority issues exist?',
  'What has been completed so far?',
  'Are there any blockers?',
  'What is the overall project progress?',
  'Summarize what the team has been doing'
];

export default function AIPage() {
  const router = useRouter();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await getProjectApi(id);
      setProject(response.data.project);
    } catch (err) {
      console.error('Failed to fetch project:', err);
    }
  };

  // Handles sending any question — either typed or clicked
  const handleAsk = async (question) => {
    const q = question || input.trim();
    if (!q) return;

    // Add user message to chat immediately
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAIApi(id, q);
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: response.data.answer }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generates a full sprint summary
  const handleSprintSummary = async () => {
    setSummaryLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: 'Generate a sprint summary for this project' }
    ]);

    try {
      const response = await getSprintSummaryApi(id);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: response.data.summary }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'Sorry, failed to generate summary. Please try again.'
        }
      ]);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{
        marginLeft: '220px',
        flex: 1,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
          <button
            onClick={() => router.push(`/projects/${id}`)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#475569',
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '8px',
              display: 'block'
            }}
          >
            ← Back to project
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                color: '#fff',
                fontSize: '22px',
                fontWeight: '500',
                margin: '0 0 4px'
              }}>
                ✨ AI Assistant
              </h1>
              <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
                Ask anything about {project?.title || 'this project'}
              </p>
            </div>

            {/* Sprint Summary button */}
            <button
              onClick={handleSprintSummary}
              disabled={summaryLoading}
              style={{
                backgroundColor: '#6366f115',
                border: '1px solid #6366f140',
                borderRadius: '8px',
                padding: '10px 18px',
                color: '#6366f1',
                fontSize: '13px',
                fontWeight: '500',
                cursor: summaryLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {summaryLoading ? '⏳ Generating...' : '📊 Sprint Summary'}
            </button>
          </div>
        </div>

        {/* Chat messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingRight: '4px'
        }}>

          {/* Empty state with suggested questions */}
          {messages.length === 0 && (
            <div>
              <div style={{
                backgroundColor: '#111118',
                border: '1px solid #1e1e2e',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>✨</p>
                <p style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '500',
                  margin: '0 0 8px'
                }}>
                  AI Project Assistant
                </p>
                <p style={{ color: '#475569', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                  I have full context of everything in this project —
                  tasks, comments and activity. Ask me anything.
                </p>
              </div>

              <p style={{ color: '#475569', fontSize: '13px', marginBottom: '10px' }}>
                Try asking:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    style={{
                      backgroundColor: '#111118',
                      border: '1px solid #1e1e2e',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      color: '#94a3b8',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      lineHeight: 1.4,
                      transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e1e2e'}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              {/* AI avatar */}
              {msg.role === 'ai' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#6366f1',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  ✨
                </div>
              )}

              {/* Message bubble */}
              <div style={{
                backgroundColor: msg.role === 'user' ? '#6366f1' : '#111118',
                border: msg.role === 'ai' ? '1px solid #1e1e2e' : 'none',
                borderRadius: msg.role === 'user'
                  ? '12px 12px 0 12px'
                  : '0 12px 12px 12px',
                padding: '12px 16px',
                maxWidth: '72%',
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {(loading || summaryLoading) && (
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#6366f1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                ✨
              </div>
              <div style={{
                backgroundColor: '#111118',
                border: '1px solid #1e1e2e',
                borderRadius: '0 12px 12px 12px',
                padding: '12px 16px',
                color: '#475569',
                fontSize: '14px'
              }}>
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input area at bottom */}
        <div style={{
          backgroundColor: '#111118',
          border: '1px solid #1e1e2e',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexShrink: 0
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter adds new line
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask anything about your project... (Enter to send)"
            rows={2}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.5',
              fontFamily: 'sans-serif'
            }}
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || summaryLoading || !input.trim()}
            style={{
              backgroundColor: loading || summaryLoading || !input.trim()
                ? '#2d2d3d'
                : '#6366f1',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              color: loading || summaryLoading || !input.trim() ? '#475569' : '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading || summaryLoading || !input.trim()
                ? 'not-allowed'
                : 'pointer',
              flexShrink: 0
            }}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}