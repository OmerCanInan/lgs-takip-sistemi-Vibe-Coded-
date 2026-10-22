import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle,
  MessageSquare,
  Send,
  Camera,
  ZoomIn,
  AlertTriangle,
  Flame,
  X,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { QuestionItem, SubjectName } from '../../types';

export const MentorQuestionDesk: React.FC = () => {
  const { questions, answerQuestionByMentor, pendingQuestionsCount } = useApp();

  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [activeQuestion, setActiveQuestion] = useState<QuestionItem | null>(null);
  const [mentorAnswerText, setMentorAnswerText] = useState('');
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState<string | null>(null);

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (filterMode === 'pending' && q.status !== 'pending' && q.status !== 'reopened') {
      return false;
    }
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) {
      return false;
    }
    return true;
  });

  // Analytics: Most queried subjects/topics
  const topicFrequency: Record<string, number> = {};
  questions.forEach((q) => {
    const key = q.topicName || q.subject;
    topicFrequency[key] = (topicFrequency[key] || 0) + 1;
  });
  const topQueried = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !mentorAnswerText.trim()) return;

    answerQuestionByMentor(activeQuestion.id, mentorAnswerText.trim());
    setActiveQuestion(null);
    setMentorAnswerText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Analytics Summary */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <HelpCircle size={22} color="#f59e0b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Gelen Sorular & Çözüm Masası</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Öğrencinin çözemediği sorular sadece sana gelir. Yapay zekaya gitmez; gizlilik ve pedagojik kontrol sendedir.
            </p>
          </div>

          <div
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: pendingQuestionsCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: pendingQuestionsCount > 0 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
              color: pendingQuestionsCount > 0 ? '#fca5a5' : '#6ee7b7',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            {pendingQuestionsCount > 0
              ? `⚠️ ${pendingQuestionsCount} Soru Cevap Bekliyor`
              : '✓ Tüm Sorular Cevaplandı'}
          </div>
        </div>

        {/* Most Queried Topics Analytic Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>En Çok Soru Gelen Konular:</span>
          {topQueried.map(([topic, count], idx) => (
            <span
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '4px 10px',
                borderRadius: '6px',
                color: '#fcd34d',
                fontWeight: 700,
              }}
            >
              #{idx + 1} {topic} ({count} soru)
            </span>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterMode('pending')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: filterMode === 'pending' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Bekleyenler & Tekrar Sorulanlar
          </button>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: filterMode === 'all' ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Tüm Sorular ({questions.length})
          </button>
        </div>

        <select
          className="input-field"
          style={{ width: 'auto', padding: '8px 14px', fontSize: '0.82rem' }}
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="all">Tüm Dersler</option>
          <option value="Matematik">Matematik</option>
          <option value="Fen Bilimleri">Fen Bilimleri</option>
          <option value="Türkçe">Türkçe</option>
          <option value="T.C. İnkılap Tarihi">T.C. İnkılap Tarihi</option>
          <option value="Din Kültürü">Din Kültürü</option>
          <option value="İngilizce">İngilizce</option>
        </select>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredQuestions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Seçilen filtrede soru bulunamadı.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isPending = q.status === 'pending' || q.status === 'reopened';

            return (
              <div
                key={q.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  border: q.status === 'reopened' ? '1px solid rgba(239, 68, 68, 0.6)' : isPending ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#818cf8' }}>
                        {q.subject}
                      </span>
                      {q.topicName && (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>• {q.topicName}</span>
                      )}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background:
                            q.status === 'reopened'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : q.status === 'pending'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : q.status === 'answered'
                              ? 'rgba(99, 102, 241, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color:
                            q.status === 'reopened'
                              ? '#fca5a5'
                              : q.status === 'pending'
                              ? '#fcd34d'
                              : q.status === 'answered'
                              ? '#a5b4fc'
                              : '#6ee7b7',
                        }}
                      >
                        {q.status === 'reopened'
                          ? '⚠️ Hâlâ Anlamadım (Tekrar Bak)'
                          : q.status === 'pending'
                          ? 'Cevap Bekliyor'
                          : q.status === 'answered'
                          ? 'Cevaplandı (Öğrenci Onayı Bekleniyor)'
                          : '✓ Çözüldü (Yanlış Defteri)'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Gönderim: {new Date(q.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => setActiveQuestion(q)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <MessageSquare size={16} />
                      <span>Çözümü Yaz & Gönder</span>
                    </button>
                  )}
                </div>

                {/* Question Note & Attached Photos */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '14px' }}>
                  {q.images.length > 0 && (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={q.images[0]}
                        alt="Soru Görseli"
                        onClick={() => setZoomPhotoUrl(q.images[0])}
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: '1px solid var(--border-subtle)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          padding: '4px',
                          borderRadius: '6px',
                          color: '#fff',
                        }}
                      >
                        <ZoomIn size={14} />
                      </div>
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Öğrencinin Notu:
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                        color: '#fff',
                      }}
                    >
                      {q.note}
                    </div>
                  </div>
                </div>

                {/* Conversation History */}
                {q.messages.length > 1 && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700 }}>
                      Soru Cevap Geçmişi:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.messages.slice(1).map((m) => (
                        <div
                          key={m.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: m.senderRole === 'mentor' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <strong style={{ color: m.senderRole === 'mentor' ? '#a5b4fc' : '#fca5a5' }}>
                            {m.senderRole === 'mentor' ? 'Sen (Mentor): ' : 'Kardeşin: '}
                          </strong>
                          <span>{m.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ANSWER MODAL */}
      {activeQuestion && (
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
              maxWidth: '560px',
              padding: '24px',
              background: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 800 }}>
                  {activeQuestion.subject} • {activeQuestion.topicName}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  Kardeşine Çözüm Gönder
                </h3>
              </div>
              <button onClick={() => setActiveQuestion(null)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* Student Note Recap */}
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '0.85rem',
                color: '#fcd34d',
                marginBottom: '16px',
              }}
            >
              <strong>Öğrenci Notu:</strong> {activeQuestion.note}
            </div>

            <form onSubmit={handleSendAnswer}>
              <div style={{ marginBottom: '16px' }}>
                <label className="input-label">Açıklayıcı Çözümün & Pedagojik İpucu</label>
                <textarea
                  className="input-field"
                  rows={5}
                  value={mentorAnswerText}
                  onChange={(e) => setMentorAnswerText(e.target.value)}
                  placeholder="Adım adım çözümünü yaz: Örn: 1. Adımda formüldeki değişkenleri yerine koyuyoruz... Şıkları elerken şuna dikkat et..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveQuestion(null)}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                  <Send size={16} />
                  <span>Cevabı Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL ZOOM PHOTO MODAL */}
      {zoomPhotoUrl && (
        <div
          onClick={() => setZoomPhotoUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={zoomPhotoUrl}
            alt="Büyük Fotoğraf"
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
            }}
          />
        </div>
      )}
    </div>
  );
};
