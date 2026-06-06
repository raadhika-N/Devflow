'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '../store/authStore';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '⚡' },
    { label: 'Projects', path: '/projects', icon: '📁' },
  ];

  return (
    <div style={{
      width: '220px',
      backgroundColor: '#0d0d15',
      borderRight: '1px solid #1e1e2e',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '2rem',
        padding: '0 4px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#6366f1',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}>⚡</div>
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>DevFlow</span>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#6366f115' : 'transparent',
                color: isActive ? '#6366f1' : '#475569',
                fontSize: '14px',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* User info + logout */}
      <div style={{
        borderTop: '1px solid #1e1e2e',
        paddingTop: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
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
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              color: '#fff',
              fontSize: '13px',
              margin: 0,
              fontWeight: '500'
            }}>
              {user?.name || 'User'}
            </p>
            <p style={{
              color: '#475569',
              fontSize: '11px',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email || ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            padding: '8px',
            color: '#475569',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}