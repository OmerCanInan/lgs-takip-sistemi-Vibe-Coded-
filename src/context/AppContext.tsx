import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CURRICULUM_TOPICS, INTENSITY_LEVELS } from '../data/curriculum';
import { sendMessageToGemini, generateWeeklyReportFromGemini, generateWeeklyPlanFromGemini } from '../services/geminiApi';
import {
  INITIAL_AI_CHAT,
  INITIAL_AI_REPORTS,
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_STUDY_LOGS,
  INITIAL_TASKS,
} from '../data/mockData';
import type {
  AiReport,
  AuthUser,
  ChatMessage,
  CurriculumTopic,
  ExamResult,
  IntensityLevel,
  QuestionItem,
  QuestionMessage,
  StudyLog,
  SubjectName,
  TaskItem,
  UserRole,
} from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import {
  mapTaskFromDb,
  mapStudyLogFromDb,
  mapExamFromDb,
  mapQuestionFromDb,
  mapChatMessageFromDb,
  mapAiReportFromDb,
  syncTaskToSupabase,
  deleteTaskFromSupabase,
  syncStudyLogToSupabase,
  deleteStudyLogFromSupabase,
  syncExamToSupabase,
  deleteExamFromSupabase,
  syncQuestionToSupabase,
  syncChatMessageToSupabase,
  syncAiReportToSupabase,
} from '../services/supabaseSync';

interface TopicMastery {
  topic: CurriculumTopic;
  totalCorrect: number;
  totalIncorrect: number;
  totalBlank: number;
  totalQuestions: number;
  errorRate: number; // 0 - 100
  accuracyRate: number; // 0 - 100
  status: 'critical' | 'warning' | 'mastered' | 'untested';
}

interface AppContextType {
  currentUser: AuthUser | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  studentName: string;
  mentorName: string;
  intensityLevel: number;
  setIntensityLevel: (level: number) => void;
  currentIntensity: IntensityLevel;
  tasks: TaskItem[];
  toggleTaskCompletion: (taskId: string) => void;
  addMentorTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'isCompleted' | 'source' | 'status' | 'studentId'>) => void;
  approveDraftTask: (taskId: string) => void;
  deleteDraftTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  submitTaskQuiz: (taskId: string, answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => void;
  approveAllDraftTasks: () => void;
  studyLogs: StudyLog[];
  addStudyLog: (log: Omit<StudyLog, 'id' | 'createdAt' | 'studentId'>) => void;
  deleteStudyLog: (logId: string) => void;
  exams: ExamResult[];
  addExamResult: (exam: Omit<ExamResult, 'id' | 'studentId'>) => void;
  deleteExam: (examId: string) => void;
  questions: QuestionItem[];
  addQuestion: (question: { subject: SubjectName; topicId?: string; note: string; images: string[] }) => void;
  answerQuestionByMentor: (questionId: string, text: string, images?: string[]) => void;
  resolveQuestion: (questionId: string) => void;
  reopenQuestion: (questionId: string, followUpNote: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  isAiLoading: boolean;
  askBrotherFromChat: (content: string, topicRef?: string) => void;
  aiReports: AiReport[];
  generateAiWeeklyReport: () => void;
  isReportLoading: boolean;
  generateAiWeeklyPlan: (customInstruction?: string) => void;
  isPlanLoading: boolean;
  // Computed stats
  todaySolvedQuestions: number;
  todayDurationMinutes: number;
  todayTargetQuestions: number;
  streakDays: number;
  pendingQuestionsCount: number;
  draftTasksCount: number;
  topicMasteries: TopicMastery[];
  resetToDefaults: () => void;
  isSupabaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const STORE_VERSION = 'lgs_clean_v2';
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem('lgs_store_version') !== STORE_VERSION) {
        localStorage.clear();
        localStorage.setItem('lgs_store_version', STORE_VERSION);
      }
    } catch {}
  }

  // Persistence helpers
  const getStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(`lgs_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStored('auth_user', null));
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedUser = getStored<AuthUser | null>('auth_user', null);
    if (savedUser) return savedUser.role;
    return getStored('role', 'student');
  });
  const [studentName] = useState('Öykü (8. Sınıf)');
  const [mentorName] = useState('Kaan');
  const [intensityLevel, setIntensityLevelState] = useState<number>(() => getStored('intensity', 3));
  const [tasks, setTasks] = useState<TaskItem[]>(() => getStored('tasks', INITIAL_TASKS));
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(() => getStored('studyLogs', INITIAL_STUDY_LOGS));
  const [exams, setExams] = useState<ExamResult[]>(() => getStored('exams', INITIAL_EXAMS));
  const [questions, setQuestions] = useState<QuestionItem[]>(() => getStored('questions', INITIAL_QUESTIONS));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStored('chat', INITIAL_AI_CHAT));
  const [aiReports, setAiReports] = useState<AiReport[]>(() => getStored('reports', INITIAL_AI_REPORTS));

  // Sync auth state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lgs_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lgs_auth_user');
    }
  }, [currentUser]);

  // Login handler
  const login = (usernameInput: string, passwordInput: string) => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // Student credentials: "öyküöykü" / "öykü1234"
    if ((u === 'öyküöykü' || u === 'oykuoyku') && (p === 'öykü1234' || p === 'oyku1234')) {
      const user: AuthUser = {
        username: 'öyküöykü',
        role: 'student',
        displayName: 'Öykü',
      };
      setCurrentUser(user);
      setRoleState('student');
      try {
        localStorage.setItem('lgs_auth_user', JSON.stringify(user));
        localStorage.setItem('lgs_role', JSON.stringify('student'));
      } catch {}
      return { success: true };
    }

    // Admin credentials: "admin" / "adminMf130805"
    if (u === 'admin' && p === 'adminMf130805') {
      const user: AuthUser = {
        username: 'admin',
        role: 'mentor',
        displayName: 'Admin / Mentor',
      };
      setCurrentUser(user);
      setRoleState('mentor');
      try {
        localStorage.setItem('lgs_auth_user', JSON.stringify(user));
        localStorage.setItem('lgs_role', JSON.stringify('mentor'));
      } catch {}
      return { success: true };
    }

    return {
      success: false,
      error: 'Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.',
    };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('lgs_auth_user');
    } catch {}
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('lgs_role', JSON.stringify(role));
  }, [role]);

  useEffect(() => {
    localStorage.setItem('lgs_intensity', JSON.stringify(intensityLevel));
  }, [intensityLevel]);

  // Cross-tab synchronization within the same browser
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lgs_intensity' && e.newValue) {
        try {
          const newLvl = JSON.parse(e.newValue);
          if (typeof newLvl === 'number' && newLvl >= 1 && newLvl <= 5) {
            setIntensityLevelState(newLvl);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('lgs_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lgs_studyLogs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('lgs_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('lgs_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('lgs_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('lgs_reports', JSON.stringify(aiReports));
  }, [aiReports]);

  // Supabase Realtime & Remote Database Synchronization
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    let isMounted = true;

    const initSupabase = async () => {
      try {
        const [tasksRes, logsRes, examsRes, questionsRes, chatRes, reportsRes] = await Promise.all([
          client.from('tasks').select('*'),
          client.from('study_logs').select('*'),
          client.from('exams').select('*'),
          client.from('questions').select('*'),
          client.from('chat_messages').select('*').order('created_at', { ascending: true }),
          client.from('ai_reports').select('*'),
        ]);

        if (!isMounted) return;

        // Check if tables are available
        if (tasksRes.error || logsRes.error) {
          console.warn('Supabase tables not initialized or query failed:', tasksRes.error?.message || logsRes.error?.message);
          return;
        }

        setIsSupabaseConnected(true);

        if (tasksRes.data && tasksRes.data.length > 0) {
          // Check for intensity setting in Supabase
          const intensityTask = tasksRes.data.find((t: any) => t.id === 'setting-intensity');
          if (intensityTask && typeof intensityTask.target_count === 'number' && intensityTask.target_count >= 1 && intensityTask.target_count <= 5) {
            setIntensityLevelState(intensityTask.target_count);
          }

          const actualTasks = tasksRes.data.filter((t: any) => t.id !== 'setting-intensity');
          setTasks(actualTasks.map(mapTaskFromDb));
        } else {
          // Seed starter data to Supabase if empty
          INITIAL_TASKS.forEach((t) => syncTaskToSupabase(t));
        }

        if (logsRes.data && logsRes.data.length > 0) {
          setStudyLogs(logsRes.data.map(mapStudyLogFromDb));
        } else {
          INITIAL_STUDY_LOGS.forEach((l) => syncStudyLogToSupabase(l));
        }

        if (examsRes.data && examsRes.data.length > 0) {
          setExams(examsRes.data.map(mapExamFromDb));
        } else {
          INITIAL_EXAMS.forEach((e) => syncExamToSupabase(e));
        }

        if (questionsRes.data && questionsRes.data.length > 0) {
          setQuestions(questionsRes.data.map(mapQuestionFromDb));
        } else {
          INITIAL_QUESTIONS.forEach((q) => syncQuestionToSupabase(q));
        }

        if (chatRes.data && chatRes.data.length > 0) {
          setChatMessages(chatRes.data.map(mapChatMessageFromDb));
        } else {
          INITIAL_AI_CHAT.forEach((c) => syncChatMessageToSupabase(c));
        }

        if (reportsRes.data && reportsRes.data.length > 0) {
          setAiReports(reportsRes.data.map(mapAiReportFromDb));
        } else {
          INITIAL_AI_REPORTS.forEach((r) => syncAiReportToSupabase(r));
        }
      } catch (err) {
        console.warn('Supabase sync initialization error:', err);
      }
    };

    initSupabase();

    // Subscribe to Realtime broadcast and postgres_changes across all tables
    const channel = client
      .channel('public:lgs-takip-sync')
      .on('broadcast', { event: 'intensity_change' }, (payload) => {
        if (payload.payload?.level && typeof payload.payload.level === 'number') {
          setIntensityLevelState(payload.payload.level);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.new && (payload.new as any).id === 'setting-intensity') {
          const lvl = (payload.new as any).target_count;
          if (typeof lvl === 'number' && lvl >= 1 && lvl <= 5) {
            setIntensityLevelState(lvl);
          }
          return;
        }

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapTaskFromDb(payload.new);
          if (item.id === 'setting-intensity') return;
          setTasks((prev) => {
            const idx = prev.findIndex((t) => t.id === item.id);
            return idx >= 0 ? prev.map((t) => (t.id === item.id ? item : t)) : [item, ...prev];
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setTasks((prev) => prev.filter((t) => t.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_logs' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapStudyLogFromDb(payload.new);
          setStudyLogs((prev) => {
            const idx = prev.findIndex((l) => l.id === item.id);
            return idx >= 0 ? prev.map((l) => (l.id === item.id ? item : l)) : [item, ...prev];
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setStudyLogs((prev) => prev.filter((l) => l.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapExamFromDb(payload.new);
          setExams((prev) => {
            const idx = prev.findIndex((e) => e.id === item.id);
            return idx >= 0 ? prev.map((e) => (e.id === item.id ? item : e)) : [item, ...prev];
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setExams((prev) => prev.filter((e) => e.id !== (payload.old as any).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const item = mapQuestionFromDb(payload.new);
          setQuestions((prev) => {
            const idx = prev.findIndex((q) => q.id === item.id);
            return idx >= 0 ? prev.map((q) => (q.id === item.id ? item : q)) : [item, ...prev];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const item = mapChatMessageFromDb(payload.new);
          setChatMessages((prev) => (prev.some((m) => m.id === item.id) ? prev : [...prev, item]));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  const currentIntensity =
    INTENSITY_LEVELS.find((l) => l.level === intensityLevel) || INTENSITY_LEVELS[2];

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const setIntensityLevel = (lvl: number) => {
    setIntensityLevelState(lvl);
    try {
      localStorage.setItem('lgs_intensity', JSON.stringify(lvl));
    } catch {}

    // Persist intensity setting to Supabase
    syncTaskToSupabase({
      id: 'setting-intensity',
      studentId: 'student-1',
      title: 'intensity_level',
      subject: 'Matematik',
      topicId: 'settings',
      topicName: 'Ayarlar',
      targetCount: lvl,
      source: 'mentor',
      status: 'active',
      isCompleted: false,
      targetDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    // Realtime broadcast to all connected devices/tabs
    if (isSupabaseConfigured && supabase) {
      supabase.channel('public:lgs-takip-sync').send({
        type: 'broadcast',
        event: 'intensity_change',
        payload: { level: lvl },
      }).catch(() => {});
    }
  };

  // Toggle Task Completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          if (nextState) {
            // Trigger confetti
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
              });
            } catch {
              // Ignore if canvas-confetti is not loaded
            }
          }
          const updated: TaskItem = {
            ...t,
            isCompleted: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
          syncTaskToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Add mentor task
  const addMentorTask = (
    taskData: Omit<TaskItem, 'id' | 'createdAt' | 'isCompleted' | 'source' | 'status' | 'studentId'>
  ) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      studentId: 'student-1',
      source: 'mentor',
      status: 'active',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    syncTaskToSupabase(newTask);
  };

  // Approve AI Draft Task
  const approveDraftTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status: 'active' as const };
          syncTaskToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Delete draft task
  const deleteDraftTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromSupabase(taskId);
  };

  // Delete any task
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromSupabase(taskId);
  };

  // Submit Task Quiz (student solves question pack)
  const submitTaskQuiz = (taskId: string, answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || !targetTask.questions) return;

    let correct = 0;
    let incorrect = 0;
    let blank = 0;

    const updatedQuestions = targetTask.questions.map((q) => {
      const ans = answers[q.id];
      const hasAnswer = !!ans;
      const isCorr = hasAnswer && q.correctOption ? ans === q.correctOption : false;
      if (!hasAnswer) {
        blank++;
      } else if (isCorr) {
        correct++;
      } else {
        incorrect++;
      }
      return {
        ...q,
        studentAnswer: ans,
        isCorrect: hasAnswer && q.correctOption ? isCorr : undefined,
      };
    });

    const totalQ = targetTask.questions.length;
    const scorePercent = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

    const updatedTask: TaskItem = {
      ...targetTask,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      questions: updatedQuestions,
      quizResult: {
        correct,
        incorrect,
        blank,
        scorePercent,
        submittedAt: new Date().toISOString(),
      },
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    syncTaskToSupabase(updatedTask);

    // Only add a study log if questions were answered, and prevent duplicates
    const answeredCount = correct + incorrect;
    if (answeredCount > 0) {
      const topicObj = CURRICULUM_TOPICS.find((top) => top.id === targetTask.topicId);
      const newLogId = `log-quiz-${taskId}`;
      const newLog: StudyLog = {
        id: newLogId,
        studentId: 'student-1',
        subject: targetTask.subject,
        topicId: targetTask.topicId,
        topicName: topicObj ? topicObj.topicName : targetTask.topicName,
        correct,
        incorrect,
        blank,
        durationMinutes: Math.max(5, totalQ * 2),
        logDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      setStudyLogs((sl) => [newLog, ...sl.filter((l) => l.id !== newLogId)]);
      syncStudyLogToSupabase(newLog);
    }

    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  // Approve all AI draft tasks
  const approveAllDraftTasks = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status === 'draft') {
          const updated = { ...t, status: 'active' as const };
          syncTaskToSupabase(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Add Study Log
  const addStudyLog = (logData: Omit<StudyLog, 'id' | 'createdAt' | 'studentId'>) => {
    const newLog: StudyLog = {
      ...logData,
      id: `log-${Date.now()}`,
      studentId: 'student-1',
      createdAt: new Date().toISOString(),
    };
    setStudyLogs((prev) => [newLog, ...prev]);
    syncStudyLogToSupabase(newLog);
    // Confetti on logging study
    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Delete Study Log
  const deleteStudyLog = (logId: string) => {
    setStudyLogs((prev) => prev.filter((l) => l.id !== logId));
    deleteStudyLogFromSupabase(logId);
  };

  // Add Exam Result
  const addExamResult = (examData: Omit<ExamResult, 'id' | 'studentId'>) => {
    const newExam: ExamResult = {
      ...examData,
      id: `exam-${Date.now()}`,
      studentId: 'student-1',
    };
    setExams((prev) => [newExam, ...prev]);
    syncExamToSupabase(newExam);
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {}
  };

  // Delete Exam Result
  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    deleteExamFromSupabase(examId);
  };

  // Add Question to Soru Kutusu
  const addQuestion = (data: {
    subject: SubjectName;
    topicId?: string;
    note: string;
    images: string[];
  }) => {
    const topic = CURRICULUM_TOPICS.find((t) => t.id === data.topicId);
    const newQuestionId = `q-${Date.now()}`;
    const initialMessage: QuestionMessage = {
      id: `msg-${Date.now()}`,
      questionId: newQuestionId,
      senderId: 'student-1',
      senderRole: 'student',
      text: data.note,
      imagePaths: data.images,
      createdAt: new Date().toISOString(),
    };

    const newQuestion: QuestionItem = {
      id: newQuestionId,
      studentId: 'student-1',
      subject: data.subject,
      topicId: data.topicId,
      topicName: topic ? topic.topicName : undefined,
      note: data.note,
      status: 'pending',
      createdAt: new Date().toISOString(),
      images: data.images,
      messages: [initialMessage],
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    syncQuestionToSupabase(newQuestion);
  };

  // Mentor answers question
  const answerQuestionByMentor = (questionId: string, text: string, images: string[] = []) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newMsg: QuestionMessage = {
            id: `msg-${Date.now()}`,
            questionId,
            senderId: 'mentor-1',
            senderRole: 'mentor',
            text,
            imagePaths: images,
            createdAt: new Date().toISOString(),
          };
          const updated: QuestionItem = {
            ...q,
            status: 'answered',
            messages: [...q.messages, newMsg],
          };
          syncQuestionToSupabase(updated);
          return updated;
        }
        return q;
      })
    );
  };

  // Student marks question as resolved ("Anladım") -> moves to Yanlış Defteri
  const resolveQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const updated: QuestionItem = {
            ...q,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
          };
          syncQuestionToSupabase(updated);
          return updated;
        }
        return q;
      })
    );
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  // Student marks question as still not understood ("Hâlâ Anlamadım") -> reopens to mentor
  const reopenQuestion = (questionId: string, followUpNote: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const followUpMsg: QuestionMessage = {
            id: `msg-${Date.now()}`,
            questionId,
            senderId: 'student-1',
            senderRole: 'student',
            text: followUpNote || 'Bu kısmı hâlâ tam oturtamadım, biraz daha detaylandırabilir misin?',
            imagePaths: [],
            createdAt: new Date().toISOString(),
          };
          const updated: QuestionItem = {
            ...q,
            status: 'reopened',
            messages: [...q.messages, followUpMsg],
          };
          syncQuestionToSupabase(updated);
          return updated;
        }
        return q;
      })
    );
  };

  // AI Chat messaging (Gemini-powered Socratic coach)
  const [isAiLoading, setIsAiLoading] = useState(false);

  const sendChatMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      studentId: 'student-1',
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    syncChatMessageToSupabase(userMsg);
    setIsAiLoading(true);

    try {
      // Build history from existing messages for context
      const history = chatMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const aiResponseText = await sendMessageToGemini(content, history);

      const assistantMsg: ChatMessage = {
        id: `chat-${Date.now() + 1}`,
        studentId: 'student-1',
        role: 'assistant',
        content: aiResponseText,
        createdAt: new Date().toISOString(),
        suggestedAction: 'ask_brother',
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      syncChatMessageToSupabase(assistantMsg);
    } catch (error) {
      console.error('Gemini chat error:', error);
      const errorMsg: ChatMessage = {
        id: `chat-${Date.now() + 1}`,
        studentId: 'student-1',
        role: 'assistant',
        content: 'Yapay zeka şu an yanıt veremiyor. Lütfen biraz sonra tekrar dene. 🔄',
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  }, [chatMessages]);

  // Quick transfer from AI chat to Soru Kutusu
  const askBrotherFromChat = (content: string, topicRef?: string) => {
    addQuestion({
      subject: 'Matematik',
      topicId: topicRef || 'mat-1',
      note: `AI Koç ile konuşurken tam netleştiremediğim konu:\n"${content.slice(0, 160)}..."`,
      images: [],
    });
  };

  // Generate Weekly AI Report (Gemini-powered)
  const [isReportLoading, setIsReportLoading] = useState(false);

  const generateAiWeeklyReport = useCallback(async () => {
    setIsReportLoading(true);
    try {
      const logContext = studyLogs.map((l) => ({
        subject: l.subject,
        correct: l.correct,
        incorrect: l.incorrect,
        blank: l.blank,
        topicName: l.topicName,
        logDate: l.logDate,
      }));

      const examContext = exams.map((e) => ({
        examName: e.examName,
        totalNet: e.totalNet,
        subjects: e.subjects.map((s) => ({
          subject: s.subject,
          correct: s.correct,
          incorrect: s.incorrect,
          blank: s.blank,
        })),
      }));

      const result = await generateWeeklyReportFromGemini({
        studyLogs: logContext,
        exams: examContext,
        streakDays: Array.from(new Set(studyLogs.map((l) => l.logDate))).length,
      });

      const newReport: AiReport = {
        id: `rep-${Date.now()}`,
        studentId: 'student-1',
        weekStart: new Date().toISOString().split('T')[0],
        kind: 'analysis',
        title: result.title,
        summary: result.summary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        createdAt: new Date().toISOString(),
      };
      setAiReports((prev) => [newReport, ...prev]);
      syncAiReportToSupabase(newReport);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsReportLoading(false);
    }
  }, [studyLogs, exams]);

  // Generate AI Weekly Plan (Gemini-powered, adds draft tasks)
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const generateAiWeeklyPlan = useCallback(async (customInstruction?: string) => {
    setIsPlanLoading(true);
    try {
      const logContext = studyLogs.map((l) => ({
        subject: l.subject,
        correct: l.correct,
        incorrect: l.incorrect,
        blank: l.blank,
        topicName: l.topicName,
      }));

      const taskContext = tasks.map((t) => ({
        title: t.title,
        subject: t.subject,
        isCompleted: t.isCompleted,
      }));

      const planItems = await generateWeeklyPlanFromGemini({
        studyLogs: logContext,
        currentTasks: taskContext,
        customInstruction,
      });

      const generatedDrafts: TaskItem[] = planItems.map((item, idx) => ({
        id: `draft-${Date.now()}-${idx + 1}`,
        studentId: 'student-1',
        title: item.title,
        subject: item.subject as SubjectName,
        topicId: CURRICULUM_TOPICS.find((t) => t.subject === item.subject)?.id || 'mat-1',
        topicName: item.topicName,
        targetCount: item.targetCount,
        source: 'ai' as const,
        status: 'draft' as const,
        isCompleted: false,
        targetDate: new Date(Date.now() + 86400000 * (idx + 1)).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }));

      setTasks((prev) => [...generatedDrafts, ...prev]);
      generatedDrafts.forEach((d) => syncTaskToSupabase(d));
    } catch (error) {
      console.error('Plan generation failed:', error);
    } finally {
      setIsPlanLoading(false);
    }
  }, [studyLogs, tasks]);

  // Reset to defaults helper for testing
  const resetToDefaults = () => {
    localStorage.clear();
    setTasks(INITIAL_TASKS);
    setStudyLogs(INITIAL_STUDY_LOGS);
    setExams(INITIAL_EXAMS);
    setQuestions(INITIAL_QUESTIONS);
    setChatMessages(INITIAL_AI_CHAT);
    setAiReports(INITIAL_AI_REPORTS);
    setIntensityLevelState(3);
  };

  // Computed: Today's solved & minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = studyLogs.filter((l) => l.logDate === todayStr);
  const todaySolvedQuestions = todayLogs.reduce((acc, l) => acc + l.correct + l.incorrect, 0);
  const todayDurationMinutes = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const todayTargetQuestions = currentIntensity.dailyQuestions;

  // Streak calculation: unique consecutive days ending today or yesterday
  const uniqueDates = Array.from(new Set(studyLogs.map((l) => l.logDate))).sort().reverse();
  const streakDays = uniqueDates.length;

  // Pending questions count for badge
  const pendingQuestionsCount = questions.filter(
    (q) => q.status === 'pending' || q.status === 'reopened'
  ).length;

  // Draft tasks waiting mentor approval
  const draftTasksCount = tasks.filter((t) => t.status === 'draft').length;

  // Topic mastery stats
  const topicMasteries: TopicMastery[] = CURRICULUM_TOPICS.map((topic) => {
    const logsForTopic = studyLogs.filter((l) => l.topicId === topic.id);
    const totalCorrect = logsForTopic.reduce((acc, l) => acc + l.correct, 0);
    const totalIncorrect = logsForTopic.reduce((acc, l) => acc + l.incorrect, 0);
    const totalBlank = logsForTopic.reduce((acc, l) => acc + l.blank, 0);
    const totalQuestions = totalCorrect + totalIncorrect + totalBlank;

    let errorRate = 0;
    let accuracyRate = 0;
    let status: 'critical' | 'warning' | 'mastered' | 'untested' = 'untested';

    if (totalQuestions > 0) {
      errorRate = Math.round((totalIncorrect / totalQuestions) * 100);
      accuracyRate = Math.round((totalCorrect / totalQuestions) * 100);

      if (errorRate >= 35) {
        status = 'critical';
      } else if (errorRate >= 15) {
        status = 'warning';
      } else {
        status = 'mastered';
      }
    }

    return {
      topic,
      totalCorrect,
      totalIncorrect,
      totalBlank,
      totalQuestions,
      errorRate,
      accuracyRate,
      status,
    };
  });

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        role,
        setRole,
        studentName,
        mentorName,
        intensityLevel,
        setIntensityLevel,
        currentIntensity,
        tasks,
        toggleTaskCompletion,
        addMentorTask,
        approveDraftTask,
        deleteDraftTask,
        deleteTask,
        submitTaskQuiz,
        approveAllDraftTasks,
        studyLogs,
        addStudyLog,
        deleteStudyLog,
        exams,
        addExamResult,
        deleteExam,
        questions,
        addQuestion,
        answerQuestionByMentor,
        resolveQuestion,
        reopenQuestion,
        chatMessages,
        sendChatMessage,
        isAiLoading,
        askBrotherFromChat,
        aiReports,
        generateAiWeeklyReport,
        isReportLoading,
        generateAiWeeklyPlan,
        isPlanLoading,
        todaySolvedQuestions,
        todayDurationMinutes,
        todayTargetQuestions,
        streakDays,
        pendingQuestionsCount,
        draftTasksCount,
        topicMasteries,
        resetToDefaults,
        isSupabaseConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
