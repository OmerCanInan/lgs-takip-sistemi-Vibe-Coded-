import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, PlusCircle, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { SubjectName } from '../../types';

export const MentorHeatmap: React.FC<{ onAssignTaskFromTopic: (topicId: string, subject: SubjectName, topicName: string) => void }> = ({
  onAssignTaskFromTopic,
}) => {
  const { topicMasteries } = useApp();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [activeModalTopic, setActiveModalTopic] = useState<typeof topicMasteries[0] | null>(null);

  const subjectsList: SubjectName[] = [
    'Matematik',
    'Fen Bilimleri',
    'Türkçe',
    'T.C. İnkılap Tarihi',
    'Din Kültürü',
    'İngilizce',
  ];

  const filteredTopics = topicMasteries.filter((tm) => {
    if (selectedSubjectFilter === 'all') return true;
    return tm.topic.subject === selectedSubjectFilter;
  });

  // Status color mapper
  const getStatusStyle = (status: typeof topicMasteries[0]['status']) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'rgba(239, 68, 68, 0.2)',
          border: 'rgba(239, 68, 68, 0.5)',
          color: '#fca5a5',
          label: 'Kritik (>%35 Yanlış)',
          dot: '#ef4444',
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.2)',
          border: 'rgba(245, 158, 11, 0.5)',
          color: '#fcd34d',
          label: 'Geliştirilmeli (%15-%35)',
          dot: '#f59e0b',
        };
      case 'mastered':
        return {
          bg: 'rgba(16, 185, 129, 0.2)',
          border: 'rgba(16, 185, 129, 0.5)',
          color: '#6ee7b7',
          label: 'Sağlam (<%15 Yanlış)',
          dot: '#10b981',
        };
      case 'untested':
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--text-muted)',
          label: 'Henüz Çözülmedi',
          dot: '#64748b',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Legend */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>LGS Konu Eksik & Hakimiyet Haritası</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Her MEB LGS konusu, öğrencinin soru çözüm yanlış oranına göre renklendirilir.
            </p>
          </div>

          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: 'none',
                background: selectedSubjectFilter === 'all' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                color: selectedSubjectFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Tümü ({topicMasteries.length})
            </button>
            {subjectsList.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubjectFilter(subj)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: 'none',
                  background: selectedSubjectFilter === subj ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                  color: selectedSubjectFilter === subj ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }} />
            🔴 <strong>Kırmızı:</strong> Kritik Açık (Yanlış &gt; %35)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f59e0b' }} />
            🟡 <strong>Sarı:</strong> Geliştirilmeli (Yanlış %15 - %35)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
            🟢 <strong>Yeşil:</strong> Konu Sağlam (Yanlış &lt; %15)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#64748b' }} />
            ⚪ <strong>Gri:</strong> Henüz Soru Çözülmedi
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {filteredTopics.map((tm) => {
          const style = getStatusStyle(tm.status);

          return (
            <div
              key={tm.topic.id}
              onClick={() => setActiveModalTopic(tm)}
              className="glass-panel glass-card-interactive"
              style={{
                padding: '16px',
                background: style.bg,
                border: `1px solid ${style.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    {tm.topic.subject} • {tm.topic.kazanimKodu}
                  </span>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: style.dot,
                    }}
                  />
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', marginBottom: '4px' }}>
                  {tm.topic.topicName}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {tm.topic.unit}
                </div>
              </div>

              {/* Stats Footer in Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.78rem',
                }}
              >
                {tm.totalQuestions > 0 ? (
                  <>
                    <span style={{ color: style.color, fontWeight: 700 }}>
                      %{tm.errorRate} Hata Oranı
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {tm.totalQuestions} Soru Çözüldü
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Çalışma kaydı yok</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL & TASK ASSIGN MODAL */}
      {activeModalTopic && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              background: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 800 }}>
                  {activeModalTopic.topic.subject} • {activeModalTopic.topic.kazanimKodu}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {activeModalTopic.topic.topicName}
                </h3>
              </div>
              <button onClick={() => setActiveModalTopic(null)} className="btn btn-secondary btn-sm">
                Kapat
              </button>
            </div>

            {/* Performance Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.04)',
                textAlign: 'center',
                marginBottom: '18px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>DOĞRU</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                  {activeModalTopic.totalCorrect}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>YANLIŞ</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ef4444' }}>
                  {activeModalTopic.totalIncorrect}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#fcd34d' }}>HATA ORANI</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b' }}>
                  %{activeModalTopic.errorRate}
                </div>
              </div>
            </div>

            {/* Recommended Questions Note */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              💡 MEB LGS Önerilen Haftalık Soru: <strong>{activeModalTopic.topic.recommendedWeeklyQuestions || 30} Soru</strong>
            </div>

            {/* Direct Task Assignment Button */}
            <button
              onClick={() => {
                onAssignTaskFromTopic(
                  activeModalTopic.topic.id,
                  activeModalTopic.topic.subject,
                  activeModalTopic.topic.topicName
                );
                setActiveModalTopic(null);
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <PlusCircle size={18} />
              <span>Bu Konudan Öğrenciye Görev Ata</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
