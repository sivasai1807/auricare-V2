# Comprehensive Testing Guide for Auricare Healthcare Platform

This guide provides detailed instructions for running different types of tests in the Auricare Healthcare Platform. The project uses a comprehensive testing strategy with unit tests, integration tests, and end-to-end (E2E) system tests.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Types Overview](#test-types-overview)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running Tests](#running-tests)
6. [Test Commands Reference](#test-commands-reference)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Quick Start

### For Windows Users:

```bash
# Install all dependencies
test-runner.bat install

# Run all tests
test-runner.bat all

# Run only unit tests
test-runner.bat unit

# Run only integration tests
test-runner.bat integration

# Run only E2E tests
test-runner.bat e2e
```

### For Linux/Mac Users:

```bash
# Make script executable
chmod +x test-runner.sh

# Install all dependencies
./test-runner.sh install

# Run all tests
./test-runner.sh all

# Run only unit tests
./test-runner.sh unit

# Run only integration tests
./test-runner.sh integration

# Run only E2E tests
./test-runner.sh e2e
```

---

## Test Types Overview

### 1. Unit Tests

**Purpose**: Test individual functions and components in isolation
**Frontend**: Vitest + React Testing Library
**Backend**: Pytest
**Scope**: Individual modules only

### 2. Integration Tests

**Purpose**: Test multiple components working together
**Frontend**: API calls + Database operations
**Backend**: API endpoints + Database connections
**Scope**: Modules + Database connections

### 3. System Tests (E2E)

**Purpose**: Test complete user workflows
**Framework**: Playwright
**Scope**: Complete system end-to-end

---

## Prerequisites

### Required Software:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

### Check Installation:

```bash
node --version
npm --version
python --version
pip --version
```

---

## Installation

### Option 1: Using Test Runner Scripts (Recommended)

```bash
# Windows
test-runner.bat install

# Linux/Mac
./test-runner.sh install
```

### Option 2: Manual Installation

```bash
# Frontend dependencies
cd Auricare-V2
npm install

# Backend dependencies
cd src/autism_project
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Option 3: Using npm Scripts

```bash
cd Auricare-V2
npm run test:install-deps
```

---

## Running Tests

### 1. Unit Tests Only

**Purpose**: Test individual modules in isolation

#### Frontend Unit Tests:

```bash
# Using test runner
./test-runner.sh unit  # Linux/Mac
test-runner.bat unit   # Windows

# Using npm scripts
npm run test:unit

# Using vitest directly
npm test -- --run src/lib/utils.test.ts src/components/ui/button.test.tsx src/components/ui/input.test.tsx src/test/unit/
```

#### Backend Unit Tests:

```bash
# Using test runner
./test-runner.sh unit  # Linux/Mac
test-runner.bat unit   # Windows

# Using npm scripts
npm run test:backend:unit

# Using pytest directly
cd src/autism_project
pytest -m unit -v
```

**What gets tested:**

- Individual utility functions
- Component rendering and behavior
- Chatbot helper functions
- Data validation functions
- Query classification logic

### 2. Integration Tests Only

**Purpose**: Test modules + database connections

#### Frontend Integration Tests:

```bash
# Using test runner
./test-runner.sh integration  # Linux/Mac
test-runner.bat integration   # Windows

# Using npm scripts
npm run test:integration

# Using vitest directly
npm test -- --run src/test/integration/
```

#### Backend Integration Tests:

```bash
# Using test runner
./test-runner.sh integration  # Linux/Mac
test-runner.bat integration   # Windows

# Using npm scripts
npm run test:backend:integration

# Using pytest directly
cd src/autism_project
pytest -m integration -v
```

**What gets tested:**

- Authentication flows
- API endpoint functionality
- Database operations
- Chatbot API integration
- Appointment management
- User role management

### 3. System Tests (E2E) Only

**Purpose**: Test complete system end-to-end

```bash
# Using test runner
./test-runner.sh e2e  # Linux/Mac
test-runner.bat e2e   # Windows

# Using npm scripts
npm run test:e2e

# Using playwright directly
npx playwright test
```

**What gets tested:**

- Complete user authentication flow
- Navigation between pages
- Chatbot interactions
- Appointment booking and management
- Cross-browser compatibility
- Mobile responsiveness

### 4. All Tests

```bash
# Using test runner
./test-runner.sh all  # Linux/Mac
test-runner.bat all   # Windows

# Using npm scripts
npm run test:all
```

---

## Test Commands Reference

### Frontend Test Commands

| Command                    | Purpose                    | Scope                 |
| -------------------------- | -------------------------- | --------------------- |
| `npm run test:unit`        | Run unit tests only        | Individual components |
| `npm run test:integration` | Run integration tests only | Components + API      |
| `npm run test:e2e`         | Run E2E tests only         | Complete system       |
| `npm run test:all`         | Run all frontend tests     | All frontend tests    |
| `npm run test:coverage`    | Run tests with coverage    | All tests + coverage  |
| `npm run test:watch`       | Run tests in watch mode    | All tests (watch)     |
| `npm run test:ui`          | Run tests with UI          | All tests (UI)        |

### Backend Test Commands

| Command                            | Purpose                    | Scope                |
| ---------------------------------- | -------------------------- | -------------------- |
| `npm run test:backend:unit`        | Run unit tests only        | Individual functions |
| `npm run test:backend:integration` | Run integration tests only | Functions + API      |
| `npm run test:backend`             | Run all backend tests      | All backend tests    |
| `npm run test:backend:coverage`    | Run tests with coverage    | All tests + coverage |

### E2E Test Commands

| Command                   | Purpose                  | Scope                     |
| ------------------------- | ------------------------ | ------------------------- |
| `npm run test:e2e`        | Run E2E tests            | Complete system           |
| `npm run test:e2e:ui`     | Run E2E tests with UI    | Complete system (UI)      |
| `npm run test:e2e:headed` | Run E2E tests in browser | Complete system (visible) |
| `npm run test:e2e:debug`  | Debug E2E tests          | Complete system (debug)   |

### Test Runner Script Commands

| Command                            | Purpose                    | Scope                |
| ---------------------------------- | -------------------------- | -------------------- |
| `./test-runner.sh install`         | Install all dependencies   | Setup                |
| `./test-runner.sh unit`            | Run unit tests only        | Individual modules   |
| `./test-runner.sh integration`     | Run integration tests only | Modules + DB         |
| `./test-runner.sh e2e`             | Run E2E tests only         | Complete system      |
| `./test-runner.sh all`             | Run all tests              | All tests            |
| `./test-runner.sh coverage`        | Run tests with coverage    | All tests + coverage |
| `./test-runner.sh specific <file>` | Run specific test file     | Single test          |
| `./test-runner.sh clean`           | Clean test artifacts       | Cleanup              |

---

## Running Specific Tests

### Run Specific Test File:

```bash
# Frontend test
./test-runner.sh specific src/lib/utils.test.ts
./test-runner.sh specific src/components/ui/button.test.tsx

# Backend test
./test-runner.sh specific tests/test_chatbot_functions.py
./test-runner.sh specific tests/test_api_integration.py

# E2E test
./test-runner.sh specific e2e/auth.spec.ts
./test-runner.sh specific e2e/chatbot.spec.ts
```

### Run Tests in Watch Mode:

```bash
# Frontend watch mode
npm run test:watch

# Backend watch mode
cd src/autism_project
pytest -f
```

---

## Coverage Reports

### Generate Coverage Reports:

```bash
# Using test runner
./test-runner.sh coverage  # Linux/Mac
test-runner.bat coverage   # Windows

# Using npm scripts
npm run test:coverage
npm run test:backend:coverage
```

### View Coverage Reports:

- **Frontend**: Open `Auricare-V2/coverage/index.html` in browser
- **Backend**: Open `Auricare-V2/src/autism_project/htmlcov/index.html` in browser

---

## Troubleshooting

### Common Issues and Solutions:

#### 1. "Command not found" errors

```bash
# Check if Node.js is installed
node --version

# Check if Python is installed
python --version

# Install missing dependencies
./test-runner.sh install
```

#### 2. Frontend test failures

```bash
# Clear node_modules and reinstall
cd Auricare-V2
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run lint
```

#### 3. Backend test failures

```bash
# Install Python dependencies
cd src/autism_project
pip install -r requirements.txt
pip install -r requirements-test.txt

# Check Python path
python -c "import sys; print(sys.path)"
```

#### 4. E2E test failures

```bash
# Install Playwright browsers
npx playwright install

# Run tests in headed mode to see what's happening
npm run test:e2e:headed
```

#### 5. Permission errors (Linux/Mac)

```bash
# Make test runner executable
chmod +x test-runner.sh

# Run with proper permissions
./test-runner.sh install
```

#### 6. Port conflicts

```bash
# Check if ports are in use
netstat -tulpn | grep :5173  # Frontend dev server
netstat -tulpn | grep :5000  # Backend API

# Kill processes if needed
pkill -f "vite"
pkill -f "python.*chatbot_api"
```

---

## Best Practices

### 1. Test Development Workflow

```bash
# 1. Write tests first (TDD)
# 2. Run unit tests frequently
npm run test:unit

# 3. Run integration tests before commits
npm run test:integration

# 4. Run E2E tests before deployment
npm run test:e2e

# 5. Check coverage
npm run test:coverage
```

### 2. Continuous Integration

```bash
# Run all tests in CI/CD pipeline
./test-runner.sh all

# Generate coverage reports
./test-runner.sh coverage
```

### 3. Debugging Tests

```bash
# Debug specific test
npm test -- --run src/lib/utils.test.ts

# Debug E2E test
npm run test:e2e:debug

# Run tests in watch mode
npm run test:watch
```

### 4. Performance Testing

```bash
# Run tests with timing
time ./test-runner.sh all

# Run specific performance tests
npm run test:backend:integration -- --durations=10
```

---

## Test File Structure

```
Auricare-V2/
├── src/
│   ├── test/
│   │   ├── unit/                    # Unit tests
│   │   │   ├── components.test.tsx
│   │   │   ├── hooks.test.tsx
│   │   │   └── pages.test.tsx
│   │   ├── integration/             # Integration tests
│   │   │   ├── auth.integration.test.tsx
│   │   │   └── appointments-chatbot.integration.test.tsx
│   │   └── setup.ts                 # Test setup
│   ├── lib/
│   │   ├── utils.test.ts           # Utility tests
│   │   ├── chatbotApi.test.ts      # API tests
│   │   └── supabase/
│   │       └── appointments.test.ts # Database tests
│   └── components/
│       └── ui/
│           ├── button.test.tsx      # Component tests
│           └── input.test.tsx       # Component tests
├── e2e/                            # E2E tests
│   ├── auth.spec.ts
│   ├── navigation.spec.ts
│   ├── chatbot.spec.ts
│   └── appointments.spec.ts
├── src/autism_project/
│   └── tests/                       # Backend tests
│       ├── test_chatbot_functions.py
│       ├── test_api_integration.py
│       ├── test_chatbot_functions_enhanced.py
│       └── test_api_integration_enhanced.py
├── test-runner.sh                   # Linux/Mac test runner
├── test-runner.bat                  # Windows test runner
└── TESTING.md                       # This guide
```

---

## Summary

### Quick Reference Commands:

```bash
# Setup
./test-runner.sh install

# Run Tests
./test-runner.sh unit          # Unit tests only
./test-runner.sh integration   # Integration tests only
./test-runner.sh e2e           # E2E tests only
./test-runner.sh all           # All tests

# Coverage
./test-runner.sh coverage

# Specific Tests
./test-runner.sh specific src/lib/utils.test.ts
./test-runner.sh specific tests/test_chatbot_functions.py

# Cleanup
./test-runner.sh clean
```

### Test Types Summary:

| Test Type       | Scope              | Purpose                                | Command                        |
| --------------- | ------------------ | -------------------------------------- | ------------------------------ |
| **Unit**        | Individual modules | Test functions/components in isolation | `./test-runner.sh unit`        |
| **Integration** | Modules + Database | Test components working together       | `./test-runner.sh integration` |
| **E2E**         | Complete system    | Test end-to-end user workflows         | `./test-runner.sh e2e`         |

---

**Last Updated**: January 15, 2025
**Version**: 2.0
