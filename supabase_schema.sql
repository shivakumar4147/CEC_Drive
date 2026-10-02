-- ==========================================
-- CEC DRIVE - PRODUCTION SUPABASE DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User Roles: admin, uploader/lecturer, student)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'uploader', 'student')),
    
    -- Student Specific Fields
    usn TEXT,
    academic_year TEXT,
    department TEXT DEFAULT 'CSE',
    semester TEXT DEFAULT '5th Sem',
    section TEXT DEFAULT 'Sec A',
    
    -- Lecturer / Uploader Specific Fields
    course TEXT,
    
    -- Aesthetic & System Metadata
    initial TEXT,
    bg_color TEXT DEFAULT 'bg-blue-600',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AUTOMATIC SUPABASE AUTH TRIGGER
-- Automatically creates/upserts a public.profiles record whenever a user signs up/in via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        usn,
        academic_year,
        department,
        semester,
        section,
        course,
        initial,
        bg_color
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'usn',
        NEW.raw_user_meta_data->>'academic_year',
        COALESCE(NEW.raw_user_meta_data->>'department', 'CSE'),
        COALESCE(NEW.raw_user_meta_data->>'semester', '5th Sem'),
        COALESCE(NEW.raw_user_meta_data->>'section', 'Sec A'),
        NEW.raw_user_meta_data->>'course',
        UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', 'U'), 1, 1)),
        CASE 
            WHEN (NEW.raw_user_meta_data->>'role') = 'uploader' THEN 'bg-amber-600'
            WHEN (NEW.raw_user_meta_data->>'role') = 'admin' THEN 'bg-purple-600'
            ELSE 'bg-blue-600'
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        usn = EXCLUDED.usn,
        academic_year = EXCLUDED.academic_year,
        department = EXCLUDED.department,
        semester = EXCLUDED.semester,
        section = EXCLUDED.section,
        course = EXCLUDED.course,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FOLDERS TABLE (Hierarchical Directory: Year > Sem > Dept > Section > Subject)
CREATE TABLE IF NOT EXISTS public.folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES public.folders(id) ON DELETE CASCADE,
    file_count INTEGER DEFAULT 0,
    total_size TEXT DEFAULT '0 MB',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENTS TABLE (Academic Notes, PPTs, Exam Papers, Assignments)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date_added TEXT NOT NULL,
    raw_date DATE DEFAULT CURRENT_DATE,
    author_name TEXT NOT NULL,
    author_initial TEXT DEFAULT 'S',
    author_bg_color TEXT DEFAULT 'bg-purple-600',
    folder_id TEXT REFERENCES public.folders(id) ON DELETE SET NULL,
    size TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'doc', 'sheet', 'spec', 'presentation')),
    tag TEXT DEFAULT 'normal' CHECK (tag IN ('important', 'normal')),
    starred BOOLEAN DEFAULT FALSE,
    file_url TEXT,
    cloudinary_public_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS / NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT DEFAULT 'All Students',
    author_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FILES TABLE (Detailed Cloudinary Storage Metadata & Uploader Tracking)
CREATE TABLE IF NOT EXISTS public.files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    folder_id TEXT REFERENCES public.folders(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cloudinary_public_id TEXT NOT NULL,
    cloudinary_url TEXT NOT NULL,
    resource_type TEXT DEFAULT 'raw',
    mime_type TEXT DEFAULT 'application/pdf',
    file_size TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Read/Write Access Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated users full read/write for CEC Drive demonstration
CREATE POLICY "Public profiles policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public folders policy" ON public.folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public documents policy" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public announcements policy" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public files policy" ON public.files FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- SEED DATA (INITIAL ACADEMIC DIRECTORY & NOTES)
-- ==========================================

-- Seed Academic Years
INSERT INTO public.folders (id, name, parent_id, file_count, total_size) VALUES
('year-2026-27', '2026-2027', NULL, 0, '0 MB'),
('year-2025-26', '2025-2026', NULL, 5, '60.1 MB')
ON CONFLICT (id) DO NOTHING;

-- Seed 8 Semesters under 2025-2026
INSERT INTO public.folders (id, name, parent_id, file_count, total_size) VALUES
('sem-1', '1st Sem', 'year-2025-26', 0, '0 MB'),
('sem-2', '2nd Sem', 'year-2025-26', 0, '0 MB'),
('sem-3', '3rd Sem', 'year-2025-26', 0, '0 MB'),
('sem-4', '4th Sem', 'year-2025-26', 0, '0 MB'),
('sem-5', '5th Sem', 'year-2025-26', 5, '60.1 MB'),
('sem-6', '6th Sem', 'year-2025-26', 0, '0 MB'),
('sem-7', '7th Sem', 'year-2025-26', 0, '0 MB'),
('sem-8', '8th Sem', 'year-2025-26', 0, '0 MB')
ON CONFLICT (id) DO NOTHING;

-- Seed Departments under 5th Sem
INSERT INTO public.folders (id, name, parent_id, file_count, total_size) VALUES
('dept-cse', 'CSE', 'sem-5', 5, '60.1 MB'),
('dept-ece', 'ECE', 'sem-5', 0, '0 MB'),
('dept-me', 'ME', 'sem-5', 0, '0 MB'),
('dept-aids', 'AI & DS', 'sem-5', 0, '0 MB')
ON CONFLICT (id) DO NOTHING;

-- Seed Sections under CSE
INSERT INTO public.folders (id, name, parent_id, file_count, total_size) VALUES
('sec-cse-a', 'Section A', 'dept-cse', 5, '60.1 MB'),
('sec-cse-b', 'Section B', 'dept-cse', 0, '0 MB'),
('sec-cse-c', 'Section C', 'dept-cse', 0, '0 MB')
ON CONFLICT (id) DO NOTHING;

-- Seed Subject Folders under Section A
INSERT INTO public.folders (id, name, parent_id, file_count, total_size) VALUES
('folder-dbms', 'DBMS', 'sec-cse-a', 3, '24.5 MB'),
('folder-dbms-unit1', 'Unit 1 - ER Diagrams & SQL', 'folder-dbms', 2, '16.1 MB'),
('folder-dbms-unit2', 'Unit 2 - Relational Algebra', 'folder-dbms', 1, '8.4 MB'),
('folder-cn', 'Computer Networks', 'sec-cse-a', 2, '14.8 MB'),
('folder-cn-ppt', 'CN Unit 3 Presentations', 'folder-cn', 1, '6.7 MB'),
('folder-daa', 'DAA', 'sec-cse-a', 1, '18.9 MB'),
('folder-se', 'Software Engineering', 'sec-cse-a', 0, '0 MB'),
('folder-web', 'Web Technology', 'sec-cse-a', 0, '0 MB')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Academic Documents
INSERT INTO public.documents (id, name, date_added, raw_date, author_name, author_initial, author_bg_color, folder_id, size, type, tag, starred) VALUES
('doc-1', 'DBMS Complete Lecture Notes 2025', 'Mon, 25 Aug 2025', '2025-08-25', 'Prof. Sharma', 'S', 'bg-purple-600', 'folder-dbms-unit1', '14.2 MB', 'pdf', 'important', true),
('doc-2', 'ER Model & Normalization Problem Set', 'Fri, 01 Sep 2025', '2025-09-01', 'Shiva Student', 'S', 'bg-rose-500', 'folder-dbms-unit1', '1.9 MB', 'pdf', 'important', false),
('doc-3', 'Relational Algebra Notes & Cheat Sheet', 'Tue, 05 Sep 2025', '2025-09-05', 'Prof. Sharma', 'S', 'bg-fuchsia-600', 'folder-dbms-unit2', '8.4 MB', 'sheet', 'normal', false),
('doc-4', 'Computer Networks Unit 3 PPT Slides', 'Wed, 10 Sep 2025', '2025-09-10', 'Dr. Kumar', 'K', 'bg-sky-500', 'folder-cn-ppt', '6.7 MB', 'presentation', 'normal', false),
('doc-5', 'DAA Important Exam Questions & Solutions', 'Thu, 15 Sep 2025', '2025-09-15', 'Prof. Rao', 'R', 'bg-indigo-600', 'folder-daa', '18.9 MB', 'doc', 'important', false)
ON CONFLICT (id) DO NOTHING;
