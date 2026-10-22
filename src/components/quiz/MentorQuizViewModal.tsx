import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { TaskItem } from '../../types';

interface MentorQuizViewModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
}

export const MentorQuizViewModal: React.FC<MentorQuizViewModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const questions = task.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const hasStudentSolved = task.isCompleted && !!task.quizResult;

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
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {task.title}
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: hasStudentSolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: hasStudentSolved ? '#34d399' : '#f59e0b',
                  fontWeight: 700,
                }}
              >
                {hasStudentSolved ? 'Öğrenci Çözdü' : 'Henüz Çözülmedi'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span>{task.subject}</span>
              <span>•</span>
              <span>{task.topicName}</span>
              <span>•</span>
              <span>{questions.length} Soru</span>
              {hasStudentSolved && task.quizResult && (
                <>
                  <span>•</span>
                  <span style={{ color: '#34d399', fontWeight: 800 }}>
                    🎯 Başarı: %{task.quizResult.scorePercent} ({task.quizResult.correct} Doğru, {task.quizResult.incorrect} Yanlış, {task.quizResult.blank} Boş)
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
          padding: '10px 24px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          overflowX: 'auto',
        }}
      >
        {questions.map((q, idx) => {
          const isSelected = idx === currentIndex;
          const isCorrect = hasStudentSolved && q.correctOption && q.studentAnswer === q.correctOption;
          const isWrong = hasStudentSolved && q.studentAnswer && q.studentAnswer !== q.correctOption;

          let bg = 'rgba(255, 255, 255, 0.05)';
          let border = '1px solid rgba(255, 255, 255, 0.1)';
          let textColor = 'var(--text-secondary)';

          if (hasStudentSolved) {
            if (isCorrect) {
              bg = 'rgba(16, 185, 129, 0.2)';
              border = '1px solid #10b981';
              textColor = '#34d399';
            } else if (isWrong) {
              bg = 'rgba(239, 68, 68, 0.2)';
              border = '1px solid #ef4444';
              textColor = '#f87171';
            }
          } else if (isSelected) {
            bg = 'linear-gradient(135deg, #6366f1, #4f46e5)';
            border = '1px solid #818cf8';
            textColor = '#fff';
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
                boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          maxWidth: '850px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div className="glass-panel" style={{ padding: '24px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                Soru {currentIndex + 1} / {questions.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Doğru Cevap: <strong style={{ color: '#34d399' }}>{currentQ.correctOption || 'Belirtilmedi'}</strong>
              </span>
            </div>

            {hasStudentSolved && (
              <div>
                {currentQ.studentAnswer ? (
                  currentQ.studentAnswer === currentQ.correctOption ? (
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
                      <CheckCircle2 size={16} /> Öğrenci Doğru Yaptı ({currentQ.studentAnswer})
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
                      <XCircle size={16} /> Öğrenci "{currentQ.studentAnswer}" İşaretledi
                    </span>
                  )
                ) : (
                  <span
                    style={{
                      background: 'rgba(148, 163, 184, 0.15)',
                      color: 'var(--text-muted)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    Boş Bıraktı
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Question Image */}
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
                  maxHeight: '400px',
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
                marginBottom: '20px',
                whiteSpace: 'pre-wrap',
                fontWeight: 500,
              }}
            >
              {currentQ.text}
            </div>
          )}

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const optText = currentQ.options[optKey];
              const isCorrectAnswer = currentQ.correctOption === optKey;
              const isStudentSelected = currentQ.studentAnswer === optKey;

              let cardBg = 'rgba(15, 23, 42, 0.6)';
              let border = '1px solid rgba(255, 255, 255, 0.1)';
              let circleBg = 'rgba(255, 255, 255, 0.08)';
              let circleColor = 'var(--text-secondary)';

              if (isCorrectAnswer) {
                cardBg = 'rgba(16, 185, 129, 0.15)';
                border = '2px solid #10b981';
                circleBg = '#10b981';
                circleColor = '#fff';
              } else if (isStudentSelected && !isCorrectAnswer) {
                cardBg = 'rgba(239, 68, 68, 0.15)';
                border = '2px solid #ef4444';
                circleBg = '#ef4444';
                circleColor = '#fff';
              }

              return (
                <div
                  key={optKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: cardBg,
                    border,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: circleBg,
                      color: circleColor,
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {optKey}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: isCorrectAnswer ? '#fff' : 'var(--text-primary)' }}>
                    {optText || `${optKey} Şıkkı`}
                  </div>
                  {isCorrectAnswer && (
                    <div style={{ marginLeft: 'auto', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Doğru Cevap
                    </div>
                  )}
                  {isStudentSelected && !isCorrectAnswer && (
                    <div style={{ marginLeft: 'auto', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <XCircle size={16} /> Öğrencinin Yanıtı
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation / Mentor Note */}
          {currentQ.explanation && (
            <div
              style={{
                marginTop: '18px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
                💡 Soru Çözüm / İpucu Notu:
              </div>
              <div style={{ fontSize: '0.88rem', color: '#fef3c7' }}>
                {currentQ.explanation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
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
          <ChevronLeft size={18} /> Önceki Soru
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1}
          className="btn btn-primary"
          style={{ opacity: currentIndex === questions.length - 1 ? 0.4 : 1, gap: '6px' }}
        >
          Sonraki Soru <ChevronRight size={18} />
        </button>
      </div>

      {/* Lightbox */}
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
