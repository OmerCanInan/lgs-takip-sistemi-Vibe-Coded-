import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, HelpCircle, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudentAiCoach: React.FC<{ onNavigateToQuestions: () => void }> = ({
  onNavigateToQuestions,
}) => {
  const { chatMessages, sendChatMessage, askBrotherFromChat, isAiLoading } = useApp();
  const [inputText, setInputText] = useState('');
  const [transferredNotice, setTransferredNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Daily message count calculation (simulate 20 msgs limit)
  const todayUserMessages = chatMessages.filter((m) => m.role === 'user').length;
  const maxDailyQuota = 20;
  const remainingQuota = Math.max(0, maxDailyQuota - todayUserMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  const handleAskBrother = (content: string, topicRef?: string) => {
    askBrotherFromChat(content, topicRef);
    setTransferredNotice('Soru başarıyla Soru Kutusuna iletildi! Sorularım sekmesinden takip edebilirsin.');
    setTimeout(() => setTransferredNotice(null), 4500);
  };

  const quickPrompts = [
    '📐 EBOB ve EKOK problemlerini nasıl ayırt ederim?',
    '💧 Sıvı basıncında derinlik ve yoğunluk grafikleri',
    '📖 Paragraf çözerken süreyi yetiştiremiyorum',
    '⚡ DNA eşlenmesi basamakları ve enzimler',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)', maxHeight: '720px', paddingBottom: '70px' }}>
      {/* Header Info */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 18px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>LGS Yapay Zeka Koçu (Gemini)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Sokratik Rehber • Cevabı direkt vermez, düşündürür
            </div>
          </div>
        </div>

        {/* Quota Badge */}
        <div
          style={{
            fontSize: '0.78rem',
            padding: '4px 10px',
            borderRadius: '999px',
            background: remainingQuota <= 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: remainingQuota <= 3 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
            color: remainingQuota <= 3 ? '#fca5a5' : '#a5b4fc',
            fontWeight: 700,
          }}
        >
          Günlük Kota: {remainingQuota}/{maxDailyQuota} Soru
        </div>
      </div>

      {/* Transfer Notice Alert */}
      {transferredNotice && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{transferredNotice}</span>
          </div>
          <button
            onClick={onNavigateToQuestions}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            Görüntüle
          </button>
        </div>
      )}

      {/* Chat Messages List */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '12px',
        }}
      >
        {chatMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>
              LGS Yapay Zeka Koçuna Hoş Geldin!
            </div>
            <div style={{ fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto' }}>
              Aşağıdaki önerilerden birine tıklayarak veya aklına takılan bir soruyu yazarak sohbeti başlatabilirsin.
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              {msg.role === 'assistant' ? (
                <>
                  <Bot size={13} color="#818cf8" />
                  <span>AI Koç</span>
                </>
              ) : (
                <>
                  <span>Ben</span>
                  <User size={13} color="#cbd5e1" />
                </>
              )}
              <span>•</span>
              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: '16px',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                    : 'rgba(30, 41, 59, 0.85)',
                color: '#fff',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
              }}
            >
              {msg.content}

              {/* "Mentöre Sor" Button for Assistant Messages */}
              {msg.role === 'assistant' && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Tam anlamadın mı veya tereddüt mü var?
                  </span>
                  <button
                    onClick={() => handleAskBrother(msg.content, msg.topicRef)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      borderColor: 'rgba(245, 158, 11, 0.3)',
                      color: '#fcd34d',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                    }}
                  >
                    <HelpCircle size={14} />
                    <span>Mentöre Sor 👨‍🏫</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )))}
        {isAiLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0' }}>
            <div
              style={{
                padding: '10px 16px', borderRadius: '16px',
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 1s ease-in-out infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 1s ease-in-out infinite 0.2s' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 1s ease-in-out infinite 0.4s' }} />
              <span style={{ marginLeft: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Gemini düşünüyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '6px',
        }}
      >
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputText(prompt)}
            style={{
              whiteSpace: 'nowrap',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '999px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="LGS konusu veya takıldığın mantığı sor..."
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0 18px' }}
          disabled={!inputText.trim() || isAiLoading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
