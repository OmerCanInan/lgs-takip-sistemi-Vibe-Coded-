export type UserRole = 'student' | 'mentor';

export const TYPES_VERSION = '1.0.0';

export type SubjectName =
  | 'Matematik'
  | 'Fen Bilimleri'
  | 'Türkçe'
  | 'T.C. İnkılap Tarihi'
  | 'Din Kültürü'
  | 'İngilizce';

export interface CurriculumTopic {
  id: string;
  subject: SubjectName;
  unit: string;
  topicName: string;
  kazanimKodu: string;
  recommendedWeeklyQuestions?: number;
}

export interface IntensityLevel {
  level: number;
  name: string;
  description: string;
  dailyQuestions: number;
  dailyMinutes: number;
  badgeColor: string;
}

export interface TaskQuestion {
  id: string;
  questionNumber: number;
  text?: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  studentAnswer?: 'A' | 'B' | 'C' | 'D';
  isCorrect?: boolean;
}

export interface TaskItem {
  id: string;
  studentId: string;
  title: string;
  subject: SubjectName;
  topicId: string;
  topicName: string;
  targetCount: number;
  source: 'ai' | 'mentor';
  status: 'draft' | 'active';
  isCompleted: boolean;
  completedAt?: string;
  targetDate: string;
  createdAt: string;
  mentorNote?: string;
  taskType?: 'target' | 'quiz';
  questions?: TaskQuestion[];
  quizResult?: {
    correct: number;
    incorrect: number;
    blank: number;
    scorePercent: number;
    submittedAt: string;
  };
}

export interface StudyLog {
  id: string;
  studentId: string;
  subject: SubjectName;
  topicId: string;
  topicName: string;
  correct: number;
  incorrect: number;
  blank: number;
  durationMinutes: number;
  logDate: string; // YYYY-MM-DD
  createdAt: string;
  images?: string[]; // Base64 or URL photos of solutions / questions
}

export interface ExamSubjectResult {
  subject: SubjectName;
  correct: number;
  incorrect: number;
  blank: number;
  net: number;
}

export interface ExamResult {
  id: string;
  studentId: string;
  examName: string;
  examDate: string;
  totalNet: number;
  reportCardPath?: string;
  subjects: ExamSubjectResult[];
}

export type QuestionStatus = 'pending' | 'answered' | 'reopened' | 'resolved';

export interface QuestionMessage {
  id: string;
  questionId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  imagePaths: string[];
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  studentId: string;
  subject: SubjectName;
  topicId?: string;
  topicName?: string;
  note: string;
  status: QuestionStatus;
  createdAt: string;
  resolvedAt?: string;
  images: string[];
  messages: QuestionMessage[];
}

export interface ChatMessage {
  id: string;
  studentId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  suggestedAction?: 'ask_brother' | 'start_pomodoro';
  topicRef?: string;
}

export interface AiReport {
  id: string;
  studentId: string;
  weekStart: string;
  kind: 'plan' | 'analysis';
  title: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: string;
}
