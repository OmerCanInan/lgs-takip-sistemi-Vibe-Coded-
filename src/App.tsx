import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { StudentView } from './components/student/StudentView';
import { MentorView } from './components/mentor/MentorView';
import { LoginView } from './components/auth/LoginView';
import { RotateCcw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { role, resetToDefaults, currentUser } = useApp();

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '20px 16px',
        }}
      >
        {role === 'student' ? <StudentView /> : <MentorView />}
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
        <span>LGS Yapay Zeka Destekli Çalışma ve Takip Sistemi</span>
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
