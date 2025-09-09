-- Healthcare core schema: patients, doctors, appointments, videos
-- Safe to re-run checks

-- Enum for appointment status
DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  specialization text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  date date NOT NULL,
  time time without time zone NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Helper: map auth.user() to patient/doctor rows by user_id
CREATE OR REPLACE VIEW public.current_patient AS
  SELECT p.* FROM public.patients p WHERE p.user_id = auth.uid();
CREATE OR REPLACE VIEW public.current_doctor AS
  SELECT d.* FROM public.doctors d WHERE d.user_id = auth.uid();

-- patients policies
DO $$ BEGIN
  CREATE POLICY patients_owner_select ON public.patients
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY patients_owner_update ON public.patients
    FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY patients_insert_self ON public.patients
    FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- doctors policies
DO $$ BEGIN
  CREATE POLICY doctors_owner_select ON public.doctors
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY doctors_owner_update ON public.doctors
    FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY doctors_insert_self ON public.doctors
    FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- appointments policies: patient sees own, doctor sees own
DO $$ BEGIN
  CREATE POLICY appointments_patient_select ON public.appointments
    FOR SELECT USING (
      patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY appointments_doctor_select ON public.appointments
    FOR SELECT USING (
      doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY appointments_patient_insert ON public.appointments
    FOR INSERT WITH CHECK (
      patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY appointments_doctor_update ON public.appointments
    FOR UPDATE USING (
      doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- videos policies: only owning doctor
DO $$ BEGIN
  CREATE POLICY videos_doctor_select ON public.videos
    FOR SELECT USING (
      doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY videos_doctor_mutate ON public.videos
    FOR ALL USING (
      doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    ) WITH CHECK (
      doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('doctor-videos','doctor-videos', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow doctor to manage own folder doctor_id/*, public read
DO $$ BEGIN
  CREATE POLICY "Public read videos" ON storage.objects FOR SELECT
    USING (bucket_id = 'doctor-videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Doctor write own videos" ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'doctor-videos' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.doctors WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Doctor update own videos" ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'doctor-videos' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.doctors WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Doctor delete own videos" ON storage.objects FOR DELETE
    USING (
      bucket_id = 'doctor-videos' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.doctors WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


