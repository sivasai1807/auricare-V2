# Testing Guide for Auticare Healthcare Platform

This comprehensive guide covers all testing aspects of the Auticare platform, including unit tests, integration tests, and end-to-end (E2E) system tests.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Testing](#frontend-testing)
3. [Backend Testing](#backend-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Running Tests](#running-tests)
6. [Test Coverage](#test-coverage)
7. [Best Practices](#best-practices)

---

## Overview

The Auticare platform uses a comprehensive testing strategy:

- **Frontend Tests**: Vitest + React Testing Library
- **Backend Tests**: Pytest
- **E2E Tests**: Playwright
- **Coverage Tools**: V8 (Frontend), Pytest-cov (Backend)

### Testing Pyramid

```
        E2E Tests (System)
       /                  \
      /  Integration Tests  \
     /                        \
    /       Unit Tests         \
   /____________________________\
```

---

## Frontend Testing

### Framework: Vitest + React Testing Library

The frontend uses Vitest as the test runner with React Testing Library for component testing.

### Test Structure

```
src/
├── lib/
│   ├── utils.test.ts              # Unit tests for utilities
│   ├── chatbotApi.test.ts         # Unit tests for API service
│   └── supabase/
│       └── appointments.test.ts   # Unit tests for Supabase functions
├── components/
│   └── ui/
│       ├── button.test.tsx        # Component unit tests
│       └── input.test.tsx         # Component unit tests
└── test/
    ├── setup.ts                   # Test setup configuration
    └── integration/
        ├── auth.integration.test.ts         # Auth integration tests
        └── supabase.integration.test.ts     # Database integration tests
```

### Unit Tests

Unit tests focus on individual functions and components in isolation.

**Example: Testing Utility Functions**
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });
});
```

**Example: Testing Components**
```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests verify that multiple parts of the application work together correctly.

**Example: Authentication Integration Test**
```typescript
// src/test/integration/auth.integration.test.ts
describe('User Sign Up', () => {
  it('should successfully sign up a new user', async () => {
    const result = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.data?.user).toBeDefined();
  });
});
```

### Running Frontend Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- src/lib/utils.test.ts
```

---

## Backend Testing

### Framework: Pytest

The Python Flask API uses Pytest for comprehensive backend testing.

### Test Structure

```
src/autism_project/
├── tests/
│   ├── test_chatbot_functions.py    # Unit tests for chatbot logic
│   └── test_api_integration.py       # Integration tests for Flask API
├── pytest.ini                        # Pytest configuration
└── requirements-test.txt             # Test dependencies
```

### Installing Test Dependencies

```bash
cd src/autism_project

# Install test dependencies (requires pip)
pip install -r requirements-test.txt
```

**Test Dependencies:**
- pytest
- pytest-flask
- pytest-cov
- pytest-mock
- requests-mock

### Unit Tests

**Example: Testing Patient Data Retrieval**
```python
# tests/test_chatbot_functions.py
def test_search_by_id_exact_match(self, mock_csv_data):
    """Test searching patient by exact ID match"""
    from doctor_chatbot import search_by_id

    with patch('doctor_chatbot.csv_data', mock_csv_data):
        result = search_by_id('992')
        assert result is not None
        assert result['patient_id'] == '992'
```

**Example: Testing Query Classification**
```python
def test_classify_greeting(self):
    """Test classification of greeting messages"""
    state = ChatbotState(query="Hello", ...)
    result = classify_query_type(state)
    assert result["query_type"] == "greeting"
```

### Integration Tests

**Example: Testing Flask API Endpoints**
```python
# tests/test_api_integration.py
def test_doctor_chat_success(self, client):
    """Test successful doctor chat request"""
    payload = {
        'message': 'What are autism symptoms?',
        'history': []
    }
    response = client.post('/api/doctor/chat', json=payload)
    assert response.status_code == 200
```

### Running Backend Tests

```bash
cd src/autism_project

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_chatbot_functions.py

# Run specific test class
pytest tests/test_chatbot_functions.py::TestPatientDataRetrieval

# Run specific test
pytest tests/test_chatbot_functions.py::TestPatientDataRetrieval::test_search_by_id_exact_match

# Generate coverage report
pytest --cov=. --cov-report=html

# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration
```

### Test Markers

Tests are marked with custom markers for selective execution:

```python
@pytest.mark.unit
def test_unit_function():
    pass

@pytest.mark.integration
def test_integration_function():
    pass

@pytest.mark.slow
def test_slow_function():
    pass
```

---

## End-to-End Testing

### Framework: Playwright

E2E tests simulate real user interactions across the entire application stack.

### Test Structure

```
e2e/
├── auth.spec.ts            # Authentication flow tests
├── navigation.spec.ts      # Navigation tests
├── chatbot.spec.ts         # Chatbot functionality tests
└── appointments.spec.ts    # Appointments system tests
```

### System Tests

**Example: Authentication Flow**
```typescript
// e2e/auth.spec.ts
test('should navigate to auth page', async ({ page }) => {
  await page.goto('/');
  const signInButton = page.getByRole('link', { name: /sign in/i });
  await signInButton.click();
  await expect(page).toHaveURL(/.*auth/);
});
```

**Example: Chatbot Interaction**
```typescript
// e2e/chatbot.spec.ts
test('should allow typing in chatbot input', async ({ page }) => {
  await page.goto('/');
  const chatButton = page.locator('button[class*="chat"]').first();
  await chatButton.click();

  const input = page.locator('input[placeholder*="message"]').first();
  await input.fill('Hello');
  await expect(input).toHaveValue('Hello');
});
```

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests for specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Debug tests
npx playwright test --debug

# View test report
npx playwright show-report
```

### Test Configuration

E2E tests are configured in `playwright.config.ts`:

- **Base URL**: http://localhost:5173
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Retries**: 2 (in CI), 0 (locally)
- **Screenshots**: On failure
- **Traces**: On first retry

---

## Test Coverage

### Viewing Coverage Reports

**Frontend Coverage:**
```bash
npm run test:coverage

# Open HTML report
open coverage/index.html
```

**Backend Coverage:**
```bash
cd src/autism_project
pytest --cov=. --cov-report=html

# Open HTML report
open htmlcov/index.html
```

### Coverage Goals

- **Unit Tests**: >80% code coverage
- **Integration Tests**: >70% code coverage
- **E2E Tests**: Critical user flows

---

## Best Practices

### General Guidelines

1. **Write tests first** (TDD approach when possible)
2. **Keep tests simple** and focused on one thing
3. **Use descriptive test names** that explain what is being tested
4. **Arrange-Act-Assert** pattern for test structure
5. **Mock external dependencies** (APIs, databases)
6. **Test edge cases** and error conditions

### Frontend Testing Best Practices

```typescript
// ✅ Good: Descriptive test name
test('should display error message when email is invalid', () => {
  // test code
});

// ❌ Bad: Vague test name
test('email test', () => {
  // test code
});

// ✅ Good: Test user interaction
await user.type(input, 'test@example.com');

// ❌ Bad: Direct value assignment
input.value = 'test@example.com';

// ✅ Good: Test accessibility
const button = screen.getByRole('button', { name: /submit/i });

// ❌ Bad: Test implementation details
const button = screen.getByClassName('submit-btn');
```

### Backend Testing Best Practices

```python
# ✅ Good: Use fixtures for reusable test data
@pytest.fixture
def mock_csv_data(self):
    return pd.DataFrame({...})

# ✅ Good: Test both success and error cases
def test_search_by_id_exact_match(self):
    # Test success case
    pass

def test_search_by_id_not_found(self):
    # Test error case
    pass

# ✅ Good: Use context managers for patches
with patch('module.function') as mock:
    mock.return_value = 'test'
    result = function_under_test()
```

### E2E Testing Best Practices

```typescript
// ✅ Good: Wait for elements properly
await page.waitForTimeout(2000);
await expect(element).toBeVisible();

// ❌ Bad: Hard-coded waits without verification
await page.waitForTimeout(5000);

// ✅ Good: Use page.goto with base URL
await page.goto('/auth');

// ✅ Good: Handle conditional elements
if (await element.isVisible()) {
  await element.click();
}

// ✅ Good: Mock API responses for testing error handling
await page.route('**/api/chat', route => {
  route.fulfill({ status: 500, body: '{"error": "Server error"}' });
});
```

---

## Continuous Integration

### Running Tests in CI/CD

```bash
# Run all tests
npm test && npm run test:e2e

# With coverage
npm run test:coverage

# Python tests
cd src/autism_project && pytest --cov=.
```

### Test Pipeline Example

```yaml
# Example GitHub Actions workflow
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Coverage
  run: npm run test:coverage
```

---

## Troubleshooting

### Common Issues

**Frontend Tests:**
- **Issue**: Tests fail with "Cannot find module"
  - **Solution**: Ensure test setup file is configured in vitest.config.ts

- **Issue**: Component tests fail with "not wrapped in act()"
  - **Solution**: Use `await` with user interactions and state updates

**Backend Tests:**
- **Issue**: Import errors in test files
  - **Solution**: Ensure `sys.path.append()` is set correctly in test files

- **Issue**: Tests fail with "no module named pytest"
  - **Solution**: Install test dependencies: `pip install -r requirements-test.txt`

**E2E Tests:**
- **Issue**: Tests timeout waiting for elements
  - **Solution**: Increase timeout or verify element selectors

- **Issue**: "Executable doesn't exist" error
  - **Solution**: Run `npx playwright install`

---

## Summary

### Quick Test Commands

```bash
# Frontend
npm test                    # Run unit tests
npm run test:ui            # Run with UI
npm run test:coverage      # Generate coverage

# Backend
cd src/autism_project
pytest                     # Run all tests
pytest -v                  # Verbose output
pytest --cov=.            # With coverage

# E2E
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run with UI
npm run test:e2e:headed   # See browser
```

### Test Files Overview

**Frontend Unit Tests:**
- `src/lib/utils.test.ts`
- `src/lib/chatbotApi.test.ts`
- `src/lib/supabase/appointments.test.ts`
- `src/components/ui/button.test.tsx`
- `src/components/ui/input.test.tsx`

**Frontend Integration Tests:**
- `src/test/integration/auth.integration.test.ts`
- `src/test/integration/supabase.integration.test.ts`

**Backend Tests:**
- `src/autism_project/tests/test_chatbot_functions.py`
- `src/autism_project/tests/test_api_integration.py`

**E2E Tests:**
- `e2e/auth.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/chatbot.spec.ts`
- `e2e/appointments.spec.ts`

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Documentation](https://playwright.dev/)

---

**Last Updated**: October 27, 2025
