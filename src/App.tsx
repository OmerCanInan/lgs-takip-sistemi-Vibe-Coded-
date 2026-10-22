import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { StudentView } from './components/student/StudentView';
import { MentorView } from './components/mentor/MentorView';
import { Smartphone, RotateCcw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { role, resetToDefaults } = useApp();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'responsive'>('responsive');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header previewMode={previewMode} setPreviewMode={setPreviewMode} />

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: previewMode === 'mobile' ? '460px' : '1240px',
          margin: '0 auto',
          padding: '20px 16px',
          transition: 'max-width 0.3s ease',
        }}
      >
        {previewMode === 'mobile' ? (
          /* Sleek Mobile Device Mockup Frame */
          <div
            style={{
              background: '#0a0e1a',
              borderRadius: '36px',
              border: '8px solid #1e293b',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              minHeight: '780px',
              position: 'relative',
              padding: '16px',
            }}
          >
            {/* Phone Speaker & Camera Notch */}
            <div
              style={{
                width: '120px',
                height: '18px',
                background: '#1e293b',
                borderRadius: '0 0 12px 12px',
                margin: '-16px auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: '40px', height: '4px', background: '#334155', borderRadius: '2px' }} />
              <div style={{ width: '8px', height: '8px', background: '#334155', borderRadius: '50%' }} />
            </div>

            {role === 'student' ? <StudentView /> : <MentorView />}
          </div>
        ) : (
          /* Full Width Responsive View */
          <div>
            {role === 'student' ? <StudentView /> : <MentorView />}
          </div>
        )}
      </main>

      {/* Footer info & reset test data */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: role === 'student' ? '65px' : '0px',
        }}
      >
        <span>LGS Yapay Zeka Destekli Çalışma ve Takip Sistemi • Mobil Öncelikli PWA</span>
        <span>•</span>
        <button
          onClick={resetToDefaults}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Tüm verileri başlangıç mock durumuna döndür"
        >
          <RotateCcw size={12} /> Test Verilerini Sıfırla
        </button>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
