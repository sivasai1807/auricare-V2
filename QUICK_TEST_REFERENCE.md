# Quick Test Reference

## Run All Tests by Type

```bash
npm run test:unit              # Unit tests
npm run test:integration       # Integration tests
npm run test:system            # System tests
npm run test:e2e               # E2E tests
npm run test:all               # All tests sequentially
```

## Run Individual Test Files

### Unit Tests
```bash
npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts
npx vitest --config vitest.config.unit.ts src/test/unit/chatbotApi.test.ts
npx vitest --config vitest.config.unit.ts src/test/unit/appointments.test.ts
npx vitest --config vitest.config.unit.ts src/test/unit/button.test.tsx
npx vitest --config vitest.config.unit.ts src/test/unit/input.test.tsx
```

### Integration Tests
```bash
npx vitest --config vitest.config.integration.ts src/test/integration/auth.integration.test.ts
npx vitest --config vitest.config.integration.ts src/test/integration/supabase.integration.test.ts
```

### System Tests
```bash
npx vitest --config vitest.config.system.ts src/test/system/[filename].test.ts
```

### E2E Tests
```bash
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/appointments.spec.ts
npx playwright test e2e/chatbot.spec.ts
npx playwright test e2e/navigation.spec.ts
```

## Run Specific Tests by Name

```bash
# Vitest (unit/integration/system)
npx vitest --config vitest.config.unit.ts -t "test name"

# Playwright (e2e)
npx playwright test -g "test name"
```

## Run Tests with UI

```bash
npm run test:unit:ui
npm run test:integration:ui
npm run test:system:ui
npm run test:e2e:ui
```

## Run Tests with Coverage

```bash
npm run test:unit:coverage
npm run test:integration:coverage
npm run test:system:coverage
```

## Test Folder Structure

```
src/test/
├── unit/                      # Individual function/component tests
│   ├── utils.test.ts
│   ├── chatbotApi.test.ts
│   ├── appointments.test.ts
│   ├── button.test.tsx
│   └── input.test.tsx
├── integration/               # Multi-module integration tests
│   ├── auth.integration.test.ts
│   └── supabase.integration.test.ts
└── system/                    # Complete workflow tests

e2e/                          # End-to-end browser tests
├── auth.spec.ts
├── appointments.spec.ts
├── chatbot.spec.ts
└── navigation.spec.ts
```

## Configuration Files

- `vitest.config.ts` - Default vitest config (runs all tests)
- `vitest.config.unit.ts` - Unit tests only
- `vitest.config.integration.ts` - Integration tests only
- `vitest.config.system.ts` - System tests only
- `playwright.config.ts` - E2E tests configuration

## Common Scenarios

### Run a single test file in watch mode
```bash
npx vitest --config vitest.config.unit.ts src/test/unit/utils.test.ts
```

### Run tests matching a pattern
```bash
npx vitest --config vitest.config.unit.ts --grep "button"
npx playwright test -g "login"
```

### Debug E2E tests
```bash
npm run test:e2e:debug
npm run test:e2e:headed  # See the browser
```

### View coverage report
```bash
npm run test:unit:coverage
# Open ./coverage/unit/index.html in browser
```

For detailed documentation, see [TEST_GUIDE.md](./TEST_GUIDE.md)
