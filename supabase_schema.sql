-- ==============================================================
-- LGS Takip Sistemi • Supabase SQL Tablo ve Güvenlik Şeması
-- Supabase Panelinde "SQL Editor" kısmına yapıştırıp "Run" butonuna basın.
-- ==============================================================

-- 1. GÖREVLER (Tasks)
create table if not exists public.tasks (
  id text primary key,
  student_id text not null default 'student-1',
  title text not null,
  subject text not null,
  topic_id text,
  topic_name text,
  target_count int default 0,
  source text default 'mentor',
  status text default 'active',
  is_completed boolean default false,
  completed_at timestamptz,
  target_date text,
  mentor_note text,
  task_type text default 'target',
  questions jsonb default '[]'::jsonb,
  quiz_result jsonb,
  created_at timestamptz default now()
);

-- 2. ÇALIŞMA KAYITLARI (Study Logs)
create table if not exists public.study_logs (
  id text primary key,
  student_id text not null default 'student-1',
  subject text not null,
  topic_id text,
  topic_name text,
  correct int default 0,
  incorrect int default 0,
  blank int default 0,
  duration_minutes int default 0,
  log_date text not null,
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 3. DENEME SINAVLARI (Exams)
create table if not exists public.exams (
  id text primary key,
  student_id text not null default 'student-1',
  exam_name text not null,
  exam_date text not null,
  total_net numeric(5,2) default 0,
  report_card_path text,
  subjects jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4. SORU MASASI / ÇÖZÜLEMEYEN SORULAR (Questions)
create table if not exists public.questions (
  id text primary key,
  student_id text not null default 'student-1',
  subject text not null,
  topic_id text,
  topic_name text,
  note text default '',
  status text default 'pending',
  images jsonb default '[]'::jsonb,
  messages jsonb default '[]'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- 5. AI SOHBET GEÇMİŞİ (Chat Messages)
create table if not exists public.chat_messages (
  id text primary key,
  student_id text not null default 'student-1',
  role text not null,
  content text not null,
  suggested_action text,
  topic_ref text,
  created_at timestamptz default now()
);

-- 6. AI RAPORLARI (Ai Reports)
create table if not exists public.ai_reports (
  id text primary key,
  student_id text not null default 'student-1',
  week_start text,
  kind text default 'analysis',
  title text not null,
  summary text not null,
  strengths jsonb default '[]'::jsonb,
  weaknesses jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- RLS (Row Level Security) Etkinleştirme ve Herkese Açık Okuma/Yazma Politikaları
alter table public.tasks enable row level security;
alter table public.study_logs enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_reports enable row level security;

create policy "Public Access Tasks" on public.tasks for all using (true) with check (true);
create policy "Public Access StudyLogs" on public.study_logs for all using (true) with check (true);
create policy "Public Access Exams" on public.exams for all using (true) with check (true);
create policy "Public Access Questions" on public.questions for all using (true) with check (true);
create policy "Public Access ChatMessages" on public.chat_messages for all using (true) with check (true);
create policy "Public Access AiReports" on public.ai_reports for all using (true) with check (true);

-- Realtime Dinleme (Öğrenci veri girince Mentor'ün anında görmesi için)
alter publication supabase_realtime add table public.tasks, public.study_logs, public.exams, public.questions, public.chat_messages;
