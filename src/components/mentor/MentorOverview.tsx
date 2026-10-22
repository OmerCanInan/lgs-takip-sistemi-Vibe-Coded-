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
  Eye,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ExamResult } from '../../types';

export const MentorOverview: React.FC<{ onNavigateToTab: (tab: string) => void }> = ({
  onNavigateToTab,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedExamForModal, setSelectedExamForModal] = useState<ExamResult | null>(null);
  const [expandedExamIds, setExpandedExamIds] = useState<string[]>([]);
  const [isExamsPanelOpen, setIsExamsPanelOpen] = useState(true);

  const toggleExamExpand = (id: string) => {
    setExpandedExamIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
    deleteExam,
    deleteStudyLog,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExamsPanelOpen ? '20px' : '0', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Deneme Net Gelişim Grafiği</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Son denemelerin ders bazlı netleri ve toplam net ilerlemesi
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
            <button
              onClick={() => setIsExamsPanelOpen(!isExamsPanelOpen)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', padding: '6px 12px' }}
              title={isExamsPanelOpen ? 'Denemeler Panelini Kapat' : 'Denemeler Panelini Aç'}
            >
              {isExamsPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>{isExamsPanelOpen ? 'Paneli Daralt' : 'Paneli Aç'}</span>
            </button>
          </div>
        </div>

        {/* Visual Bar Progression and Exam List */}
        {isExamsPanelOpen && (
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
                const isExpanded = expandedExamIds.includes(exam.id);
                const totalD = exam.subjects.reduce((a, s) => a + (Number(s.correct) || 0), 0);
                const totalY = exam.subjects.reduce((a, s) => a + (Number(s.incorrect) || 0), 0);
                const totalB = exam.subjects.reduce((a, s) => a + (Number(s.blank) || 0), 0);
                const successPercent = Math.min(100, Math.max(0, (exam.totalNet / 90) * 100)).toFixed(1);

                return (
                  <div
                    key={exam.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{exam.examName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            %{successPercent} Başarı
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          📅 {exam.examDate} • Toplam {totalD} Doğru, {totalY} Yanlış, {totalB} Boş
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right', marginRight: '6px' }}>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#6ee7b7' }}>
                            {exam.totalNet.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 90 Net</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedExamForModal(exam)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '6px', padding: '8px 14px', fontSize: '0.8rem' }}
                          title="Tüm netleri ve karne detaylarını aç"
                        >
                          <Eye size={16} />
                          <span>Karnesi & Netleri İncele</span>
                        </button>

                        <button
                          onClick={() => toggleExamExpand(exam.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                          title={isExpanded ? 'Tabloyu Gizle' : 'Hızlı Tabloyu Gör'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${exam.examName}" deneme sonucunu silmek istediğinize emin misiniz?`)) {
                              deleteExam(exam.id);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          style={{
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                          }}
                          title="Bu Denemeyi Sil"
                        >
                          <Trash2 size={16} color="#fca5a5" />
                        </button>
                      </div>
                    </div>

                  {/* 6 Subjects Quick Badge Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: isExpanded ? '16px' : '0' }}>
                    {exam.subjects.map((sub) => {
                      const maxQ = sub.subject === 'Matematik' || sub.subject === 'Fen Bilimleri' || sub.subject === 'Türkçe' ? 20 : 10;
                      const subColor =
                        sub.subject === 'Matematik'
                          ? '#818cf8'
                          : sub.subject === 'Fen Bilimleri'
                          ? '#34d399'
                          : sub.subject === 'Türkçe'
                          ? '#f472b6'
                          : '#fcd34d';
                      return (
                        <div
                          key={sub.subject}
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                            <span style={{ color: subColor, fontWeight: 700 }}>{sub.subject}</span>
                            <span style={{ fontWeight: 800, color: '#fff' }}>{sub.net.toFixed(1)} Net</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>{sub.correct} D</span>
                            <span>{sub.incorrect} Y</span>
                            <span>{sub.blank} B</span>
                          </div>
                          <div className="progress-bar-bg" style={{ height: '4px', marginTop: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, (sub.net / maxQ) * 100))}%`, background: subColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Breakdown Table */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '14px',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--border-subtle)',
                        overflowX: 'auto',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '8px 10px' }}>Ders</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center' }}>Soru</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#34d399' }}>Doğru</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#f87171' }}>Yanlış</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8' }}>Boş</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#818cf8' }}>Net</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Başarı</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.subjects.map((sub) => {
                            const maxQ = sub.subject === 'Matematik' || sub.subject === 'Fen Bilimleri' || sub.subject === 'Türkçe' ? 20 : 10;
                            const pct = Math.min(100, Math.max(0, (sub.net / maxQ) * 100)).toFixed(0);
                            return (
                              <tr key={sub.subject} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <td style={{ padding: '8px 10px', fontWeight: 700 }}>{sub.subject}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>{maxQ}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>{sub.correct}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#f87171', fontWeight: 700 }}>{sub.incorrect}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8' }}>{sub.blank}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#818cf8', fontWeight: 800 }}>{sub.net.toFixed(2)}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>%{pct}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        )}
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>{log.correct} Doğru</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>{log.incorrect} Yanlış</span>
                      {log.blank > 0 && <span style={{ color: 'var(--text-muted)' }}>{log.blank} Boş</span>}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>• {log.logDate}</span>
                      <button
                        onClick={() => {
                          if (window.confirm('Bu çalışma kaydını ve fotoğraflarını silmek istediğinize emin misiniz?')) {
                            deleteStudyLog(log.id);
                          }
                        }}
                        className="btn btn-danger btn-sm"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          gap: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'rgba(239, 68, 68, 0.15)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                        title="Bu Çalışma ve Fotoğraflarını Sil"
                      >
                        <Trash2 size={13} color="#fca5a5" />
                        <span style={{ color: '#fca5a5' }}>Sil</span>
                      </button>
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
      {/* DETAYLI DENEME SINAVI KARNE & ANALİZ MODALI */}
      {selectedExamForModal && (() => {
        const exam = selectedExamForModal;
        const totalD = exam.subjects.reduce((a, s) => a + (Number(s.correct) || 0), 0);
        const totalY = exam.subjects.reduce((a, s) => a + (Number(s.incorrect) || 0), 0);
        const totalB = exam.subjects.reduce((a, s) => a + (Number(s.blank) || 0), 0);
        const lostNet = (totalY / 3).toFixed(2);
        const successRate = Math.min(100, Math.max(0, (exam.totalNet / 90) * 100)).toFixed(1);

        // Find best and lowest subject by net percentage
        const sortedByNet = [...exam.subjects].sort((a, b) => {
          const maxA = a.subject === 'Matematik' || a.subject === 'Fen Bilimleri' || a.subject === 'Türkçe' ? 20 : 10;
          const maxB = b.subject === 'Matematik' || b.subject === 'Fen Bilimleri' || b.subject === 'Türkçe' ? 20 : 10;
          return (b.net / maxB) - (a.net / maxA);
        });
        const bestSubject = sortedByNet[0];
        const lowestSubject = sortedByNet[sortedByNet.length - 1];

        return (
          <div
            onClick={() => setSelectedExamForModal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '750px',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: '24px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={22} color="#818cf8" />
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{exam.examName}</h2>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Sınav Tarihi: <strong>{exam.examDate}</strong> • Öğrenci: <strong>{studentName}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExamForModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
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

              {/* 4 Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>TOPLAM NET</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{exam.totalNet.toFixed(2)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: '2px' }}>/ 90 Soru (%{successRate})</div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6ee7b7', fontWeight: 700 }}>TOPLAM DOĞRU</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399' }}>{totalD}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Kazanılan netler</div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 700 }}>TOPLAM YANLIŞ</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f87171' }}>{totalY}</div>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '2px' }}>-{lostNet} Net kaybettirdi</div>
                </div>

                <div style={{ background: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.2)', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>TOPLAM BOŞ</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#cbd5e1' }}>{totalB}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Cevaplanmadı</div>
                </div>
              </div>

              {/* Complete Table of All 6 Subjects */}
              <div style={{ marginBottom: '22px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', borderRadius: '8px 0 0 8px' }}>Ders Adı</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Soru</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#34d399' }}>Doğru</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#f87171' }}>Yanlış</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8' }}>Boş</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#818cf8', fontWeight: 800 }}>Net</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>Başarı (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.subjects.map((sub, idx) => {
                      const maxQ = sub.subject === 'Matematik' || sub.subject === 'Fen Bilimleri' || sub.subject === 'Türkçe' ? 20 : 10;
                      const pct = Math.min(100, Math.max(0, (sub.net / maxQ) * 100)).toFixed(0);
                      const subColor =
                        sub.subject === 'Matematik'
                          ? '#818cf8'
                          : sub.subject === 'Fen Bilimleri'
                          ? '#34d399'
                          : sub.subject === 'Türkçe'
                          ? '#f472b6'
                          : '#fcd34d';

                      return (
                        <tr
                          key={sub.subject}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: subColor }}>
                            {sub.subject}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {maxQ}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>
                            {sub.correct}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#f87171', fontWeight: 700 }}>
                            {sub.incorrect}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#94a3b8' }}>
                            {sub.blank}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#818cf8', fontWeight: 900, fontSize: '0.95rem' }}>
                            {sub.net.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <div style={{ width: '50px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: subColor }} />
                              </div>
                              <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.8rem', minWidth: '35px' }}>%{pct}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mentör Çıkarımları & Analiz Kutusu */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} />
                  <span>Mentör Değerlendirmesi & Stratejik Çıkarımlar</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#6ee7b7', fontWeight: 700 }}>🌟 En Güçlü Ders: </span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{bestSubject?.subject} ({bestSubject?.net.toFixed(2)} Net)</span>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#fca5a5', fontWeight: 700 }}>⚠️ Dikkat Edilmesi Gereken: </span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{lowestSubject?.subject} ({lowestSubject?.net.toFixed(2)} Net)</span>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#fcd34d', fontWeight: 700 }}>📉 Net Kaybı Analizi: </span>
                    <span style={{ color: '#fff' }}>{totalY} yanlış cevap <strong>{lostNet} net</strong> düşürdü.</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (window.confirm(`"${exam.examName}" deneme sonucunu silmek istediğinize emin misiniz?`)) {
                      deleteExam(exam.id);
                      setSelectedExamForModal(null);
                    }
                  }}
                  className="btn btn-danger"
                  style={{
                    padding: '9px 18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <Trash2 size={16} />
                  <span>Denemeyi Sil</span>
                </button>

                <button
                  onClick={() => setSelectedExamForModal(null)}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
