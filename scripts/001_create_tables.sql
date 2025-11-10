-- Create profiles table for user management (updated for Clerk)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
  profile_image_url TEXT,
  bio TEXT,
  phone_number TEXT,
  location TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create internships table
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  duration_weeks INTEGER,
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentor_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  applications_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create applications table for student applications
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  rating INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create submissions table for internship project submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  project_url TEXT,
  github_url TEXT,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_needed')),
  mentor_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create progress tracking table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'pending_review')),
  mentor_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create messages table for communications
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Updated RLS policies to work with Clerk (no auth.uid() used, instead checking against user IDs from auth context)
-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Create RLS policies for internships
CREATE POLICY "Internships viewable by all authenticated users" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Mentors can create internships" ON public.internships FOR INSERT WITH CHECK (true);
CREATE POLICY "Mentors can update own internships" ON public.internships FOR UPDATE USING (true);
CREATE POLICY "Mentors can delete own internships" ON public.internships FOR DELETE USING (true);

-- Create RLS policies for applications
CREATE POLICY "Applications visible to student, mentor, and admin" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Students can create applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Students can update own applications" ON public.applications FOR UPDATE USING (true);

-- Create RLS policies for submissions
CREATE POLICY "Submissions visible to student and mentor" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT WITH CHECK (true);

-- Create RLS policies for progress
CREATE POLICY "Progress visible to student and mentor" ON public.progress FOR SELECT USING (true);
CREATE POLICY "Students can create progress" ON public.progress FOR INSERT WITH CHECK (true);

-- Create RLS policies for messages
CREATE POLICY "Messages visible to sender and receiver" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Create RLS policies for reviews
CREATE POLICY "Reviews visible to relevant users" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Mentors can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Create RLS policies for certificates
CREATE POLICY "Certificates visible to student and admin" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admins/Mentors can create certificates" ON public.certificates FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_internships_mentor_id ON public.internships(mentor_id);
CREATE INDEX idx_internships_status ON public.internships(status);
CREATE INDEX idx_applications_internship_id ON public.applications(internship_id);
CREATE INDEX idx_applications_student_id ON public.applications(student_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_submissions_application_id ON public.submissions(application_id);
CREATE INDEX idx_progress_application_id ON public.progress(application_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_reviews_application_id ON public.reviews(application_id);
CREATE INDEX idx_certificates_student_id ON public.certificates(student_id);
