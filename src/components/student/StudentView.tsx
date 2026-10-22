import React, { useState } from 'react';
import { StudentHome } from './StudentHome';
import { StudentDataEntry } from './StudentDataEntry';
import { StudentQuestions } from './StudentQuestions';
import { StudentBottomNav, type StudentTab } from './StudentBottomNav';

export const StudentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudentTab>('home');

  return (
    <div style={{ minHeight: '100%', position: 'relative' }}>
      {activeTab === 'home' && (
        <StudentHome onNavigateToTab={(tab) => setActiveTab(tab)} />
      )}
      {activeTab === 'entry' && <StudentDataEntry />}
      {activeTab === 'questions' && <StudentQuestions />}

      {/* Persistent Bottom Navigation for Student */}
      <StudentBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
