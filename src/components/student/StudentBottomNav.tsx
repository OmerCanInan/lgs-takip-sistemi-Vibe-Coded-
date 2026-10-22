import React from 'react';
import { Home, Edit3, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type StudentTab = 'home' | 'entry' | 'questions';

interface StudentBottomNavProps {
  activeTab: StudentTab;
  setActiveTab: (tab: StudentTab) => void;
}

export const StudentBottomNav: React.FC<StudentBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { questions } = useApp();
  const pendingOrAnsweredCount = questions.filter(
    (q) => q.status === 'answered' || q.status === 'pending'
  ).length;

  return (
    <nav className="bottom-nav">
      <button
        onClick={() => setActiveTab('home')}
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <Home size={20} />
        </div>
        <span>Ana Sayfa</span>
      </button>

      <button
        onClick={() => setActiveTab('entry')}
        className={`bottom-nav-item ${activeTab === 'entry' ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <Edit3 size={20} />
        </div>
        <span>Veri Gir</span>
      </button>

      <button
        onClick={() => setActiveTab('questions')}
        className={`bottom-nav-item ${activeTab === 'questions' ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <HelpCircle size={20} />
        </div>
        <span>Sorularım</span>
        {pendingOrAnsweredCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '18px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
            }}
          />
        )}
      </button>
    </nav>
  );
};
