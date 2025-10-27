# Complete Testing Documentation

## Overview

This project has a comprehensive testing infrastructure with **66 passing tests** across 4 test types:

- **Unit Tests**: 37 tests (5 test files)
- **Integration Tests**: 21 tests (3 test files)
- **System Tests**: 8 tests (2 test files)
- **E2E Tests**: 4 test files

---

## Quick Start

```bash
# Run all test types
npm run test:all

# Run specific test type
npm run test:unit
npm run test:integration
npm run test:system
npm run test:e2e

# Run with UI
npm run test:unit:ui
npm run test:e2e:ui

# Run with coverage
npm run test:unit:coverage
```

---

## Test Structure

```
project/
├── src/test/
│   ├── unit/                      # Unit tests (37 tests)
│   │   ├── utils.test.ts
│   │   ├── chatbotApi.test.ts
│   │   ├── appointments.test.ts
│   │   ├── button.test.tsx
│   │   └── input.test.tsx
│   ├── integration/               # Integration tests (21 tests)
│   │   ├── auth.integration.test.ts
│   │   ├── supabase.integration.test.ts
│   │   └── doctors.integration.test.ts
│   └── system/                    # System tests (8 tests)
│       ├── appointment-workflow.system.test.ts
│       └── user-journey.system.test.ts
└── e2e/                          # E2E tests (4 files)
    ├── auth.spec.ts
    ├── appointments.spec.ts
    ├── chatbot.spec.ts
    └── navigation.spec.ts
```

---

## Running Individual Tests

### By File Path

```bash
# Unit test
npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts

# Integration test
npx vitest --config vitest.config.integration.ts src/test/integration/auth.integration.test.ts

# System test
npx vitest --config vitest.config.system.ts src/test/system/user-journey.system.test.ts

# E2E test
npx playwright test e2e/auth.spec.ts
```

### By Test Name

```bash
# Vitest (unit/integration/system)
npx vitest --config vitest.config.unit.ts -t "should merge class names correctly"

# Playwright (e2e)
npx playwright test -g "should login successfully"
```

### By Pattern

```bash
# Run all tests with "appointment" in the name
npx vitest --config vitest.config.unit.ts --grep "appointment"

# Run all e2e tests with "auth" in the name
npx playwright test -g "auth"
```

---

## Test Types Explained

### Unit Tests (37 tests)

**Purpose**: Test individual functions and components in isolation

**Location**: `src/test/unit/`

**Tests**:
- `utils.test.ts` (5 tests) - Utility function tests
- `chatbotApi.test.ts` (10 tests) - Chatbot API service tests
- `appointments.test.ts` (7 tests) - Appointment management tests
- `button.test.tsx` (9 tests) - Button component tests
- `input.test.tsx` (6 tests) - Input component tests

**Run**:
```bash
npm run test:unit

# Individual file
npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts

# With UI
npm run test:unit:ui

# With coverage
npm run test:unit:coverage
```

### Integration Tests (21 tests)

**Purpose**: Test how multiple modules work together

**Location**: `src/test/integration/`

**Tests**:
- `auth.integration.test.ts` (9 tests) - Authentication flow tests
- `supabase.integration.test.ts` (7 tests) - Supabase database tests
- `doctors.integration.test.ts` (5 tests) - Doctor profile management tests

**Run**:
```bash
npm run test:integration

# Individual file
npx vitest --config vitest.config.integration.ts src/test/integration/auth.integration.test.ts

# With UI
npm run test:integration:ui

# With coverage
npm run test:integration:coverage
```

### System Tests (8 tests)

**Purpose**: Test complete user workflows from start to finish

**Location**: `src/test/system/`

**Tests**:
- `appointment-workflow.system.test.ts` (4 tests)
  - Full appointment lifecycle
  - Patient booking workflow
  - Appointment cancellation
  - Status transitions

- `user-journey.system.test.ts` (4 tests)
  - Patient registration journey
  - Doctor login and review journey
  - User logout and cleanup
  - Error handling scenarios

**Run**:
```bash
npm run test:system

# Individual file
npx vitest --config vitest.config.system.ts src/test/system/appointment-workflow.system.test.ts

# With UI
npm run test:system:ui

# With coverage
npm run test:system:coverage
```

### E2E Tests (4 files)

**Purpose**: Test the entire application in a real browser

**Location**: `e2e/`

**Tests**:
- `auth.spec.ts` - Authentication flow in browser
- `appointments.spec.ts` - Appointment management UI
- `chatbot.spec.ts` - Chatbot interaction tests
- `navigation.spec.ts` - Navigation and routing tests

**Run**:
```bash
npm run test:e2e

# Individual file
npx playwright test e2e/auth.spec.ts

# With UI (recommended for development)
npm run test:e2e:ui

# See the browser (headed mode)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

---

## Code Comments for Customization

The codebase includes extensive comments to help you customize it:

### Key Files with Comments

#### 1. Supabase Client Configuration
**File**: `src/integrations/supabase/client.ts`

```typescript
// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================
// TODO: Replace these default values with your own Supabase credentials
// Get your credentials from: https://app.supabase.com/project/_/settings/api
```

#### 2. Chatbot API Configuration
**File**: `src/lib/chatbotApi.ts`

```typescript
// ============================================================================
// IMPORTANT CONFIGURATION:
// - The API_BASE_URL must match your Python backend server URL
// - Default: http://localhost:5000/api (for local development)
// - PRODUCTION: Update this URL to your deployed backend URL
// ============================================================================
```

#### 3. Appointment Management
**File**: `src/lib/supabase/appointments.ts`

```typescript
// ============================================================================
// CREATE APPOINTMENT
// ============================================================================
// PARAMETERS:
// @param payload.patient_id - UUID of the patient (from users table)
// @param payload.doctor_id - UUID of the doctor/therapist
// @param payload.date - Appointment date in format: YYYY-MM-DD
// @param payload.time - Appointment time in format: HH:MM:SS
// ============================================================================
```

#### 4. Doctor Profile Management
**File**: `src/lib/supabase/doctors.ts`

```typescript
// ============================================================================
// CUSTOMIZATION:
// - For production, remove localStorage logic and use auth tokens only
// - Update to match your authentication flow
// ============================================================================
```

---

## Test Coverage

Generate coverage reports to see which parts of your code are tested:

```bash
# Unit test coverage
npm run test:unit:coverage
# View report: ./coverage/unit/index.html

# Integration test coverage
npm run test:integration:coverage
# View report: ./coverage/integration/index.html

# System test coverage
npm run test:system:coverage
# View report: ./coverage/system/index.html

# All tests coverage
npm run test:coverage
# View report: ./coverage/index.html
```

---

## Test Data Setup

See `TEST_DATA_SETUP.md` for detailed instructions on:
- Setting up Supabase
- Creating test data
- Configuring environment variables
- Authentication setup
- Running tests with real data

Quick setup:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit with your Supabase credentials
nano .env

# 3. Run database migrations (via Supabase Dashboard or CLI)

# 4. Create test data (see TEST_DATA_SETUP.md for SQL scripts)

# 5. Run tests
npm run test:all
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Run system tests
        run: npm run test:system

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Failing Due to Supabase Connection

**Problem**: Tests fail with connection errors

**Solution**:
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure network connectivity

#### 2. Mock Issues in Tests

**Problem**: "mockReturnValue is not a function"

**Solution**:
- Ensure mocks are properly initialized
- Clear mocks in `beforeEach` blocks
- Check mock chain returns `this`

#### 3. E2E Tests Timing Out

**Problem**: E2E tests timeout or fail intermittently

**Solution**:
```bash
# Run with headed mode to see what's happening
npm run test:e2e:headed

# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds

# Run specific test to debug
npx playwright test e2e/auth.spec.ts --debug
```

#### 4. Chatbot API Tests Failing

**Problem**: Chatbot API tests fail

**Solution**:
- Ensure Python backend is running (for E2E tests)
- For unit tests, check mocks are configured
- Verify API_BASE_URL in `src/lib/chatbotApi.ts`

---

## Writing New Tests

### Creating a New Unit Test

```typescript
// src/test/unit/myFeature.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myFeature';

describe('My Feature', () => {
  it('should work correctly', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

Run:
```bash
npx vitest --config vitest.config.unit.ts src/test/unit/myFeature.test.ts
```

### Creating a New Integration Test

```typescript
// src/test/integration/myIntegration.integration.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { myIntegrationFunction } from '@/lib/myModule';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Integration Test: My Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate multiple modules', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    (supabase.from as any).mockReturnValue(mockChain);

    const result = await myIntegrationFunction();
    expect(result).toBeDefined();
  });
});
```

Run:
```bash
npx vitest --config vitest.config.integration.ts src/test/integration/myIntegration.integration.test.ts
```

### Creating a New System Test

```typescript
// src/test/system/myWorkflow.system.test.ts
import { describe, it, expect } from 'vitest';

describe('System Test: Complete Workflow', () => {
  it('should complete entire user journey', async () => {
    // Test complete workflow from start to finish
    // Step 1: User action
    // Step 2: System response
    // Step 3: Verification
  });
});
```

Run:
```bash
npx vitest --config vitest.config.system.ts src/test/system/myWorkflow.system.test.ts
```

### Creating a New E2E Test

```typescript
// e2e/myFeature.spec.ts
import { test, expect } from '@playwright/test';

test('should perform action in browser', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page.locator('h1')).toContainText('Expected Text');
});
```

Run:
```bash
npx playwright test e2e/myFeature.spec.ts
```

---

## Additional Resources

### Documentation Files

- `TEST_GUIDE.md` - Comprehensive testing guide
- `QUICK_TEST_REFERENCE.md` - Quick command reference
- `TEST_DATA_SETUP.md` - Database and test data setup
- `TESTING.md` - This file (complete testing documentation)

### External Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)

---

## Summary

### Current Test Status

✅ **66 Total Tests Passing**

| Test Type | Files | Tests | Status |
|-----------|-------|-------|--------|
| Unit | 5 | 37 | ✅ All Passing |
| Integration | 3 | 21 | ✅ All Passing |
| System | 2 | 8 | ✅ All Passing |
| E2E | 4 | - | ✅ Ready |

### Quick Commands

```bash
# Run everything
npm run test:all

# Run by type
npm run test:unit
npm run test:integration
npm run test:system
npm run test:e2e

# Run individual file
npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts
npx playwright test e2e/auth.spec.ts

# Debug
npm run test:unit:ui
npm run test:e2e:debug

# Coverage
npm run test:unit:coverage
```

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
**Status**: All tests passing ✅
