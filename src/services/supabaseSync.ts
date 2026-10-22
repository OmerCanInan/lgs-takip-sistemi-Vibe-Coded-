import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { TaskItem, StudyLog, ExamResult, QuestionItem, ChatMessage, AiReport } from '../types';

// Convert DB Task row to frontend TaskItem
export function mapTaskFromDb(row: any): TaskItem {
  return {
    id: row.id,
    studentId: row.student_id || 'student-1',
    title: row.title,
    subject: row.subject,
    topicId: row.topic_id || '',
    topicName: row.topic_name || '',
    targetCount: row.target_count || 0,
    source: (row.source as 'ai' | 'mentor') || 'mentor',
    status: (row.status as 'draft' | 'active') || 'active',
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || undefined,
    targetDate: row.target_date || new Date().toISOString().split('T')[0],
    createdAt: row.created_at || new Date().toISOString(),
    mentorNote: row.mentor_note || undefined,
    taskType: row.task_type || 'target',
    questions: Array.isArray(row.questions) ? row.questions : [],
    quizResult: row.quiz_result || undefined,
  };
}

export function mapTaskToDb(item: TaskItem): any {
  return {
    id: item.id,
    student_id: item.studentId || 'student-1',
    title: item.title,
    subject: item.subject,
    topic_id: item.topicId || '',
    topic_name: item.topicName || '',
    target_count: item.targetCount || 0,
    source: item.source || 'mentor',
    status: item.status || 'active',
    is_completed: item.isCompleted,
    completed_at: item.completedAt || null,
    target_date: item.targetDate,
    created_at: item.createdAt,
    mentor_note: item.mentorNote || null,
    task_type: item.taskType || 'target',
    questions: item.questions || [],
    quiz_result: item.quizResult || null,
  };
}

// Convert DB StudyLog row to frontend StudyLog
export function mapStudyLogFromDb(row: any): StudyLog {
  return {
    id: row.id,
    studentId: row.student_id || 'student-1',
    subject: row.subject,
    topicId: row.topic_id || '',
    topicName: row.topic_name || '',
    correct: row.correct || 0,
    incorrect: row.incorrect || 0,
    blank: row.blank || 0,
    durationMinutes: row.duration_minutes || 0,
    logDate: row.log_date || new Date().toISOString().split('T')[0],
    createdAt: row.created_at || new Date().toISOString(),
    images: Array.isArray(row.images) ? row.images : [],
  };
}

export function mapStudyLogToDb(item: StudyLog): any {
  return {
    id: item.id,
    student_id: item.studentId || 'student-1',
    subject: item.subject,
    topic_id: item.topicId || '',
    topic_name: item.topicName || '',
    correct: item.correct,
    incorrect: item.incorrect,
    blank: item.blank,
    duration_minutes: item.durationMinutes,
    log_date: item.logDate,
    created_at: item.createdAt,
    images: item.images || [],
  };
}

// Convert DB Exam row to frontend ExamResult
export function mapExamFromDb(row: any): ExamResult {
  return {
    id: row.id,
    studentId: row.student_id || 'student-1',
    examName: row.exam_name,
    examDate: row.exam_date,
    totalNet: Number(row.total_net || 0),
    reportCardPath: row.report_card_path || undefined,
    subjects: Array.isArray(row.subjects) ? row.subjects : [],
  };
}

export function mapExamToDb(item: ExamResult): any {
  return {
    id: item.id,
    student_id: item.studentId || 'student-1',
    exam_name: item.examName,
    exam_date: item.examDate,
    total_net: item.totalNet,
    report_card_path: item.reportCardPath || null,
    subjects: item.subjects || [],
    created_at: new Date().toISOString(),
  };
}

// Convert DB Question row to frontend QuestionItem
export function mapQuestionFromDb(row: any): QuestionItem {
  return {
    id: row.id,
    studentId: row.student_id || 'student-1',
    subject: row.subject,
    topicId: row.topic_id || undefined,
    topicName: row.topic_name || undefined,
    note: row.note || '',
    status: row.status || 'pending',
    createdAt: row.created_at || new Date().toISOString(),
    resolvedAt: row.resolved_at || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    messages: Array.isArray(row.messages) ? row.messages : [],
  };
}

export function mapQuestionToDb(item: QuestionItem): any {
  return {
    id: item.id,
    student_id: item.studentId || 'student-1',
    subject: item.subject,
    topic_id: item.topicId || null,
    topic_name: item.topicName || null,
    note: item.note || '',
    status: item.status || 'pending',
    created_at: item.createdAt,
    resolved_at: item.resolvedAt || null,
    images: item.images || [],
    messages: item.messages || [],
  };
}

// Convert DB ChatMessage row to frontend ChatMessage
export function mapChatMessageFromDb(row: any): ChatMessage {
  return {
    id: row.id,
    studentId: row.student_id || 'student-1',
    role: row.role || 'user',
    content: row.content || '',
    createdAt: row.created_at || new Date().toISOString(),
    suggestedAction: row.suggested_action || undefined,
    topicRef: row.topic_ref || undefined,
  };
}

export function mapChatMessageToDb(item: ChatMessage): any {
  return {
    id: item.id,
    student_id: item.studentId || 'student-1',
    role: item.role,
    content: item.content,
    created_at: item.createdAt,
    suggested_action: item.suggestedAction || null,
    topic_ref: item.topicRef || null,
  };
}

// Convert DB AiReport row to frontend AiReport
export function mapAiReportFromDb(row: any): AiReport {
  return {
    id: row.id,
    studentId: row.student_id || 'student-1',
    weekStart: row.week_start || '',
    kind: row.kind || 'analysis',
    title: row.title || '',
    summary: row.summary || '',
    strengths: Array.isArray(row.strengths) ? row.strengths : [],
    weaknesses: Array.isArray(row.weaknesses) ? row.weaknesses : [],
    recommendations: Array.isArray(row.recommendations) ? row.recommendations : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapAiReportToDb(item: AiReport): any {
  return {
    id: item.id,
    student_id: item.studentId || 'student-1',
    week_start: item.weekStart,
    kind: item.kind || 'analysis',
    title: item.title,
    summary: item.summary,
    strengths: item.strengths || [],
    weaknesses: item.weaknesses || [],
    recommendations: item.recommendations || [],
    created_at: item.createdAt,
  };
}

// Safe database operations
export async function syncTaskToSupabase(task: TaskItem) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('tasks').upsert(mapTaskToDb(task));
  } catch (err) {
    console.warn('Supabase task sync failed:', err);
  }
}

export async function deleteTaskFromSupabase(taskId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('tasks').delete().eq('id', taskId);
  } catch (err) {
    console.warn('Supabase task delete failed:', err);
  }
}

export async function syncStudyLogToSupabase(log: StudyLog) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('study_logs').upsert(mapStudyLogToDb(log));
  } catch (err) {
    console.warn('Supabase study_log sync failed:', err);
  }
}

export async function deleteStudyLogFromSupabase(logId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('study_logs').delete().eq('id', logId);
  } catch (err) {
    console.warn('Supabase study_log delete failed:', err);
  }
}

export async function syncExamToSupabase(exam: ExamResult) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('exams').upsert(mapExamToDb(exam));
  } catch (err) {
    console.warn('Supabase exam sync failed:', err);
  }
}

export async function deleteExamFromSupabase(examId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('exams').delete().eq('id', examId);
  } catch (err) {
    console.warn('Supabase exam delete failed:', err);
  }
}

export async function syncQuestionToSupabase(question: QuestionItem) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('questions').upsert(mapQuestionToDb(question));
  } catch (err) {
    console.warn('Supabase question sync failed:', err);
  }
}

export async function syncChatMessageToSupabase(msg: ChatMessage) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('chat_messages').upsert(mapChatMessageToDb(msg));
  } catch (err) {
    console.warn('Supabase chat message sync failed:', err);
  }
}

export async function syncAiReportToSupabase(report: AiReport) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('ai_reports').upsert(mapAiReportToDb(report));
  } catch (err) {
    console.warn('Supabase AI report sync failed:', err);
  }
}
