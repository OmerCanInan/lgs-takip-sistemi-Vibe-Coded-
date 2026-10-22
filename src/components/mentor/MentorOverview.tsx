import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MentorOverview: React.FC<{ onNavigateToTab: (tab: string) => void }> = ({
  onNavigateToTab,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const {
    studentName,
    studyLogs,
    tasks,
    exams,
    todaySolvedQuestions,
    todayDurationMinutes,
    todayTargetQuestions,
    streakDays,
    pendingQuestionsCount,
    draftTasksCount,
    currentIntensity,
  } = useApp();

  // Weekly questions & accuracy
  const totalCorrect = studyLogs.reduce((acc, l) => acc + l.correct, 0);
  const totalIncorrect = studyLogs.reduce((acc, l) => acc + l.incorrect, 0);
  const totalBlank = studyLogs.reduce((acc, l) => acc + l.blank, 0);
  const weeklyTotalQuestions = totalCorrect + totalIncorrect;
  const overallAccuracy = weeklyTotalQuestions > 0 ? Math.round((totalCorrect / weeklyTotalQuestions) * 100) : 0;

  // Task completion %
  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasks = activeTasks.filter((t) => t.isCompleted).length;
  const taskCompletionRate = activeTasks.length > 0 ? Math.round((completedTasks / activeTasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Compact Notification Alerts (only when items are pending) */}
      {(pendingQuestionsCount > 0 || draftTasksCount > 0) && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {pendingQuestionsCount > 0 && (
            <button
              onClick={() => onNavigateToTab('questions')}
              className="btn btn-danger btn-sm"
              style={{ fontWeight: 700 }}
            >
              ❓ {pendingQuestionsCount} Bekleyen Soru Var
            </button>
          )}

          {draftTasksCount > 0 && (
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="btn btn-warning btn-sm"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fcd34d',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontWeight: 700,
              }}
            >
              🤖 {draftTasksCount} AI Taslak Görev Onayı
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Today's questions */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Bugün Çözülen</span>
            <Award size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
            {todaySolvedQuestions}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {todayTargetQuestions}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: todaySolvedQuestions >= todayTargetQuestions ? '#6ee7b7' : 'var(--text-secondary)', marginTop: '4px' }}>
            {todaySolvedQuestions >= todayTargetQuestions ? '✓ Günlük kota doldu' : `%${Math.round((todaySolvedQuestions / todayTargetQuestions) * 100)} tamamlandı`}
          </div>
        </div>

        {/* Weekly Questions */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Haftalık Toplam</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6ee7b7' }}>
            {weeklyTotalQuestions}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Soru</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Son 7 günde kaydedilen sorular
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Doğruluk Oranı</span>
            <CheckCircle2 size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fcd34d' }}>
            %{overallAccuracy}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>{totalCorrect} Doğru</span>
            {' • '}
            <span style={{ color: '#f87171', fontWeight: 600 }}>{totalIncorrect} Yanlış</span>
            {totalBlank > 0 && (
              <>
                {' • '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{totalBlank} Boş</span>
              </>
            )}
          </div>
        </div>

        {/* Streak & Tasks */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Streak & Görevler</span>
            <Flame size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fca5a5' }}>
            {streakDays} Gün <span style={{ fontSize: '0.9rem' }}>🔥</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Görev Başarısı: %{taskCompletionRate} ({completedTasks}/{activeTasks.length})
          </div>
        </div>
      </div>

      {/* Exam Net Progression Graph & Breakdown */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Deneme Net Gelişim Grafiği</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Son denemelerin ders bazlı netleri ve toplam net ilerlemesi
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#818cf8' }} /> Matematik
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#34d399' }} /> Fen
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f472b6' }} /> Türkçe
            </span>
          </div>
        </div>

        {/* Visual Bar Progression */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {exams.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
              }}
            >
              Henüz kaydedilmiş deneme sınavı bulunmuyor. İlk denemenizi girdiğinizde net gelişimi burada grafik olarak görünecektir.
            </div>
          ) : (
            exams.map((exam) => {
            const matNet = exam.subjects.find((s) => s.subject === 'Matematik')?.net || 0;
            const fenNet = exam.subjects.find((s) => s.subject === 'Fen Bilimleri')?.net || 0;
            const turkceNet = exam.subjects.find((s) => s.subject === 'Türkçe')?.net || 0;

            return (
              <div
                key={exam.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{exam.examName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      {exam.examDate}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#6ee7b7' }}>
                    {exam.totalNet.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 90 Net</span>
                  </div>
                </div>

                {/* Progress bars for main subjects */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#818cf8', marginBottom: '3px' }}>
                      <span>Matematik</span>
                      <strong>{matNet.toFixed(1)} / 20</strong>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${(matNet / 20) * 100}%`, background: '#818cf8' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#34d399', marginBottom: '3px' }}>
                      <span>Fen Bilimleri</span>
                      <strong>{fenNet.toFixed(1)} / 20</strong>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${(fenNet / 20) * 100}%`, background: '#34d399' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#f472b6', marginBottom: '3px' }}>
                      <span>Türkçe</span>
                      <strong>{turkceNet.toFixed(1)} / 20</strong>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${(turkceNet / 20) * 100}%`, background: '#f472b6' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* SECTION: STUDENT STUDY & QUESTION PHOTOS */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Öğrencinin Çözüm & Çalışma Fotoğrafları</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Öğrencinin günlük soru girişlerine eklediği defter, test ve çözüm fotoğrafları
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {studyLogs.filter((l) => l.images && l.images.length > 0).length} Kayıt Fotoğraflı
          </span>
        </div>

        {studyLogs.filter((l) => l.images && l.images.length > 0).length === 0 ? (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <Camera size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div>Henüz fotoğraflı soru/çalışma girişi yapılmadı.</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Öğrenci günlük soru girişi yaparken defter/kitap sayfası yüklediğinde burada inceleyebilirsiniz.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {studyLogs
              .filter((l) => l.images && l.images.length > 0)
              .map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: log.subject === 'Matematik' ? '#818cf8' : log.subject === 'Fen Bilimleri' ? '#34d399' : '#f472b6',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {log.subject}
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                        {log.topicName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>{log.correct} Doğru</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>{log.incorrect} Yanlış</span>
                      {log.blank > 0 && <span style={{ color: 'var(--text-muted)' }}>{log.blank} Boş</span>}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>• {log.logDate}</span>
                    </div>
                  </div>

                  {/* Photo thumbnails grid */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {log.images!.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => setLightboxImage(img)}
                        style={{
                          position: 'relative',
                          width: '100px',
                          height: '100px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        className="glass-card-interactive"
                        title="Büyütmek için tıkla"
                      >
                        <img
                          src={img}
                          alt={`${log.topicName} fotoğraf ${imgIdx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <Maximize2 size={20} color="#fff" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '95vw', maxHeight: '90vh' }}>
            <img
              src={lightboxImage}
              alt="Büyük Çalışma Görseli"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                borderRadius: '10px',
                objectFit: 'contain',
              }}
            />
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                background: 'rgba(239, 68, 68, 0.9)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
