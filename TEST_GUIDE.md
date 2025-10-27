# Testing Guide

This guide provides comprehensive instructions for running different types of tests in this project.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [System Tests](#system-tests)
5. [E2E Tests](#e2e-tests)
6. [Running Individual Tests](#running-individual-tests)
7. [Coverage Reports](#coverage-reports)
8. [CI/CD Integration](#cicd-integration)

---

## Test Structure

Tests are organized into the following folders:

```
src/test/
├── unit/               # Unit tests for individual functions/components
├── integration/        # Integration tests for multiple modules
├── system/             # System tests for complete workflows
└── setup.ts           # Test setup and configuration

e2e/                    # End-to-end tests using Playwright
├── appointments.spec.ts
├── auth.spec.ts
├── chatbot.spec.ts
└── navigation.spec.ts
```

### Test Types Explained

- **Unit Tests**: Test individual functions, components, or utilities in isolation
- **Integration Tests**: Test how multiple modules work together (e.g., API + Database)
- **System Tests**: Test complete user workflows from start to finish
- **E2E Tests**: Test the entire application in a real browser environment

---

## Unit Tests

Unit tests verify individual functions and components in isolation.

### Location
`src/test/unit/`

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode (auto-reruns on file changes)
npm run test:unit

# Run unit tests with UI interface
npm run test:unit:ui

# Run unit tests with coverage report
npm run test:unit:coverage
```

### Running a Specific Unit Test File

```bash
# Run a specific test file
npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts

# Run with pattern matching
npx vitest --config vitest.config.unit.ts --grep "cn function"
```

### Current Unit Tests

1. **utils.test.ts** - Tests for utility functions
   ```bash
   npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts
   ```

2. **chatbotApi.test.ts** - Tests for chatbot API service
   ```bash
   npx vitest --config vitest.config.unit.ts src/test/unit/chatbotApi.test.ts
   ```

3. **appointments.test.ts** - Tests for appointment functions
   ```bash
   npx vitest --config vitest.config.unit.ts src/test/unit/appointments.test.ts
   ```

4. **button.test.tsx** - Tests for Button component
   ```bash
   npx vitest --config vitest.config.unit.ts src/test/unit/button.test.tsx
   ```

5. **input.test.tsx** - Tests for Input component
   ```bash
   npx vitest --config vitest.config.unit.ts src/test/unit/input.test.tsx
   ```

### Running a Single Test Within a File

```bash
# Run a specific test by name
npx vitest --config vitest.config.unit.ts -t "should merge class names correctly"

# Run all tests in a describe block
npx vitest --config vitest.config.unit.ts -t "cn function"
```

---

## Integration Tests

Integration tests verify how multiple modules work together.

### Location
`src/test/integration/`

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run integration tests with UI
npm run test:integration:ui

# Run integration tests with coverage
npm run test:integration:coverage
```

### Running a Specific Integration Test File

```bash
# Run authentication integration tests
npx vitest --config vitest.config.integration.ts src/test/integration/auth.integration.test.ts

# Run Supabase integration tests
npx vitest --config vitest.config.integration.ts src/test/integration/supabase.integration.test.ts
```

### Current Integration Tests

1. **auth.integration.test.ts** - Tests for authentication flows (9 tests)
   ```bash
   npx vitest --config vitest.config.integration.ts src/test/integration/auth.integration.test.ts
   ```

2. **supabase.integration.test.ts** - Tests for Supabase database operations (7 tests)
   ```bash
   npx vitest --config vitest.config.integration.ts src/test/integration/supabase.integration.test.ts
   ```

---

## System Tests

System tests verify complete user workflows from start to finish.

### Location
`src/test/system/`

### Running System Tests

```bash
# Run all system tests
npm run test:system

# Run system tests with UI
npm run test:system:ui

# Run system tests with coverage
npm run test:system:coverage
```

### Running a Specific System Test File

```bash
# Run a specific system test file
npx vitest --config vitest.config.system.ts src/test/system/[filename].test.ts
```

### Creating System Tests

System tests should test complete workflows, for example:
- User registration → login → booking appointment → logout
- Doctor viewing appointments → updating status → viewing patient details

---

## E2E Tests

End-to-end tests run in real browsers using Playwright.

### Location
`e2e/`

### Running E2E Tests

```bash
# Run all e2e tests (headless mode)
npm run test:e2e

# Run e2e tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run e2e tests in headed mode (see the browser)
npm run test:e2e:headed

# Run e2e tests in debug mode
npm run test:e2e:debug
```

### Running a Specific E2E Test File

```bash
# Run authentication e2e tests
npx playwright test e2e/auth.spec.ts

# Run appointments e2e tests
npx playwright test e2e/appointments.spec.ts

# Run chatbot e2e tests
npx playwright test e2e/chatbot.spec.ts

# Run navigation e2e tests
npx playwright test e2e/navigation.spec.ts
```

### Running a Single E2E Test

```bash
# Run a specific test by name
npx playwright test -g "should login successfully"

# Run tests in a specific file with a pattern
npx playwright test e2e/auth.spec.ts -g "login"
```

### Current E2E Tests

1. **auth.spec.ts** - Authentication flow tests
   ```bash
   npx playwright test e2e/auth.spec.ts
   ```

2. **appointments.spec.ts** - Appointment management tests
   ```bash
   npx playwright test e2e/appointments.spec.ts
   ```

3. **chatbot.spec.ts** - Chatbot functionality tests
   ```bash
   npx playwright test e2e/chatbot.spec.ts
   ```

4. **navigation.spec.ts** - Navigation and routing tests
   ```bash
   npx playwright test e2e/navigation.spec.ts
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
npx vitest --config vitest.config.system.ts src/test/system/[filename].test.ts

# E2E test
npx playwright test e2e/auth.spec.ts
```

### By Test Name

```bash
# Vitest tests (unit, integration, system)
npx vitest --config vitest.config.unit.ts -t "test name here"

# Playwright tests (e2e)
npx playwright test -g "test name here"
```

### By Pattern Matching

```bash
# Run all tests matching a pattern (Vitest)
npx vitest --config vitest.config.unit.ts --grep "button"

# Run all tests matching a pattern (Playwright)
npx playwright test -g "login"
```

---

## Coverage Reports

### Generating Coverage Reports

```bash
# Unit test coverage
npm run test:unit:coverage

# Integration test coverage
npm run test:integration:coverage

# System test coverage
npm run test:system:coverage

# All tests coverage
npm run test:coverage
```

### Viewing Coverage Reports

Coverage reports are generated in the following locations:
- Unit tests: `./coverage/unit/`
- Integration tests: `./coverage/integration/`
- System tests: `./coverage/system/`
- All tests: `./coverage/`

Open `./coverage/[type]/index.html` in a browser to view the detailed coverage report.

---

## CI/CD Integration

### Running All Tests

```bash
# Run all test suites sequentially
npm run test:all
```

This command runs:
1. Unit tests
2. Integration tests
3. System tests
4. E2E tests

### Recommended CI Pipeline

```yaml
# Example GitHub Actions workflow
- name: Run Unit Tests
  run: npm run test:unit

- name: Run Integration Tests
  run: npm run test:integration

- name: Run System Tests
  run: npm run test:system

- name: Run E2E Tests
  run: npm run test:e2e

- name: Generate Coverage
  run: npm run test:coverage
```

---

## Quick Reference Commands

### Most Common Commands

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run system tests
npm run test:system

# Run e2e tests
npm run test:e2e

# Run all tests with coverage
npm run test:all

# Open test UI for development
npm run test:ui
npm run test:e2e:ui
```

### Debug Commands

```bash
# Debug a specific unit test
npx vitest --config vitest.config.unit.ts --inspect-brk src/test/unit/utils.test.ts

# Debug e2e test
npm run test:e2e:debug
```

---

## Writing New Tests

### Creating a New Unit Test

1. Create file in `src/test/unit/`
2. Import test utilities:
   ```typescript
   import { describe, it, expect } from 'vitest';
   ```
3. Write your tests
4. Run: `npm run test:unit`

### Creating a New Integration Test

1. Create file in `src/test/integration/`
2. Import test utilities and modules to test
3. Write integration scenarios
4. Run: `npm run test:integration`

### Creating a New System Test

1. Create file in `src/test/system/`
2. Write complete workflow tests
3. Run: `npm run test:system`

### Creating a New E2E Test

1. Create file in `e2e/` with `.spec.ts` extension
2. Import Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Write your tests
4. Run: `npm run test:e2e`

---

## Troubleshooting

### Tests Not Running

1. Ensure dependencies are installed: `npm install`
2. Check test file patterns match the config
3. Verify test files have correct imports

### E2E Tests Failing

1. Ensure dev server is not running (tests start their own server)
2. Check browser installation: `npx playwright install`
3. Run in headed mode to see what's happening: `npm run test:e2e:headed`

### Coverage Not Generating

1. Install coverage provider: `npm install -D @vitest/coverage-v8`
2. Check coverage configuration in vitest config files
3. Ensure test files are running successfully first

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)

---

**Last Updated**: 2025-10-27
