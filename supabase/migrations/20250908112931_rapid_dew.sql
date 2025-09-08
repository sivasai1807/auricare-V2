/*
  # Fix Healthcare Platform Database Tables

  1. New Tables
    - Additional tables for healthcare platform functionality
    - Fix foreign key relationships and constraints

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role

  3. Functions
    - Update trigger functions for automatic data management
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT DEFAULT 'General Medicine',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  username TEXT NOT NULL,
  date_of_birth DATE,
  medical_history TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_metrics table
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  recorded_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_videos table
CREATE TABLE IF NOT EXISTS public.learning_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_progress table
CREATE TABLE IF NOT EXISTS public.patient_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  symptom_count INTEGER DEFAULT 0,
  notes TEXT,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_time TEXT DEFAULT '5 min read',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
DROP POLICY IF EXISTS "Doctors can view their own data" ON public.doctors;
CREATE POLICY "Doctors can view their own data"
ON public.doctors FOR SELECT
USING (true);

-- RLS Policies for patients
DROP POLICY IF EXISTS "Patients can view their own data" ON public.patients;
CREATE POLICY "Patients can view their own data"
ON public.patients FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can insert their own data" ON public.patients;
CREATE POLICY "Patients can insert their own data"
ON public.patients FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update their own data" ON public.patients;
CREATE POLICY "Patients can update their own data"
ON public.patients FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can view all patients" ON public.patients;
CREATE POLICY "Doctors can view all patients"
ON public.patients FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'therapist'
));

-- RLS Policies for health_metrics
DROP POLICY IF EXISTS "Patients can view their own metrics" ON public.health_metrics;
CREATE POLICY "Patients can view their own metrics"
ON public.health_metrics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Patients can insert their own metrics" ON public.health_metrics;
CREATE POLICY "Patients can insert their own metrics"
ON public.health_metrics FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Doctors can view all metrics" ON public.health_metrics;
CREATE POLICY "Doctors can view all metrics"
ON public.health_metrics FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'therapist'
));

-- RLS Policies for learning_videos
DROP POLICY IF EXISTS "Everyone can view videos" ON public.learning_videos;
CREATE POLICY "Everyone can view videos"
ON public.learning_videos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Doctors can manage videos" ON public.learning_videos;
CREATE POLICY "Doctors can manage videos"
ON public.learning_videos FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'therapist'
));

-- RLS Policies for patient_progress
DROP POLICY IF EXISTS "Patients can view their own progress" ON public.patient_progress;
CREATE POLICY "Patients can view their own progress"
ON public.patient_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Patients can insert their own progress" ON public.patient_progress;
CREATE POLICY "Patients can insert their own progress"
ON public.patient_progress FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Doctors can view all progress" ON public.patient_progress;
CREATE POLICY "Doctors can view all progress"
ON public.patient_progress FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'therapist'
));

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for news_articles
DROP POLICY IF EXISTS "Everyone can view news articles" ON public.news_articles;
CREATE POLICY "Everyone can view news articles"
ON public.news_articles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage news articles" ON public.news_articles;
CREATE POLICY "Admins can manage news articles"
ON public.news_articles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample doctors
INSERT INTO public.doctors (doctor_id, name, email, specialization, password_hash) VALUES
('DOC001', 'Dr. Sarah Johnson', 'sarah.johnson@hospital.com', 'Cardiology', 'doctor123'),
('DOC002', 'Dr. Michael Chen', 'michael.chen@hospital.com', 'Neurology', 'doctor456'),
('DOC003', 'Dr. Emily Rodriguez', 'emily.rodriguez@hospital.com', 'Pediatrics', 'doctor789')
ON CONFLICT (doctor_id) DO NOTHING;

-- Insert sample learning videos
INSERT INTO public.learning_videos (title, description, category, video_url, duration, views) VALUES
('Introduction to Cardiology', 'Basic concepts and procedures in cardiology', 'Medical Education', 'https://example.com/video1', '15:30', 1250),
('Neurological Assessment Techniques', 'Comprehensive guide to neurological examinations', 'Medical Education', 'https://example.com/video2', '22:45', 890),
('Pediatric Care Best Practices', 'Essential practices for pediatric healthcare', 'Medical Education', 'https://example.com/video3', '18:20', 1100),
('Emergency Response Protocols', 'Critical emergency response procedures', 'Emergency Medicine', 'https://example.com/video4', '12:15', 2300),
('Patient Communication Skills', 'Effective communication with patients and families', 'Soft Skills', 'https://example.com/video5', '25:10', 1800)
ON CONFLICT DO NOTHING;

-- Insert sample news articles
INSERT INTO public.news_articles (title, excerpt, content, author, category, read_time, image_url) VALUES
(
  'Revolutionary AI-Powered Health Monitoring System Launched',
  'New breakthrough in personalized healthcare monitoring using artificial intelligence to predict health issues before they occur.',
  'A groundbreaking AI-powered health monitoring system has been launched, promising to revolutionize how we approach preventive healthcare. This innovative technology uses machine learning algorithms to analyze patient data in real-time, identifying potential health risks before symptoms appear. The system integrates with wearable devices and electronic health records to provide comprehensive health insights. Early trials have shown a 40% improvement in early disease detection rates. Healthcare providers can now offer more proactive care, potentially saving lives and reducing healthcare costs. The technology is being rolled out to major hospitals nationwide, with plans for international expansion next year.',
  'Dr. Sarah Johnson',
  'Technology',
  '5 min read',
  'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Telemedicine Adoption Reaches All-Time High',
  'Healthcare providers worldwide report unprecedented adoption rates of telemedicine services, improving patient access to care.',
  'The adoption of telemedicine has reached unprecedented levels, with a 300% increase in virtual consultations over the past year. This surge has been driven by improved technology, changing patient preferences, and the need for accessible healthcare. Patients in rural areas particularly benefit from this trend, gaining access to specialists previously unavailable in their regions. Healthcare providers report high satisfaction rates, with 85% of patients preferring virtual consultations for routine check-ups. The technology has also proven cost-effective, reducing overhead costs for healthcare facilities while maintaining quality care standards.',
  'Michael Chen',
  'Healthcare',
  '3 min read',
  'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Mental Health Support Through Digital Platforms',
  'Study shows significant improvement in patient outcomes when using digital mental health support platforms alongside traditional therapy.',
  'A comprehensive study involving 10,000 participants has demonstrated the effectiveness of digital mental health platforms in supporting traditional therapy. Patients using these platforms showed 60% faster improvement in anxiety and depression symptoms. The platforms offer 24/7 support, mood tracking, and personalized coping strategies. Mental health professionals can monitor patient progress in real-time and adjust treatment plans accordingly. The study also revealed that younger patients particularly benefit from these digital tools, with engagement rates exceeding 90% among users aged 18-35.',
  'Dr. Emily Rodriguez',
  'Mental Health',
  '7 min read',
  'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=800'
)
ON CONFLICT DO NOTHING;

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_videos_updated_at ON public.learning_videos;
CREATE TRIGGER update_learning_videos_updated_at
  BEFORE UPDATE ON public.learning_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();