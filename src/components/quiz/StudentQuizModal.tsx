import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  Maximize2,
  Clock,
} from 'lucide-react';
import type { TaskItem } from '../../types';

interface StudentQuizModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => void;
}

export const StudentQuizModal: React.FC<StudentQuizModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const questions = task.questions || [];
  const isCompleted = task.isCompleted;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>(() => {
    // If already completed, load student answers
    const initial: Record<string, 'A' | 'B' | 'C' | 'D'> = {};
    questions.forEach((q) => {
      if (q.studentAnswer) {
        initial[q.id] = q.studentAnswer;
      }
    });
    return initial;
  });
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (isCompleted) return; // Read-only if completed
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: prev[currentQ.id] === optionKey ? undefined! : optionKey,
    }));
  };

  const handleFinalSubmit = () => {
    onSubmit(answers);
    setShowConfirmSubmit(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(5, 10, 24, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {task.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>{task.subject}</span>
              <span>•</span>
              <span>{questions.length} Soru</span>
              {isCompleted && task.quizResult && (
                <>
                  <span>•</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    Sonuç: {task.quizResult.correct}D {task.quizResult.incorrect}Y (%{task.quizResult.scorePercent})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Question Selector Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          overflowX: 'auto',
        }}
      >
        {questions.map((q, idx) => {
          const isSelected = idx === currentIndex;
          const isAnswered = !!answers[q.id];
          const isCorrect = isCompleted && q.correctOption && q.studentAnswer === q.correctOption;
          const isWrong = isCompleted && q.correctOption && q.studentAnswer && q.studentAnswer !== q.correctOption;

          let bg = 'rgba(255, 255, 255, 0.05)';
          let border = '1px solid rgba(255, 255, 255, 0.1)';
          let textColor = 'var(--text-secondary)';

          if (isCompleted) {
            if (isCorrect) {
              bg = 'rgba(16, 185, 129, 0.2)';
              border = '1px solid #10b981';
              textColor = '#34d399';
            } else if (isWrong) {
              bg = 'rgba(239, 68, 68, 0.2)';
              border = '1px solid #ef4444';
              textColor = '#f87171';
            } else {
              bg = 'rgba(148, 163, 184, 0.1)';
              textColor = 'var(--text-muted)';
            }
          } else {
            if (isSelected) {
              bg = 'linear-gradient(135deg, #6366f1, #4f46e5)';
              border = '1px solid #818cf8';
              textColor = '#fff';
            } else if (isAnswered) {
              bg = 'rgba(99, 102, 241, 0.2)';
              border = '1px solid rgba(99, 102, 241, 0.5)';
              textColor = '#a5b4fc';
            }
          }

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                minWidth: '38px',
                height: '38px',
                borderRadius: '8px',
                background: bg,
                border,
                color: textColor,
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
              }}
            >
              {idx + 1}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {answeredCount}/{questions.length} Yanıtlandı
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          maxWidth: '850px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
          {/* Question Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                Soru {currentIndex + 1}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {task.topicName}
              </span>
            </div>

            {isCompleted && currentQ.correctOption && (
              <div>
                {currentQ.studentAnswer === currentQ.correctOption ? (
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={16} /> Doğru Çözdün!
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <XCircle size={16} /> Yanlış (Doğru Cevap: {currentQ.correctOption})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Question Image (if any) */}
          {currentQ.imageUrl && (
            <div
              style={{
                marginBottom: '20px',
                textAlign: 'center',
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <img
                src={currentQ.imageUrl}
                alt={`Soru ${currentIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '420px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  cursor: 'zoom-in',
                }}
                onClick={() => setLightboxImg(currentQ.imageUrl || null)}
              />
              <button
                onClick={() => setLightboxImg(currentQ.imageUrl || null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <Maximize2 size={14} /> Büyüt
              </button>
            </div>
          )}

          {/* Question Text */}
          {currentQ.text && (
            <div
              style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#f1f5f9',
                marginBottom: '24px',
                whiteSpace: 'pre-wrap',
                fontWeight: 500,
              }}
            >
              {currentQ.text}
            </div>
          )}

          {/* Options A, B, C, D */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const optText = currentQ.options[optKey];
              const isSelected = answers[currentQ.id] === optKey;
              const isCorrectAnswer = isCompleted && currentQ.correctOption === optKey;
              const isWrongSelection = isCompleted && isSelected && currentQ.correctOption !== optKey;

              let cardBg = 'rgba(15, 23, 42, 0.6)';
              let border = '1px solid rgba(255, 255, 255, 0.1)';
              let circleBg = 'rgba(255, 255, 255, 0.08)';
              let circleColor = 'var(--text-secondary)';

              if (isCompleted) {
                if (isCorrectAnswer) {
                  cardBg = 'rgba(16, 185, 129, 0.15)';
                  border = '2px solid #10b981';
                  circleBg = '#10b981';
                  circleColor = '#fff';
                } else if (isWrongSelection) {
                  cardBg = 'rgba(239, 68, 68, 0.15)';
                  border = '2px solid #ef4444';
                  circleBg = '#ef4444';
                  circleColor = '#fff';
                }
              } else {
                if (isSelected) {
                  cardBg = 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)';
                  border = '2px solid #818cf8';
                  circleBg = '#6366f1';
                  circleColor = '#fff';
                }
              }

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  disabled={isCompleted}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: cardBg,
                    border,
                    cursor: isCompleted ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: circleBg,
                      color: circleColor,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {optKey}
                  </div>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      color: isSelected || isCorrectAnswer ? '#fff' : 'var(--text-primary)',
                      fontWeight: isSelected || isCorrectAnswer ? 600 : 400,
                    }}
                  >
                    {optText || `${optKey} Şıkkı`}
                  </div>
                  {isCorrectAnswer && (
                    <div style={{ marginLeft: 'auto', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <CheckCircle2 size={18} /> Doğru Cevap
                    </div>
                  )}
                  {isWrongSelection && (
                    <div style={{ marginLeft: 'auto', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <XCircle size={18} /> Senin Cevabın
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if Completed */}
          {isCompleted && currentQ.explanation && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
                💡 Mentor Çözüm Notu / İpucu:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#fef3c7', lineHeight: 1.5 }}>
                {currentQ.explanation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.95)',
        }}
      >
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentIndex === 0 ? 0.4 : 1, gap: '6px' }}
        >
          <ChevronLeft size={18} /> Önceki
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isCompleted && (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderColor: '#10b981',
                gap: '8px',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} />
              <span>Testi Bitir & Gönder</span>
            </button>
          )}

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="btn btn-primary"
              style={{ gap: '6px' }}
            >
              Sonraki <ChevronRight size={18} />
            </button>
          ) : isCompleted ? (
            <button onClick={onClose} className="btn btn-primary">
              Kapat
            </button>
          ) : null}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              textAlign: 'center',
              background: '#0f172a',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Award size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              Testi Tamamlamak Üzeresin!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              {questions.length} sorudan <strong>{answeredCount}</strong> tanesini işaretledin.
              {answeredCount < questions.length && (
                <span style={{ display: 'block', color: '#f59e0b', marginTop: '6px' }}>
                  ⚠️ {questions.length - answeredCount} soru boş bırakıldı.
                </span>
              )}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Geri Dön
              </button>
              <button
                onClick={handleFinalSubmit}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderColor: '#10b981',
                }}
              >
                Evet, Gönder!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxImg}
            alt="Büyük Görsel"
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      )}
    </div>
  );
};
