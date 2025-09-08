@@ .. @@
 -- Create patients table
 CREATE TABLE IF NOT EXISTS public.patients (
   id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
-  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
+  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
   patient_name TEXT NOT NULL,
   username TEXT NOT NULL,
   date_of_birth DATE,