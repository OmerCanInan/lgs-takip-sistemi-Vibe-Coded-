import React from 'react';
import { Flame, ShieldCheck, UserCheck, Sparkles, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  previewMode?: 'mobile' | 'responsive';
  setPreviewMode?: (mode: 'mobile' | 'responsive') => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    currentUser,
    logout,
    role,
    setRole,
    streakDays,
    pendingQuestionsCount,
    draftTasksCount,
    isSupabaseConnected,
  } = useApp();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              color: '#fff',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                LGS Takip Sistemi
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                AI DESTEKLİ
              </span>
              {isSupabaseConnected && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Supabase veritabanı ve realtime senkronizasyon bağlı"
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  CANLI BULUT
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {role === 'student' ? 'LGS Hazırlık' : 'Mentor Takip Masası'}
            </p>
          </div>
        </div>

        {/* Middle Stats Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Streak Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#fcd34d',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
            title="Ardı ardına çalışılan gün sayısı"
          >
            <Flame size={16} color="#f59e0b" fill="#f59e0b" />
            <span>{streakDays} Gün Streak</span>
          </div>

          {/* Pending Alerts for Mentor */}
          {role === 'mentor' && (pendingQuestionsCount > 0 || draftTasksCount > 0) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {pendingQuestionsCount > 0 && <span>❓ {pendingQuestionsCount} Bekleyen Soru</span>}
              {draftTasksCount > 0 && <span>📝 {draftTasksCount} Taslak Görev</span>}
            </div>
          )}
        </div>

        {/* Controls: Role Selector & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Active Role Selector Switch (or Student Indicator) */}
          {currentUser?.role === 'student' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontWeight: 800,
                fontSize: '0.82rem',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <UserCheck size={15} />
              <span>Öykü</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                background: 'rgba(15, 23, 42, 0.9)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setRole('student')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: role === 'student' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                  color: role === 'student' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <UserCheck size={15} />
                <span>Öğrenci</span>
              </button>
              <button
                onClick={() => setRole('mentor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: role === 'mentor' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                  color: role === 'mentor' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <ShieldCheck size={15} />
                <span>Mentor</span>
                {(pendingQuestionsCount > 0 || draftTasksCount > 0) && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                    }}
                  />
                )}
              </button>
            </div>
          )}

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={logout}
              title="Çıkış Yap"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut size={14} />
              <span>Çıkış</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
