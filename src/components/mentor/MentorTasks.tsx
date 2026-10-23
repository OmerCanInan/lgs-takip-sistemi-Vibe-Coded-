import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Trash2,
  PlusCircle,
  Sparkles,
  Bot,
  UserCheck,
  Clock,
  Calendar,
  Image as ImageIcon,
  Upload,
  ListPlus,
  Eye,
  Layers,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRICULUM_TOPICS } from '../../data/curriculum';
import { MentorQuizViewModal } from '../quiz/MentorQuizViewModal';
import { MentorJsonTaskModal } from './MentorJsonTaskModal';
import { compressImage } from '../../utils/imageCompressor';
import type { SubjectName, TaskItem, TaskQuestion } from '../../types';

interface MentorTasksProps {
  prefilledTopic?: { topicId: string; subject: SubjectName; topicName: string } | null;
  onClearPrefilledTopic?: () => void;
}

const createEmptyQuestion = (num: number): TaskQuestion => ({
  id: `q-${Date.now()}-${num}`,
  questionNumber: num,
  text: '',
  imageUrl: '',
  options: { A: '', B: '', C: '', D: '' },
  correctOption: 'A',
  explanation: '',
});

export const MentorTasks: React.FC<MentorTasksProps> = ({
  prefilledTopic,
  onClearPrefilledTopic,
}) => {
  const {
    tasks,
    addMentorTask,
    approveDraftTask,
    deleteDraftTask,
    deleteTask,
    approveAllDraftTasks,
    generateAiWeeklyPlan,
    isPlanLoading,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(!!prefilledTopic);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [createMode, setCreateMode] = useState<'target' | 'quiz'>('quiz'); // Default to quiz as user asked for it
  const [taskTitle, setTaskTitle] = useState(
    prefilledTopic ? `${prefilledTopic.topicName} Pekiştirme Testi` : 'LGS Yeni Nesil Soru Paketi'
  );
  const [taskSubject, setTaskSubject] = useState<SubjectName>(
    prefilledTopic ? prefilledTopic.subject : 'Matematik'
  );
  const [taskTopicId, setTaskTopicId] = useState<string>(
    prefilledTopic ? prefilledTopic.topicId : 'mat-1'
  );
  const [taskTargetCount, setTaskTargetCount] = useState<number>(25);
  const [taskDate, setTaskDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [mentorNote, setMentorNote] = useState<string>('');

  // Quiz Questions State (allowing 5-10 or more questions)
  const [quizQuestions, setQuizQuestions] = useState<TaskQuestion[]>([
    createEmptyQuestion(1),
  ]);

  const [viewingQuizTask, setViewingQuizTask] = useState<TaskItem | null>(null);
  const [aiCustomInstruction, setAiCustomInstruction] = useState<string>('');

  const handleGenerateAiPlan = () => {
    generateAiWeeklyPlan(aiCustomInstruction);
  };

  const draftTasks = tasks.filter((t) => t.status === 'draft');
  const activeTasks = tasks.filter((t) => t.status === 'active');

  const handleSubjectChange = (newSubject: SubjectName) => {
    setTaskSubject(newSubject);
    const first = CURRICULUM_TOPICS.find((t) => t.subject === newSubject);
    if (first) setTaskTopicId(first.id);
  };

  const handleAddQuestionToPack = () => {
    setQuizQuestions((prev) => [
      ...prev,
      createEmptyQuestion(prev.length + 1),
    ]);
  };

  const handleRemoveQuestionFromPack = (index: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((q, idx) => ({ ...q, questionNumber: idx + 1 }))
    );
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof TaskQuestion | 'optionA' | 'optionB' | 'optionC' | 'optionD',
    value: any
  ) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== index) return q;
        if (field === 'optionA') return { ...q, options: { ...q.options, A: value } };
        if (field === 'optionB') return { ...q, options: { ...q.options, B: value } };
        if (field === 'optionC') return { ...q, options: { ...q.options, C: value } };
        if (field === 'optionD') return { ...q, options: { ...q.options, D: value } };
        return { ...q, [field]: value };
      })
    );
  };

  const handleImageFileChange = async (file: File, questionIndex: number) => {
    try {
      const compressed = await compressImage(file, 1000, 0.72);
      handleUpdateQuestion(questionIndex, 'imageUrl', compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleUpdateQuestion(questionIndex, 'imageUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const topicObj = CURRICULUM_TOPICS.find((t) => t.id === taskTopicId);

    if (createMode === 'quiz') {
      addMentorTask({
        title: taskTitle.trim(),
        subject: taskSubject,
        topicId: taskTopicId,
        topicName: topicObj ? topicObj.topicName : taskSubject,
        targetCount: quizQuestions.length,
        targetDate: taskDate,
        mentorNote: mentorNote.trim() || undefined,
        taskType: 'quiz',
        questions: quizQuestions,
      });
    } else {
      addMentorTask({
        title: taskTitle.trim(),
        subject: taskSubject,
        topicId: taskTopicId,
        topicName: topicObj ? topicObj.topicName : taskSubject,
        targetCount: Number(taskTargetCount),
        targetDate: taskDate,
        mentorNote: mentorNote.trim() || undefined,
        taskType: 'target',
      });
    }

    setShowAddModal(false);
    setTaskTitle('');
    setMentorNote('');
    setQuizQuestions([createEmptyQuestion(1)]);
    if (onClearPrefilledTopic) onClearPrefilledTopic();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Controls */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Görev & Haftalık Rota Yönetimi</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Mentor Görevleri doğrudan öğrenciye atanır. AI tarafından üretilen planlar ise önce taslak olarak
              buraya gelir, onaylamadan öğrenciye görünmez.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowJsonModal(true)}
              className="btn btn-secondary"
              style={{
                gap: '8px',
                borderColor: 'rgba(99, 102, 241, 0.45)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#c7d2fe',
                fontWeight: 700,
              }}
            >
              <Code2 size={18} color="#818cf8" />
              <span>JSON ile Sınav / Test Yükle</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ gap: '8px' }}
            >
              <PlusCircle size={18} />
              <span>Manuel Görev Ekle</span>
            </button>
          </div>
        </div>

        {/* AI Rota Prompt Giriş Kutusu */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              <span>Yapay Zekaya Özel Rota Talimatı Ver (İsteğe Bağlı)</span>
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Boş bırakırsan zayıf konulara göre otomatik üretir
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              value={aiCustomInstruction}
              onChange={(e) => setAiCustomInstruction(e.target.value)}
              placeholder="Örn: Bu hafta özellikle Matematik Üslü İfadeler ve Fen Kalıtım'a odaklansın, günde 30 soru olsun..."
              style={{
                flex: 1,
                minWidth: '260px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderColor: 'rgba(99, 102, 241, 0.35)',
                fontSize: '0.88rem',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isPlanLoading) {
                  handleGenerateAiPlan();
                }
              }}
            />

            <button
              onClick={handleGenerateAiPlan}
              className="btn btn-secondary"
              style={{
                gap: '8px',
                color: '#fff',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                fontWeight: 700,
                padding: '10px 20px',
                whiteSpace: 'nowrap',
              }}
              disabled={isPlanLoading}
            >
              <Sparkles size={18} />
              <span>{isPlanLoading ? 'Gemini Üretiyor...' : 'AI Haftalık Rota Üret'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: AI DRAFT TASKS (WAITING FOR MENTOR APPROVAL) */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI Taslak Görevleri (Onay Bekliyor)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Gemini yapay zekasının zayıf konulara göre önerdiği taslaklar. Onayladıkların öğrenciye iletilir.
              </p>
            </div>
          </div>

          {draftTasks.length > 0 && (
            <button
              onClick={approveAllDraftTasks}
              className="btn btn-success btn-sm"
              style={{ gap: '6px' }}
            >
              <CheckCheck size={16} />
              <span>Tümünü Onayla ({draftTasks.length})</span>
            </button>
          )}
        </div>

        {draftTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '26px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Şu an onay bekleyen AI taslak görevi yok. Yukarıdaki "AI Haftalık Rota Üret" butonuna basarak yeni görevler üretebilirsin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {draftTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8' }}>
                      {task.subject}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Hedef: <strong>{task.targetCount} Soru</strong>
                    </span>
                    <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>
                      TASLAK
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Tarih: {task.targetDate}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => approveDraftTask(task.id)}
                    className="btn btn-success btn-sm"
                    style={{ gap: '4px' }}
                  >
                    <Check size={15} />
                    <span>Onayla & Gönder</span>
                  </button>

                  <button
                    onClick={() => deleteDraftTask(task.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    title="Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE TASKS LIST */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Öğrencideki Aktif Görevler ({activeTasks.length})</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Öğrencinin ekranında görünen ve takip edilen görevler.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Şu an öğrencide aktif atanmış bir görev bulunmuyor. Yukarıdaki "Görev Ekle" butonunu kullanarak yeni bir hedef belirleyebilirsiniz.
            </div>
          ) : (
            activeTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: task.isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                border: task.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8' }}>
                    {task.subject}
                  </span>
                  <span
                    className={`badge ${task.source === 'mentor' ? 'badge-mentor' : 'badge-ai'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {task.source === 'mentor' ? 'Mentor Görevi' : 'AI Onaylı'}
                  </span>
                  {task.questions && task.questions.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ImageIcon size={12} /> {task.questions.length} Soru Paketi
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: task.isCompleted ? '#6ee7b7' : 'var(--text-muted)',
                    }}
                  >
                    {task.isCompleted ? '✓ Tamamlandı' : 'Devam Ediyor'}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    color: task.isCompleted ? 'var(--text-muted)' : '#fff',
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </div>
                {task.quizResult && (
                  <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>
                    🎯 Öğrenci Çözümü: {task.quizResult.correct}D / {task.quizResult.incorrect}Y / {task.quizResult.blank}B (Başarı: %{task.quizResult.scorePercent})
                  </div>
                )}
                {task.completionResult && (
                  <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>
                    📊 Sonuç: {task.completionResult.correct}D / {task.completionResult.incorrect}Y / {task.completionResult.blank}B
                    {' '}({Math.max(0, task.completionResult.correct - task.completionResult.incorrect / 3).toFixed(2)} Net)
                    {task.completionImages && task.completionImages.length > 0 && (
                      <span style={{ marginLeft: '8px', color: '#a5b4fc' }}>📷 {task.completionImages.length} Fotoğraf</span>
                    )}
                  </div>
                )}
                {task.mentorNote && (
                  <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginTop: '4px' }}>
                    Notunuz: {task.mentorNote}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                    {task.targetCount} Soru
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {task.targetDate}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {task.questions && task.questions.length > 0 && (
                    <button
                      onClick={() => setViewingQuizTask(task)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    >
                      <Eye size={15} />
                      <span>İncele</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    title="Görevi Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* MANUAL TASK CREATE MODAL */}
      {showAddModal && (
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
              maxWidth: createMode === 'quiz' ? '760px' : '520px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              background: '#0f172a',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={22} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Yeni Görev Ata</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
                Kapat
              </button>
            </div>

            {/* Mode Tabs */}
            <div
              style={{
                display: 'flex',
                padding: '8px 24px',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                type="button"
                onClick={() => setCreateMode('quiz')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: createMode === 'quiz' ? '1px solid #818cf8' : '1px solid transparent',
                  background: createMode === 'quiz' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: createMode === 'quiz' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <ListPlus size={16} color={createMode === 'quiz' ? '#818cf8' : 'currentColor'} />
                <span>📸 Soru Paketi & Test (Görsel + Şıklar)</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateMode('target')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: createMode === 'target' ? '1px solid #f59e0b' : '1px solid transparent',
                  background: createMode === 'target' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: createMode === 'target' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Calendar size={16} color={createMode === 'target' ? '#f59e0b' : 'currentColor'} />
                <span>🎯 Klasik Soru Çözüm Hedefi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowJsonModal(true);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#c7d2fe',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Code2 size={16} color="#818cf8" />
                <span>📋 JSON ile Test Yükle</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <form onSubmit={handleCreateTask} id="create-task-form">
                {/* General Info */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="input-label">Görev Başlığı</label>
                  <input
                    type="text"
                    className="input-field"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={
                      createMode === 'quiz'
                        ? 'Örn: EBOB-EKOK Yeni Nesil 5 Soru Paketi'
                        : 'Örn: EBOB-EKOK 25 Soru Çözümü'
                    }
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label className="input-label">Ders</label>
                    <select
                      className="input-field"
                      value={taskSubject}
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

                  <div>
                    <label className="input-label">
                      {createMode === 'quiz' ? 'Soru Sayısı' : 'Hedef Soru Sayısı'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="input-field"
                      value={createMode === 'quiz' ? quizQuestions.length : taskTargetCount}
                      onChange={(e) => setTaskTargetCount(Number(e.target.value))}
                      disabled={createMode === 'quiz'}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label className="input-label">Müfredat Konusu</label>
                    <select
                      className="input-field"
                      value={taskTopicId}
                      onChange={(e) => setTaskTopicId(e.target.value)}
                    >
                      {CURRICULUM_TOPICS.filter((t) => t.subject === taskSubject).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.topicName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Hedef Tarih</label>
                    <input
                      type="date"
                      className="input-field"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label className="input-label">Kardeşine Özel Notun (Opsiyonel)</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={mentorNote}
                    onChange={(e) => setMentorNote(e.target.value)}
                    placeholder="Örn: Soruları çözerken süreye dikkat et, takıldığın yeri sorabilirsin."
                  />
                </div>

                {/* QUIZ QUESTIONS CREATOR SECTION */}
                {createMode === 'quiz' && (
                  <div style={{ marginTop: '24px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                          Test Soruları ({quizQuestions.length} Soru Eklendi)
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          5-10 soru birleştirip tek bir paket olarak atabilirsiniz. Her soru için görsel, metin ve doğru şık ayarlayın.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuestionToPack}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)', gap: '6px' }}
                      >
                        <Plus size={16} />
                        <span>Soru Ekle</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {quizQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="glass-panel"
                          style={{
                            padding: '16px',
                            background: 'rgba(2, 6, 23, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '12px',
                          }}
                        >
                          {/* Question header */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '12px',
                            }}
                          >
                            <span
                              style={{
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: '#a5b4fc',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                              }}
                            >
                              Soru #{idx + 1}
                            </span>

                            {quizQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionFromPack(idx)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: 'none',
                                  color: '#f87171',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Trash2 size={13} /> Soruyu Sil
                              </button>
                            )}
                          </div>

                          {/* Image upload area */}
                          <div style={{ marginBottom: '12px' }}>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ImageIcon size={14} color="#818cf8" />
                              <span>Soru Görseli (Fotoğraf / Ekran Görüntüsü)</span>
                            </label>

                            {q.imageUrl ? (
                              <div
                                style={{
                                  position: 'relative',
                                  background: 'rgba(0,0,0,0.4)',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  textAlign: 'center',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                }}
                              >
                                <img
                                  src={q.imageUrl}
                                  alt={`Soru ${idx + 1}`}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '180px',
                                    borderRadius: '6px',
                                    objectFit: 'contain',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestion(idx, 'imageUrl', '')}
                                  style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(239, 68, 68, 0.85)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Görseli Kaldır
                                </button>
                              </div>
                            ) : (
                              <label
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '16px',
                                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  background: 'rgba(15, 23, 42, 0.4)',
                                  transition: 'border 0.2s',
                                }}
                              >
                                <Upload size={22} color="#818cf8" style={{ marginBottom: '6px' }} />
                                <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                                  Soru Fotoğrafı Yükle
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  PNG, JPG veya kameradan çek
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageFileChange(file, idx);
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Question Text */}
                          <div style={{ marginBottom: '12px' }}>
                            <label className="input-label">Soru Metni / Açıklaması (Opsiyonel)</label>
                            <textarea
                              className="input-field"
                              rows={2}
                              value={q.text}
                              onChange={(e) => handleUpdateQuestion(idx, 'text', e.target.value)}
                              placeholder="Soru metnini yazabilir veya görsel yeterliyse boş bırakabilirsiniz..."
                            />
                          </div>

                          {/* Options Grid */}
                          <div style={{ marginBottom: '14px' }}>
                            <label className="input-label">Şıklar (A, B, C, D)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: q.correctOption === opt ? '#10b981' : 'rgba(255,255,255,0.1)',
                                      color: q.correctOption === opt ? '#fff' : 'var(--text-secondary)',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {opt}
                                  </span>
                                  <input
                                    type="text"
                                    className="input-field"
                                    style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                                    value={q.options[opt]}
                                    onChange={(e) =>
                                      handleUpdateQuestion(
                                        idx,
                                        `option${opt}` as any,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`${opt} Şıkkı metni (opsiyonel)`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Correct Option Selector */}
                          <div style={{ marginBottom: '12px' }}>
                            <label className="input-label" style={{ color: '#34d399' }}>
                              🎯 Doğru Cevap Şıkkı (Seçmek için tıkla):
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                const isSelected = q.correctOption === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleUpdateQuestion(idx, 'correctOption', opt)}
                                    style={{
                                      flex: 1,
                                      padding: '8px',
                                      borderRadius: '8px',
                                      border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                                      color: isSelected ? '#34d399' : 'var(--text-secondary)',
                                      fontWeight: 800,
                                      fontSize: '0.85rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    {opt} {isSelected && '✓'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Explanation */}
                          <div>
                            <label className="input-label">Çözüm İpucu / Açıklaması (Opsiyonel)</label>
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                              value={q.explanation}
                              onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                              placeholder="Öğrenci testi bitirince göreceği çözüm notu..."
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add another question button */}
                      <button
                        type="button"
                        onClick={handleAddQuestionToPack}
                        className="btn btn-secondary"
                        style={{
                          border: '2px dashed rgba(99, 102, 241, 0.4)',
                          color: '#a5b4fc',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: 700,
                        }}
                      >
                        <Plus size={18} />
                        <span>+ Yeni Soru Ekle (Şu an {quizQuestions.length} Soru — 5-10 Soru Birleştirebilirsiniz)</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.95)',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                İptal
              </button>

              <button
                type="submit"
                form="create-task-form"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderColor: '#f59e0b',
                  fontWeight: 700,
                  gap: '8px',
                }}
              >
                {createMode === 'quiz' ? (
                  <>
                    <Sparkles size={18} />
                    <span>{quizQuestions.length} Soruluk Paketi Öğrenciye Gönder</span>
                  </>
                ) : (
                  <span>Görevi Öğrenciye Ata</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW QUIZ REVIEW MODAL */}
      {viewingQuizTask && (
        <MentorQuizViewModal
          task={viewingQuizTask}
          isOpen={!!viewingQuizTask}
          onClose={() => setViewingQuizTask(null)}
        />
      )}

      {/* JSON QUIZ IMPORT MODAL */}
      <MentorJsonTaskModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
      />
    </div>
  );
};

