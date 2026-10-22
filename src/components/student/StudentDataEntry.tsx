import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
} from 'lucide-react';
import { CURRICULUM_TOPICS } from '../../data/curriculum';
import { useApp } from '../../context/AppContext';
import type { ExamSubjectResult, SubjectName } from '../../types';

// Client-side image compression to prevent huge base64 strings and quota errors
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const StudentDataEntry: React.FC = () => {
  const { addStudyLog, addExamResult } = useApp();
  const [activeTab, setActiveTab] = useState<'study' | 'exam'>('study');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form states - Daily Study
  const [subject, setSubject] = useState<SubjectName>('Matematik');
  const [topicId, setTopicId] = useState<string>('mat-1');
  const [correct, setCorrect] = useState<number | ''>('');
  const [incorrect, setIncorrect] = useState<number | ''>('');
  const [blank, setBlank] = useState<number | ''>('');
  const [studyImages, setStudyImages] = useState<string[]>([]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        setStudyImages((prev) => [...prev, compressed]);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setStudyImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setStudyImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Filter topics based on selected subject
  const availableTopics = CURRICULUM_TOPICS.filter((t) => t.subject === subject);

  // Update topicId when subject changes
  const handleSubjectChange = (newSubject: SubjectName) => {
    setSubject(newSubject);
    const firstTopic = CURRICULUM_TOPICS.find((t) => t.subject === newSubject);
    if (firstTopic) {
      setTopicId(firstTopic.id);
    }
  };

  // Calculated net for single log
  const numCorrect = Number(correct) || 0;
  const numIncorrect = Number(incorrect) || 0;
  const numBlank = Number(blank) || 0;
  const calculatedNet = Math.max(0, numCorrect - numIncorrect / 3).toFixed(2);
  const totalDailyQuestions = numCorrect + numIncorrect + numBlank;

  const handleStudySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTopic = CURRICULUM_TOPICS.find((t) => t.id === topicId);
    if (!selectedTopic) return;

    const c = Number(correct) || 0;
    const inc = Number(incorrect) || 0;
    const b = Number(blank) || 0;

    if (c + inc + b === 0 && studyImages.length === 0) {
      return;
    }

    addStudyLog({
      subject,
      topicId,
      topicName: selectedTopic.topicName,
      correct: c,
      incorrect: inc,
      blank: b,
      durationMinutes: 0,
      logDate: new Date().toISOString().split('T')[0],
      images: studyImages.length > 0 ? studyImages : undefined,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    setSaveSuccessMsg(`Tebrikler! ${c + inc + b} soru${studyImages.length > 0 ? ` ve ${studyImages.length} fotoğraf` : ''} kaydedildi.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);

    // Reset values to blank so user cannot repeatedly submit the exact same entry
    setCorrect('');
    setIncorrect('');
    setBlank('');
    setStudyImages([]);
  };

  // Exam Entry State
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examSubjects, setExamSubjects] = useState<{
    subject: SubjectName;
    correct: number | '';
    incorrect: number | '';
    blank: number | '';
  }[]>([
    { subject: 'Türkçe', correct: '', incorrect: '', blank: '' },
    { subject: 'Matematik', correct: '', incorrect: '', blank: '' },
    { subject: 'Fen Bilimleri', correct: '', incorrect: '', blank: '' },
    { subject: 'T.C. İnkılap Tarihi', correct: '', incorrect: '', blank: '' },
    { subject: 'Din Kültürü', correct: '', incorrect: '', blank: '' },
    { subject: 'İngilizce', correct: '', incorrect: '', blank: '' },
  ]);

  const updateExamRow = (
    index: number,
    field: 'correct' | 'incorrect' | 'blank',
    val: string
  ) => {
    setExamSubjects((prev) => {
      const next = [...prev];
      const row = next[index];
      const maxSubjectQuestions =
        row.subject === 'Matematik' || row.subject === 'Fen Bilimleri' || row.subject === 'Türkçe'
          ? 20
          : 10;

      if (val === '') {
        next[index] = { ...row, [field]: '' };
        return next;
      }

      const inputNum = Math.max(0, parseInt(val, 10) || 0);

      // Current values of the other two fields
      const currentC = field === 'correct' ? 0 : Number(row.correct) || 0;
      const currentInc = field === 'incorrect' ? 0 : Number(row.incorrect) || 0;
      const currentB = field === 'blank' ? 0 : Number(row.blank) || 0;
      const otherSum = currentC + currentInc + currentB;

      // Cap so that (field + otherSum) <= maxSubjectQuestions
      const capped = Math.min(inputNum, Math.max(0, maxSubjectQuestions - otherSum));

      next[index] = { ...row, [field]: capped };
      return next;
    });
  };

  // Calculate total exam net
  const examSubjectResults: ExamSubjectResult[] = examSubjects.map((s) => {
    const c = Number(s.correct) || 0;
    const inc = Number(s.incorrect) || 0;
    const b = Number(s.blank) || 0;
    return {
      subject: s.subject,
      correct: c,
      incorrect: inc,
      blank: b,
      net: Math.max(0, Number((c - inc / 3).toFixed(2))),
    };
  });
  const totalExamNet = examSubjectResults.reduce((acc, s) => acc + s.net, 0);
  const totalExamQuestions = examSubjects.reduce(
    (acc, s) => acc + (Number(s.correct) || 0) + (Number(s.incorrect) || 0) + (Number(s.blank) || 0),
    0
  );

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || totalExamQuestions === 0) return;

    for (const s of examSubjects) {
      const maxQ =
        s.subject === 'Matematik' || s.subject === 'Fen Bilimleri' || s.subject === 'Türkçe'
          ? 20
          : 10;
      const c = Number(s.correct) || 0;
      const inc = Number(s.incorrect) || 0;
      const b = Number(s.blank) || 0;
      if (c + inc + b > maxQ) {
        alert(`${s.subject} dersi için toplam soru sayısı (Doğru + Yanlış + Boş) en fazla ${maxQ} olabilir!`);
        return;
      }
    }

    addExamResult({
      examName,
      examDate,
      totalNet: Number(totalExamNet.toFixed(2)),
      subjects: examSubjectResults,
    });

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {}

    setSaveSuccessMsg(`Harika! "${examName}" denemen ${totalExamNet.toFixed(2)} Net ile sisteme işlendi.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);

    // Reset values so user cannot submit repeatedly
    setExamName('');
    setExamDate(new Date().toISOString().split('T')[0]);
    setExamSubjects([
      { subject: 'Türkçe', correct: '', incorrect: '', blank: '' },
      { subject: 'Matematik', correct: '', incorrect: '', blank: '' },
      { subject: 'Fen Bilimleri', correct: '', incorrect: '', blank: '' },
      { subject: 'T.C. İnkılap Tarihi', correct: '', incorrect: '', blank: '' },
      { subject: 'Din Kültürü', correct: '', incorrect: '', blank: '' },
      { subject: 'İngilizce', correct: '', incorrect: '', blank: '' },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px' }}>
      {/* Tab Switcher */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setActiveTab('study')}
          style={{
            padding: '10px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'study' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: activeTab === 'study' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <BookOpen size={16} />
          <span>Günlük Soru</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          style={{
            padding: '10px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'exam' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
            color: activeTab === 'exam' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Deneme Sınavı</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle size={20} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: DAILY STUDY LOG ENTRY */}
      {activeTab === 'study' && (
        <form onSubmit={handleStudySubmit} className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Günlük Çalışma Girişi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Çözdüğün soruları girerek günlük hedefini ve serini büyüt.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Subject Select */}
            <div>
              <label className="input-label">Ders Seçimi</label>
              <select
                className="input-field"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectName)}
              >
                <option value="Matematik">Matematik</option>
                <option value="Fen Bilimleri">Fen Bilimleri</option>
                <option value="Türkçe">Türkçe</option>
                <option value="T.C. İnkılap Tarihi">T.C. İnkılap Tarihi</option>
                <option value="Din Kültürü">Din Kültürü</option>
                <option value="İngilizce">İngilizce</option>
              </select>
            </div>

            {/* Topic Select (MEB Curriculum Topics) */}
            <div>
              <label className="input-label">Müfredat Konusu (Kazanım)</label>
              <select
                className="input-field"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                {availableTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.topicName} ({t.kazanimKodu})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Correct / Incorrect / Blank */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label className="input-label" style={{ color: '#6ee7b7' }}>Doğru</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={correct}
                onChange={(e) => setCorrect(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder=""
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', fontWeight: 700 }}
              />
            </div>
            <div>
              <label className="input-label" style={{ color: '#fca5a5' }}>Yanlış</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={incorrect}
                onChange={(e) => setIncorrect(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder=""
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 700 }}
              />
            </div>
            <div>
              <label className="input-label" style={{ color: '#cbd5e1' }}>Boş</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={blank}
                onChange={(e) => setBlank(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                placeholder=""
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Camera size={16} color="#818cf8" />
                <span>Çalışma & Soru Fotoğrafları (Opsiyonel)</span>
              </label>
              {studyImages.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  ✓ {studyImages.length} Fotoğraf Eklendi
                </span>
              )}
            </div>

            {/* Thumbnail previews */}
            {studyImages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '10px',
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {studyImages.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '74px',
                      height: '74px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Fotoğraf ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        border: 'none',
                        color: '#fff',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                border: '1px dashed rgba(99, 102, 241, 0.4)',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.05)',
                color: '#a5b4fc',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Upload size={18} />
              <span>Fotoğraf Çek veya Galeriden Seç</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {/* Live Net Calculation Preview */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hesaplanan Net (3 Yanlış 1 Doğruyu Götürür)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#818cf8' }}>
                {calculatedNet} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Net</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Toplam: <strong>{(Number(correct) || 0) + (Number(incorrect) || 0) + (Number(blank) || 0)} Soru</strong>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              opacity: totalDailyQuestions === 0 && studyImages.length === 0 ? 0.6 : 1,
              cursor: totalDailyQuestions === 0 && studyImages.length === 0 ? 'not-allowed' : 'pointer',
            }}
            disabled={totalDailyQuestions === 0 && studyImages.length === 0}
          >
            <PlusCircle size={20} />
            <span>Çalışmayı Kaydet</span>
          </button>
        </form>
      )}

      {/* TAB 2: EXAM RESULTS ENTRY */}
      {activeTab === 'exam' && (
        <form onSubmit={handleExamSubmit} className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>LGS Deneme Sınavı Girişi</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Her dersin Doğru/Yanlış sayılarını gir, toplam net anında hesaplansın.
                </p>
              </div>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>TOPLAM NET</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                  {totalExamNet.toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>/ 90</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label className="input-label">Deneme Adı / Yayın</label>
              <input
                type="text"
                className="input-field"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Örn: TÖDER LGS-2, Özdebir, Nartest"
                required
              />
            </div>
            <div>
              <label className="input-label">Sınav Tarihi</label>
              <input
                type="date"
                className="input-field"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Column Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
              gap: '8px',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '4px',
            }}
          >
            <div style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>DERS</div>
            <div style={{ color: '#34d399' }}>DOĞRU (D)</div>
            <div style={{ color: '#f87171' }}>YANLIŞ (Y)</div>
            <div style={{ color: '#94a3b8' }}>BOŞ (B)</div>
            <div style={{ color: '#818cf8', textAlign: 'right' }}>NET</div>
          </div>

          {/* Subject Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {examSubjects.map((row, index) => {
              const maxQ =
                row.subject === 'Matematik' || row.subject === 'Fen Bilimleri' || row.subject === 'Türkçe'
                  ? 20
                  : 10;
              const numCorrect = Number(row.correct) || 0;
              const numIncorrect = Number(row.incorrect) || 0;
              const numBlank = Number(row.blank) || 0;
              const totalRowQuestions = numCorrect + numIncorrect + numBlank;
              const rowNet = Math.max(0, numCorrect - numIncorrect / 3).toFixed(2);

              const maxAllowedCorrect = Math.max(0, maxQ - (numIncorrect + numBlank));
              const maxAllowedIncorrect = Math.max(0, maxQ - (numCorrect + numBlank));
              const maxAllowedBlank = Math.max(0, maxQ - (numCorrect + numIncorrect));

              return (
                <div
                  key={row.subject}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{row.subject}</div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color:
                          totalRowQuestions === maxQ
                            ? '#6ee7b7'
                            : totalRowQuestions > 0
                            ? '#a5b4fc'
                            : 'var(--text-muted)',
                      }}
                    >
                      {totalRowQuestions}/{maxQ} Soru
                    </div>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      max={maxAllowedCorrect}
                      className="input-field"
                      style={{ padding: '6px 8px', fontSize: '0.85rem', textAlign: 'center', borderColor: 'rgba(52, 211, 153, 0.4)', fontWeight: 700 }}
                      value={row.correct}
                      onChange={(e) => updateExamRow(index, 'correct', e.target.value)}
                      placeholder="D"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      max={maxAllowedIncorrect}
                      className="input-field"
                      style={{ padding: '6px 8px', fontSize: '0.85rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 700 }}
                      value={row.incorrect}
                      onChange={(e) => updateExamRow(index, 'incorrect', e.target.value)}
                      placeholder="Y"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      max={maxAllowedBlank}
                      className="input-field"
                      style={{ padding: '6px 8px', fontSize: '0.85rem', textAlign: 'center', borderColor: 'rgba(148, 163, 184, 0.3)' }}
                      value={row.blank}
                      onChange={(e) => updateExamRow(index, 'blank', e.target.value)}
                      placeholder="B"
                    />
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 800, color: '#818cf8', fontSize: '0.9rem' }}>
                    {rowNet} Net
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              opacity: !examName.trim() || totalExamQuestions === 0 ? 0.6 : 1,
              cursor: !examName.trim() || totalExamQuestions === 0 ? 'not-allowed' : 'pointer',
            }}
            disabled={!examName.trim() || totalExamQuestions === 0}
          >
            <FileSpreadsheet size={20} />
            <span>Deneme Sonucunu Kaydet</span>
          </button>
        </form>
      )}
    </div>
  );
};

