import React, { useState } from 'react';
import {
  LayoutDashboard,
  Grid,
  Zap,
  CheckSquare,
  HelpCircle,
  Bot,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { SubjectName } from '../../types';
import { MentorOverview } from './MentorOverview';
import { MentorHeatmap } from './MentorHeatmap';
import { MentorIntensity } from './MentorIntensity';
import { MentorTasks } from './MentorTasks';
import { MentorQuestionDesk } from './MentorQuestionDesk';
import { MentorAiReports } from './MentorAiReports';

export type MentorTab =
  | 'overview'
  | 'heatmap'
  | 'intensity'
  | 'tasks'
  | 'questions'
  | 'reports';

export const MentorView: React.FC = () => {
  const { pendingQuestionsCount, draftTasksCount } = useApp();
  const [activeTab, setActiveTab] = useState<MentorTab>('overview');
  const [prefilledTopic, setPrefilledTopic] = useState<{
    topicId: string;
    subject: SubjectName;
    topicName: string;
  } | null>(null);

  const handleAssignTaskFromTopic = (
    topicId: string,
    subject: SubjectName,
    topicName: string
  ) => {
    setPrefilledTopic({ topicId, subject, topicName });
    setActiveTab('tasks');
  };

  const navItems = [
    { id: 'overview' as MentorTab, label: 'Genel Durum', icon: LayoutDashboard },
    { id: 'heatmap' as MentorTab, label: 'Konu Eksik Haritası', icon: Grid },
    { id: 'intensity' as MentorTab, label: 'Yoğunluk Kontrolü', icon: Zap },
    {
      id: 'tasks' as MentorTab,
      label: 'Görev Yönetimi',
      icon: CheckSquare,
      badge: draftTasksCount > 0 ? draftTasksCount : undefined,
    },
    {
      id: 'questions' as MentorTab,
      label: 'Gelen Sorular',
      icon: HelpCircle,
      badge: pendingQuestionsCount > 0 ? pendingQuestionsCount : undefined,
      badgeColor: '#ef4444',
    },
    { id: 'reports' as MentorTab, label: 'AI Raporları & Sohbet', icon: Bot },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Mentor Navigation Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '6px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    background: item.badgeColor || '#f59e0b',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && <MentorOverview onNavigateToTab={(t) => setActiveTab(t as MentorTab)} />}
      {activeTab === 'heatmap' && <MentorHeatmap onAssignTaskFromTopic={handleAssignTaskFromTopic} />}
      {activeTab === 'intensity' && <MentorIntensity />}
      {activeTab === 'tasks' && (
        <MentorTasks
          prefilledTopic={prefilledTopic}
          onClearPrefilledTopic={() => setPrefilledTopic(null)}
        />
      )}
      {activeTab === 'questions' && <MentorQuestionDesk />}
      {activeTab === 'reports' && <MentorAiReports />}
    </div>
  );
};
