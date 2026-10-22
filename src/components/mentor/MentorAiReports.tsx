import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Bot,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MentorAiReports: React.FC = () => {
  const { aiReports, chatMessages, generateAiWeeklyReport, isReportLoading, studentName } = useApp();
  const [activeTab, setActiveTab] = useState<'reports' | 'chatHistory'>('reports');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Tab Switcher */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Bot size={22} color="#a855f7" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Strateji Raporları & Sohbet Geçmişi</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Gemini'nin ürettiği haftalık gelişim analizlerini inceleyin ve öğrencinizin AI koç ile yaptığı
              yazışmaları denetleyin.
            </p>
          </div>

          <button
            onClick={generateAiWeeklyReport}
            className="btn btn-primary"
            style={{ gap: '8px', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
            disabled={isReportLoading}
          >
            <Sparkles size={18} />
            <span>{isReportLoading ? 'Gemini Üretiyor...' : 'Yeni Haftalık Rapor Üret'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('reports')}
            className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <FileText size={16} />
            <span>Haftalık Analiz Raporları ({aiReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('chatHistory')}
            className={`btn ${activeTab === 'chatHistory' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <MessageSquare size={16} />
            <span>Kardeşimin AI Koç Yazışmaları ({chatMessages.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WEEKLY ANALYSIS REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {aiReports.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Henüz üretilmiş bir AI analiz raporu bulunmuyor. Yukarıdaki "Yeni Haftalık Rapor Üret (Gemini)" butonuna tıklayarak ilk strateji raporunu oluşturabilirsiniz.
            </div>
          ) : (
            aiReports.map((report) => (
            <div key={report.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>
                      GEMINI AI
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Hafta Başlangıcı: {report.weekStart}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {report.title}
                  </h3>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Oluşturulma: {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  marginBottom: '20px',
                }}
              >
                {report.summary}
              </div>

              {/* 3 Pillars Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Strengths */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
                    <CheckCircle2 size={18} />
                    <span>Öne Çıkan Başarılar</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {report.strengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
                    <AlertTriangle size={18} />
                    <span>Kritik Dikkat Noktaları</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {report.weaknesses.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fcd34d', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
                    <Lightbulb size={18} />
                    <span>Mentor Strateji Tavsiyeleri</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {report.recommendations.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )))}
        </div>
      )}

      {/* TAB 2: STUDENT'S AI CHAT HISTORY INSPECTOR */}
      {activeTab === 'chatHistory' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Öğrenci & AI Koç Canlı Sohbet Kayıtları
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Öğrencinin AI'a sorduğu soruları, takıldığı yerleri ve AI'ın verdiği pedagojik rehberliği buradan okuyabilirsiniz.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                Henüz öğrenci ile AI koç arasında bir sohbet kaydı bulunmuyor.
              </div>
            ) : (
              chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-start' : 'flex-end',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong>{msg.role === 'user' ? '🙋‍♂️ Öğrenci' : '🤖 AI Koç (8B)'}</strong> •{' '}
                  {new Date(msg.createdAt).toLocaleString('tr-TR')}
                </div>

                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background:
                      msg.role === 'user'
                        ? 'rgba(255, 255, 255, 0.07)'
                        : 'rgba(99, 102, 241, 0.15)',
                    border:
                      msg.role === 'user'
                        ? '1px solid var(--border-subtle)'
                        : '1px solid rgba(99, 102, 241, 0.3)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  );
};
