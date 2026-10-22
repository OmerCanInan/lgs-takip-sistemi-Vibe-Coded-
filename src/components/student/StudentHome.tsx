import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Sparkles,
  Target,
  Zap,
  Image as ImageIcon,
  Play,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentQuizModal } from '../quiz/StudentQuizModal';
import type { TaskItem } from '../../types';

const MOTIVATIONAL_QUOTES = [
  {
    emoji: '🎯',
    title: 'Hedefe Bir Adım Daha Yakınsın!',
    subtitle: 'Düzenli ve odaklı çalışma seni zirveye taşır. Bugünün planına sadık kal ve hedefe odaklan!',
  },
  {
    emoji: '⚡',
    title: 'Bugün Harika Bir Başlangıç Yap!',
    subtitle: 'Zorlandığın her soru, sınavda sana artı bir net kazandıracak. Masanın başına geç ve başla!',
  },
  {
    emoji: '🔥',
    title: 'Disiplin Başarının Anahtarıdır!',
    subtitle: 'Her gün atılan küçük adımlar, büyük başarıları getirir. Seriyi bozmadan kararlılıkla devam et!',
  },
  {
    emoji: '🚀',
    title: 'Zirveye Çıkanlar Asla Vazgeçmeyenlerdir!',
    subtitle: 'LGS maratonunda her çözülen soru bir basamaktır. Şimdi sorulara odaklanma vakti!',
  },
  {
    emoji: '💪',
    title: 'Potansiyeline Güven!',
    subtitle: 'Emeklerin asla boşa gitmeyecek. Bugün masaya koyduğun gayret geleceğini şekillendiriyor.',
  },
  {
    emoji: '🧠',
    title: 'Sakin, Planlı ve Kararlı!',
    subtitle: 'Hızlı değil, sindirerek ve mantığını anlayarak çöz. Takıldığında pes etme, ipuçlarını takip et!',
  },
  {
    emoji: '🌟',
    title: 'Şampiyonlar Bugün Çalışır!',
    subtitle: 'Bugün yapacağın kaliteli tekrar ve soru çözümü, yarının sınavında en büyük güvencen olacak.',
  },
  {
    emoji: '🏆',
    title: 'Hayalindeki Liseye Doğru!',
    subtitle: 'Hedefimiz yüksek, disiplinimiz tam. Bugünün hedeflerini tamamla ve fark yarat!',
  },
];

export const StudentHome: React.FC<{ onNavigateToTab: (tab: 'home' | 'entry' | 'questions') => void }> = ({
  onNavigateToTab,
}) => {
  const {
    currentIntensity,
    tasks,
    toggleTaskCompletion,
    submitTaskQuiz,
    todaySolvedQuestions,
    todayDurationMinutes,
    todayTargetQuestions,
    streakDays,
    exams,
  } = useApp();

  const [activeQuizTask, setActiveQuizTask] = useState<TaskItem | null>(null);

  // Pick a random motivational quote on each load/entry
  const [motivation] = useState(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  });

  // Active tasks for today
  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasksCount = activeTasks.filter((t) => t.isCompleted).length;

  // LGS Countdown: Assuming LGS 2027 or target date in June
  const targetLgsDate = new Date('2027-06-06T09:30:00');
  const now = new Date();
  const diffTime = targetLgsDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((todaySolvedQuestions / Math.max(1, todayTargetQuestions)) * 100)
  );

  // Latest exam
  const latestExam = exams[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px' }}>
      {/* Welcome & Motivation Card */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>{motivation.emoji}</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {motivation.title}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px' }}>
              {motivation.subtitle}
            </p>
          </div>

          {/* LGS Countdown Badge */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              textAlign: 'center',
              minWidth: '120px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700 }}>
              <Calendar size={14} />
              <span>LGS'YE KALAN</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
              {diffDays} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc' }}>GÜN</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Streak</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fcd34d' }}>{streakDays} Gün 🔥</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son Deneme Neti</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#6ee7b7' }}>
                {latestExam ? `${latestExam.totalNet.toFixed(1)} Net` : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Target Goal Bar (Intensity Level driven) */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" fill="#f59e0b" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Bugünkü Soru Hedefi</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Günlük Hedef: <strong>{todayTargetQuestions} Soru</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: progressPercent >= 100 ? '#10b981' : '#818cf8' }}>
              {todaySolvedQuestions}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}> / {todayTargetQuestions}</span>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              %{progressPercent} Tamamlandı
            </div>
          </div>
        </div>

        {/* Progress Track */}
        <div className="progress-bar-bg" style={{ height: '10px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                : 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
            }}
          />
        </div>

        {progressPercent >= 100 ? (
          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Tebrikler! Bugünkü soru bütçeni tamamladın 🎉
          </div>
        ) : (
          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Kalan: <strong>{Math.max(0, todayTargetQuestions - todaySolvedQuestions)} Soru</strong></span>
            <button
              onClick={() => onNavigateToTab('entry')}
              style={{
                background: 'none',
                border: 'none',
                color: '#818cf8',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              + Soru Girişi Yap →
            </button>
          </div>
        )}
      </div>

      {/* Today's Tasks Section */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Günün Görevleri</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completedTasksCount} / {activeTasks.length} görev tamamlandı
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-mentor">👨‍🏫 Mentor</span>
            <span className="badge badge-ai">🤖 AI Plan</span>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              Bugün için atanmış aktif görev yok. Veri gir sekmesinden serbest çalışma başlatabilirsin!
            </div>
          ) : (
            activeTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  if (task.questions && task.questions.length > 0) {
                    setActiveQuizTask(task);
                  } else {
                    toggleTaskCompletion(task.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: task.isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.7)',
                  border: task.isCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Checkbox Icon */}
                <div style={{ marginTop: '2px', color: task.isCompleted ? '#10b981' : 'var(--text-muted)' }}>
                  {task.isCompleted ? <CheckCircle2 size={22} fill="#10b981" color="#090d16" /> : <Circle size={22} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: task.subject === 'Matematik' ? '#818cf8' : task.subject === 'Fen Bilimleri' ? '#34d399' : '#f472b6',
                      }}
                    >
                      {task.subject}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                    <span
                      className={`badge ${task.source === 'mentor' ? 'badge-mentor' : 'badge-ai'}`}
                      style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                    >
                      {task.source === 'mentor' ? 'Mentor Görevi' : 'AI Rotası'}
                    </span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      🎯 {task.targetCount} Soru
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </div>

                  {task.quizResult && (
                    <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                      🎯 Başarı: %{task.quizResult.scorePercent} ({task.quizResult.correct}/{task.questions?.length || 0} Doğru)
                    </div>
                  )}

                  {task.mentorNote && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.78rem',
                        color: '#fcd34d',
                        background: 'rgba(245, 158, 11, 0.08)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      💬 Mentor Notu: {task.mentorNote}
                    </div>
                  )}

                  {/* Quiz action button for student */}
                  {task.questions && task.questions.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {!task.isCompleted ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveQuizTask(task);
                          }}
                          className="btn btn-sm"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 14px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Play size={13} fill="#fff" />
                          <span>Soruları Çöz ({task.questions.length} Soru)</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveQuizTask(task);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#34d399',
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            padding: '4px 12px',
                            fontSize: '0.76rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <BookOpen size={13} />
                          <span>Çözümleri İncele</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <button
          onClick={() => onNavigateToTab('entry')}
          className="glass-panel glass-card-interactive"
          style={{
            padding: '16px',
            textAlign: 'left',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: 'none',
          }}
        >
          <div style={{ color: '#818cf8', marginBottom: '8px' }}>
            <BookOpen size={24} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Veri Gir</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Çözdüğün soruları kaydet</div>
        </button>

        <button
          onClick={() => onNavigateToTab('questions')}
          className="glass-panel glass-card-interactive"
          style={{
            padding: '16px',
            textAlign: 'left',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: 'none',
          }}
        >
          <div style={{ color: '#f59e0b', marginBottom: '8px' }}>
            <Sparkles size={24} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Soru Sor</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fotoğraf çek gönder</div>
        </button>
      </div>

      {/* QUIZ SOLVING MODAL */}
      {activeQuizTask && (
        <StudentQuizModal
          task={activeQuizTask}
          isOpen={!!activeQuizTask}
          onClose={() => setActiveQuizTask(null)}
          onSubmit={(answers) => {
            submitTaskQuiz(activeQuizTask.id, answers);
            setActiveQuizTask(null);
          }}
        />
      )}
    </div>
  );
};
