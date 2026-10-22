import React, { useState } from 'react';
import { Sparkles, User, Lock, Eye, EyeOff, LogIn, ShieldAlert, GraduationCap, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error || 'Giriş yapılamadı.');
        setIsLoading(false);
      }
    }, 300);
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.18) 0%, rgba(9, 13, 22, 1) 70%)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Brand / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
              color: '#fff',
              marginBottom: '14px',
            }}
          >
            <Sparkles size={28} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
              LGS Takip Sistemi
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.35)',
              }}
            >
              AI DESTEKLİ
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Öğrenci & Mentor Giriş Portalı
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginBottom: '20px',
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Kullanıcı Adı
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <User size={18} />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <LogIn size={18} />
            <span>{isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
          </button>
        </form>

        {/* Quick Fill Demo Helper Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            HIZLI DOLDUR (TEST HESAPLARI)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('öyküöykü', 'öykü1234')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <GraduationCap size={14} />
              <span>Öğrenci (Öykü)</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin', 'adminMf130805')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#fcd34d',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ShieldCheck size={14} />
              <span>Admin / Mentor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
