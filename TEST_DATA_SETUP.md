# Test Data Setup Guide

This guide explains how to set up test data for your application and provides instructions for customizing the codebase for your own use.

## Table of Contents

1. [Supabase Configuration](#supabase-configuration)
2. [Database Setup](#database-setup)
3. [Test Data Creation](#test-data-creation)
4. [Environment Variables](#environment-variables)
5. [Chatbot API Configuration](#chatbot-api-configuration)
6. [Authentication Setup](#authentication-setup)
7. [Running Tests with Real Data](#running-tests-with-real-data)

---

## Supabase Configuration

### 1. Create Your Own Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be provisioned
3. Navigate to Project Settings > API

### 2. Update Environment Variables

**Location**: `.env` file in the project root

```bash
# IMPORTANT: Replace these with your own Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to Find These Values:**
- **VITE_SUPABASE_URL**: Project Settings > API > Project URL
- **VITE_SUPABASE_ANON_KEY**: Project Settings > API > Project API keys > anon/public

### 3. Update the Client Configuration

**File**: `src/integrations/supabase/client.ts`

The file contains comments indicating where to update your credentials:

```typescript
// TODO: Replace these default values with your own Supabase credentials
// Get your credentials from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "your-default-url";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-default-key";
```

---

## Database Setup

### 1. Run Migrations

All database migrations are located in `supabase/migrations/`.

**Using Supabase CLI** (if you have it installed):
```bash
supabase db push
```

**Manual Setup** (via Supabase Dashboard):
1. Go to Supabase Dashboard > SQL Editor
2. Run each migration file in order (by filename/date)
3. Verify tables are created: Table Editor > View Tables

### 2. Required Tables

The application uses the following tables:

#### `doctors` Table
```sql
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id TEXT UNIQUE,  -- External ID like "DOC001"
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `patients` Table
```sql
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE,  -- External ID like "PAT001"
  name TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `appointments` Table
```sql
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  therapist_id UUID REFERENCES doctors(id),
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Test Data Creation

### 1. Create Sample Doctors

**Via SQL Editor in Supabase Dashboard:**

```sql
-- Insert sample doctors
INSERT INTO doctors (doctor_id, name, email, specialization) VALUES
('DOC001', 'Dr. Sarah Smith', 'dr.smith@hospital.com', 'Autism Specialist'),
('DOC002', 'Dr. John Jones', 'dr.jones@hospital.com', 'Child Psychology'),
('DOC003', 'Dr. Emily Brown', 'dr.brown@hospital.com', 'Behavioral Therapy');
```

### 2. Create Sample Patients

```sql
-- Insert sample patients
INSERT INTO patients (patient_id, name, email, date_of_birth) VALUES
('PAT001', 'Alice Johnson', 'alice@example.com', '2015-03-15'),
('PAT002', 'Bob Williams', 'bob@example.com', '2012-07-22'),
('PAT003', 'Charlie Davis', 'charlie@example.com', '2018-11-08');
```

### 3. Create Sample Appointments

```sql
-- Insert sample appointments
INSERT INTO appointments (patient_id, therapist_id, appointment_date, status, notes)
SELECT
  p.id,
  d.id,
  '2025-10-30 10:00:00'::timestamptz,
  'pending',
  'Initial consultation'
FROM patients p, doctors d
WHERE p.patient_id = 'PAT001' AND d.doctor_id = 'DOC001';

INSERT INTO appointments (patient_id, therapist_id, appointment_date, status, notes)
SELECT
  p.id,
  d.id,
  '2025-11-01 14:00:00'::timestamptz,
  'confirmed',
  'Follow-up session'
FROM patients p, doctors d
WHERE p.patient_id = 'PAT002' AND d.doctor_id = 'DOC002';
```

### 4. Verify Data

```sql
-- Check doctors
SELECT * FROM doctors;

-- Check patients
SELECT * FROM patients;

-- Check appointments with related data
SELECT
  a.id,
  a.appointment_date,
  a.status,
  p.name as patient_name,
  d.name as doctor_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.therapist_id = d.id;
```

---

## Environment Variables

### Complete `.env` File Example

```bash
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================================================
# CHATBOT API CONFIGURATION
# ============================================================================
# Default: http://localhost:5000/api (for local development)
# Update this if your Python backend runs on a different URL
VITE_CHATBOT_API_URL=http://localhost:5000/api
```

### Creating `.env` from `.env.example`

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

---

## Chatbot API Configuration

### 1. Update API Base URL

**File**: `src/lib/chatbotApi.ts`

Look for this section and update the URL:

```typescript
// ============================================================================
// IMPORTANT CONFIGURATION:
// - The API_BASE_URL must match your Python backend server URL
// - Default: http://localhost:5000/api (for local development)
// - PRODUCTION: Update this URL to your deployed backend URL
//
// TO CUSTOMIZE:
// 1. Change API_BASE_URL to your backend URL (e.g., https://your-api.com/api)
// 2. Ensure CORS is properly configured in your Python backend
// 3. Update environment variables if needed
// ============================================================================

const API_BASE_URL = "http://localhost:5000/api";  // CHANGE THIS
```

### 2. Start the Python Backend

```bash
cd src/autism_project

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the API server
python chatbot_api.py
```

The server should start on `http://localhost:5000`

---

## Authentication Setup

### 1. Demo Authentication (Current Setup)

The app currently uses localStorage for demo purposes:

**File**: `src/lib/supabase/doctors.ts`

```typescript
// CUSTOMIZATION:
// - For production, remove localStorage logic and use auth tokens only
// - Update to match your authentication flow
```

### 2. Create Test Users

**Via Supabase Dashboard**: Authentication > Users > Add User

Or **via SQL**:

```sql
-- Note: This inserts into auth.users (requires proper permissions)
-- Better to use Supabase Dashboard or signUp() function

-- Example using the signUp endpoint:
-- See: https://supabase.com/docs/reference/javascript/auth-signup
```

### 3. Role-Based Access

Users can have different roles: `patient`, `doctor`, or `user`

Set roles in `user_metadata`:

```typescript
await supabase.auth.signUp({
  email: 'doctor@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      role: 'doctor',
      doctor_id: 'DOC001'  // Link to doctors table
    }
  }
});
```

---

## Running Tests with Real Data

### 1. Unit Tests

Unit tests use mocks and don't require real data:

```bash
npm run test:unit
```

### 2. Integration Tests

Integration tests can be run against real Supabase:

**Setup**:
1. Update `.env` with your Supabase credentials
2. Ensure test data exists in database
3. Run tests:

```bash
npm run test:integration
```

### 3. System Tests

System tests simulate complete workflows:

```bash
npm run test:system
```

### 4. E2E Tests

E2E tests run against the real application:

**Requirements**:
- Dev server running (or specify base URL in `playwright.config.ts`)
- Test data in database
- Chatbot API running (if testing chatbot features)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## Important Notes for Customization

### Files That Need Updating for Your Project

1. **Supabase Configuration**
   - `.env` - Add your Supabase credentials
   - `src/integrations/supabase/client.ts` - Update default values

2. **API Configuration**
   - `src/lib/chatbotApi.ts` - Update API_BASE_URL

3. **Authentication Logic**
   - `src/lib/supabase/doctors.ts` - Remove localStorage logic for production
   - `src/lib/supabase/patients.ts` - Update if exists

4. **Database Schema**
   - Review migrations in `supabase/migrations/`
   - Customize tables as needed
   - Update TypeScript types if schema changes

### Security Best Practices

1. **Never commit credentials**:
   - Keep `.env` in `.gitignore`
   - Use `.env.example` as a template only

2. **Use environment variables**:
   - Always use `import.meta.env.VITE_*` for config
   - Never hardcode credentials

3. **Row Level Security (RLS)**:
   - Ensure RLS is enabled on all tables
   - Create appropriate policies for each role

4. **API Security**:
   - Use proper CORS configuration
   - Validate user permissions on backend
   - Never expose service role keys to frontend

---

## Troubleshooting

### Tests Failing

1. **Supabase connection errors**:
   - Verify `.env` credentials
   - Check network connectivity
   - Confirm Supabase project is active

2. **Missing test data**:
   - Run SQL scripts to create sample data
   - Check database using Supabase Table Editor

3. **Chatbot API errors**:
   - Ensure Python backend is running
   - Check API_BASE_URL in `chatbotApi.ts`
   - Verify CORS configuration

### Need Help?

- Check test output for detailed error messages
- Review `TEST_GUIDE.md` for testing instructions
- See code comments for customization hints
- Consult Supabase documentation: https://supabase.com/docs

---

**Last Updated**: 2025-10-27
