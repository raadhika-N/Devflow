'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(email, password);
      setAuth(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0f',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#6366f1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>⚡</div>
            <span style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>DevFlow</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '500', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#111118',
          border: '1px solid #1e1e2e',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>

          {/* Error message */}
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

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '13px',
                marginBottom: '6px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="radhika@gmail.com"
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
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '13px',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#4f52b8' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        {/* Signup link */}
        <p style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '13px',
          marginTop: '1rem'
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: '#6366f1', textDecoration: 'none' }}>
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}