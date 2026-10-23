import React, { useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Archive,
  Send,
  Plus,
  X,
  ExternalLink,
  ZoomIn,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRICULUM_TOPICS } from '../../data/curriculum';
import { compressImage } from '../../utils/imageCompressor';
import type { QuestionItem, SubjectName } from '../../types';

export const StudentQuestions: React.FC = () => {
  const { questions, addQuestion, resolveQuestion, reopenQuestion } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'answered' | 'archive'>('pending');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [reopenNote, setReopenNote] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  // New Question Form state
  const [newSubject, setNewSubject] = useState<SubjectName>('Matematik');
  const [newTopicId, setNewTopicId] = useState<string>('mat-3');
  const [newNote, setNewNote] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file, 1100, 0.72);
        if (compressed) {
          setSelectedPhotos((prev) => [...prev, compressed]);
        }
      }
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addQuestion({
      subject: newSubject,
      topicId: newTopicId,
      note: newNote,
      images: selectedPhotos,
    });

    setShowNewModal(false);
    setNewNote('');
    setSelectedPhotos([]);
    setActiveTab('pending');
  };

  // Filter questions based on active tab
  const pendingQuestions = questions.filter((q) => q.status === 'pending' || q.status === 'reopened');
  const answeredQuestions = questions.filter((q) => q.status === 'answered');
  const archiveQuestions = questions.filter((q) => q.status === 'resolved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header with "Yeni Soru Sor" button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Soru Kutusu & Arşiv</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Anlamadığın soruları mentöre gönder, çözümleri adım adım öğren.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px', gap: '8px' }}
        >
          <Camera size={18} />
          <span>Soru Fotoğrafı Gönder</span>
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.2fr',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'pending' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: activeTab === 'pending' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <HelpCircle size={15} />
          <span>Bekleyenler ({pendingQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('answered')}
          style={{
            padding: '10px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'answered' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: activeTab === 'answered' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            position: 'relative',
          }}
        >
          <CheckCircle size={15} />
          <span>Cevaplanan ({answeredQuestions.length})</span>
          {answeredQuestions.length > 0 && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                marginLeft: '2px',
              }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          style={{
            padding: '10px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'archive' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: activeTab === 'archive' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Archive size={15} />
          <span>Arşiv ({archiveQuestions.length})</span>
        </button>
      </div>

      {/* QUESTION CARDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeTab === 'pending' &&
          (pendingQuestions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Gönderilmiş bekleyen sorun yok. Takıldığın bir soru olduğunda fotoğrafını çekip gönderebilirsin!
            </div>
          ) : (
            pendingQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className="glass-panel glass-card-interactive"
                style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}
              >
                {/* Thumbnail */}
                {q.images.length > 0 ? (
                  <img
                    src={q.images[0]}
                    alt="Soru"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8',
                    }}
                  >
                    <HelpCircle size={28} />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8' }}>{q.subject}</span>
                    {q.topicName && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {q.topicName}</span>
                    )}
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: q.status === 'reopened' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: q.status === 'reopened' ? '#fca5a5' : '#fcd34d',
                        fontWeight: 700,
                      }}
                    >
                      {q.status === 'reopened' ? 'Hâlâ Anlamadım (Tekrar)' : 'Yanıt Bekleniyor'}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '380px',
                    }}
                  >
                    {q.note}
                  </p>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(q.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            ))
          ))}

        {activeTab === 'answered' &&
          (answeredQuestions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Şu an onay bekleyen cevaplanmış soru yok.
            </div>
          ) : (
            answeredQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className="glass-panel glass-card-interactive"
                style={{
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}
              >
                {q.images.length > 0 && (
                  <img
                    src={q.images[0]}
                    alt="Soru"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8' }}>{q.subject}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#6ee7b7',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Cevaplandı
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    {q.note}
                  </p>

                  {/* Show snippet of mentor answer */}
                  {q.messages.find((m) => m.senderRole === 'mentor') && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#a5b4fc',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      💬 Mentor: {q.messages.find((m) => m.senderRole === 'mentor')?.text.slice(0, 90)}...
                    </div>
                  )}
                </div>
              </div>
            ))
          ))}

        {activeTab === 'archive' &&
          (archiveQuestions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Arşivde henüz çözümlenmiş soru bulunmuyor. Soruların altına "Anladım" dediğinde burada arşivlenir.
            </div>
          ) : (
            archiveQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className="glass-panel glass-card-interactive"
                style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}
              >
                {q.images.length > 0 && (
                  <img
                    src={q.images[0]}
                    alt="Soru"
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      opacity: 0.8,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981' }}>{q.subject}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.topicName}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.72rem',
                        color: '#6ee7b7',
                        fontWeight: 700,
                      }}
                    >
                      🏆 Anlaşıldı & Arşivlendi
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {q.note}
                  </div>
                </div>
              </div>
            ))
          ))}
      </div>

      {/* QUESTION DETAIL MODAL */}
      {selectedQuestion && (
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
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              background: '#0e1526',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8' }}>
                  {selectedQuestion.subject} • {selectedQuestion.topicName || 'Genel Soru'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  Soru Detayı & Çözüm
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setShowReopenInput(false);
                }}
                className="btn btn-secondary btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Attached Photo Full View */}
            {selectedQuestion.images.length > 0 && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <a href={selectedQuestion.images[0]} target="_blank" rel="noreferrer" title="Tam boyutta aç">
                  <img
                    src={selectedQuestion.images[0]}
                    alt="Soru Fotoğrafı"
                    style={{
                      maxHeight: '260px',
                      maxWidth: '100%',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      objectFit: 'contain',
                      background: '#000',
                    }}
                  />
                </a>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  🔎 Görsele tıklayarak büyütebilirsin
                </div>
              </div>
            )}

            {/* Conversation Flow between Student & Mentor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedQuestion.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background:
                      m.senderRole === 'mentor'
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      m.senderRole === 'mentor'
                        ? '1px solid rgba(99, 102, 241, 0.35)'
                        : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                    <strong style={{ color: m.senderRole === 'mentor' ? '#fcd34d' : '#818cf8' }}>
                      {m.senderRole === 'mentor' ? '👨‍🏫 Mentor Çözümü' : '🙋‍♂️ Benim Notum'}
                    </strong>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS (Only if answered or reopened) */}
            {selectedQuestion.status === 'answered' && (
              <div>
                {!showReopenInput ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      onClick={() => {
                        resolveQuestion(selectedQuestion.id);
                        setSelectedQuestion(null);
                      }}
                      className="btn btn-success"
                      style={{ padding: '14px', fontWeight: 800 }}
                    >
                      <CheckCircle size={18} />
                      <span>Anladım! 🎉</span>
                    </button>

                    <button
                      onClick={() => setShowReopenInput(true)}
                      className="btn btn-secondary"
                      style={{ padding: '14px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                    >
                      <HelpCircle size={18} />
                      <span>Hâlâ Anlamadım 🤔</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label className="input-label" style={{ color: '#fca5a5' }}>
                      Hangi adımı anlamadığını yaz:
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={reopenNote}
                      onChange={(e) => setReopenNote(e.target.value)}
                      placeholder="Örn: 2. satırdaki formül sadeleştirmesini neden yaptık?"
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          reopenQuestion(selectedQuestion.id, reopenNote);
                          setSelectedQuestion(null);
                          setShowReopenInput(false);
                          setReopenNote('');
                        }}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                      >
                        <Send size={16} />
                        <span>Tekrar Gönder</span>
                      </button>
                      <button
                        onClick={() => setShowReopenInput(false)}
                        className="btn btn-secondary"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW QUESTION UPLOAD MODAL */}
      {showNewModal && (
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
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              background: '#0e1526',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={22} color="#818cf8" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Soru Gönder</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} className="btn btn-secondary btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion}>
              {/* Subject Select */}
              <div style={{ marginBottom: '14px' }}>
                <label className="input-label">Ders (Zorunlu)</label>
                <select
                  className="input-field"
                  value={newSubject}
                  onChange={(e) => {
                    const subj = e.target.value as SubjectName;
                    setNewSubject(subj);
                    const match = CURRICULUM_TOPICS.find((t) => t.subject === subj);
                    if (match) setNewTopicId(match.id);
                  }}
                >
                  <option value="Matematik">Matematik</option>
                  <option value="Fen Bilimleri">Fen Bilimleri</option>
                  <option value="Türkçe">Türkçe</option>
                  <option value="T.C. İnkılap Tarihi">T.C. İnkılap Tarihi</option>
                  <option value="Din Kültürü">Din Kültürü</option>
                  <option value="İngilizce">İngilizce</option>
                </select>
              </div>

              {/* Topic Select */}
              <div style={{ marginBottom: '14px' }}>
                <label className="input-label">Konu (Opsiyonel)</label>
                <select
                  className="input-field"
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value)}
                >
                  {CURRICULUM_TOPICS.filter((t) => t.subject === newSubject).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.topicName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Note */}
              <div style={{ marginBottom: '16px' }}>
                <label className="input-label">Takıldığın Yer / Soru Notun</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Örn: Soruda C ile D arasında kaldım, 3. adımdaki formülü neden uygulayamadık?"
                  required
                />
              </div>

              {/* Photo Upload Area */}
              <div style={{ marginBottom: '18px' }}>
                <label className="input-label">Soru Fotoğrafı Ekle</label>
                <div
                  style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.5)',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="camera-input"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={isCompressing}
                  />

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                    <label
                      htmlFor="camera-input"
                      className="btn btn-secondary btn-sm"
                      style={{
                        cursor: isCompressing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: isCompressing ? 0.7 : 1,
                      }}
                    >
                      {isCompressing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Fotoğraf Optimize Ediliyor...
                        </>
                      ) : (
                        <>
                          <Camera size={16} /> Fotoğraf Çek / Dosya Seç
                        </>
                      )}
                    </label>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Fotoğraflar otomatik olarak optimize edilir, hızlı ve güvenle yüklenir.
                  </p>

                  {/* Images Preview Grid */}
                  {selectedPhotos.length > 0 && (
                    <div
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {selectedPhotos.map((photo, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img
                            src={photo}
                            alt={`Seçilen Soru ${idx + 1}`}
                            style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '2px solid #818cf8',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                            }}
                            title="Fotoğrafı Kaldır"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                <Send size={18} />
                <span>Gönder</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
