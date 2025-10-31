@echo off
REM Comprehensive Test Runner Script for Auricare Healthcare Platform (Windows)
REM This script provides organized test execution for different test types

setlocal enabledelayedexpansion

REM Colors for output (Windows doesn't support colors in batch, but we can use echo)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check prerequisites
:check_prerequisites
call :print_status "Checking prerequisites..."

REM Check Node.js and npm
node --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js is not installed. Please install Node.js first."
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    call :print_error "npm is not installed. Please install npm first."
    exit /b 1
)

REM Check Python and pip
python --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Python is not installed. Please install Python first."
    exit /b 1
)

pip --version >nul 2>&1
if errorlevel 1 (
    call :print_error "pip is not installed. Please install pip first."
    exit /b 1
)

call :print_success "All prerequisites are installed"
goto :eof

REM Function to install frontend dependencies
:install_frontend_deps
call :print_status "Installing frontend dependencies..."
cd Auricare-V2
call npm install
if errorlevel 1 (
    call :print_error "Failed to install frontend dependencies"
    exit /b 1
)
cd ..
call :print_success "Frontend dependencies installed"
goto :eof

REM Function to install backend dependencies
:install_backend_deps
call :print_status "Installing backend dependencies..."
cd Auricare-V2\src\autism_project

REM Install main dependencies
pip install -r requirements.txt
if errorlevel 1 (
    call :print_error "Failed to install main dependencies"
    exit /b 1
)

REM Install test dependencies
pip install -r requirements-test.txt
if errorlevel 1 (
    call :print_error "Failed to install test dependencies"
    exit /b 1
)

cd ..\..\..
call :print_success "Backend dependencies installed"
goto :eof

REM Function to run frontend unit tests
:run_frontend_unit_tests
call :print_status "Running frontend unit tests..."
cd Auricare-V2

REM Run unit tests only (excluding integration tests)
call npm test -- --run src/lib/utils.test.ts src/components/ui/button.test.tsx src/components/ui/input.test.tsx src/test/unit/
if errorlevel 1 (
    call :print_error "Frontend unit tests failed"
    exit /b 1
)

cd ..
call :print_success "Frontend unit tests completed"
goto :eof

REM Function to run frontend integration tests
:run_frontend_integration_tests
call :print_status "Running frontend integration tests..."
cd Auricare-V2

REM Run integration tests
call npm test -- --run src/test/integration/
if errorlevel 1 (
    call :print_error "Frontend integration tests failed"
    exit /b 1
)

cd ..
call :print_success "Frontend integration tests completed"
goto :eof

REM Function to run backend unit tests
:run_backend_unit_tests
call :print_status "Running backend unit tests..."
cd Auricare-V2\src\autism_project

REM Run only unit tests
pytest -m unit -v
if errorlevel 1 (
    call :print_error "Backend unit tests failed"
    exit /b 1
)

cd ..\..\..
call :print_success "Backend unit tests completed"
goto :eof

REM Function to run backend integration tests
:run_backend_integration_tests
call :print_status "Running backend integration tests..."
cd Auricare-V2\src\autism_project

REM Run only integration tests
pytest -m integration -v
if errorlevel 1 (
    call :print_error "Backend integration tests failed"
    exit /b 1
)

cd ..\..\..
call :print_success "Backend integration tests completed"
goto :eof

REM Function to run E2E tests
:run_e2e_tests
call :print_status "Running E2E system tests..."
cd Auricare-V2

REM Install Playwright browsers if not already installed
call npx playwright install
if errorlevel 1 (
    call :print_error "Failed to install Playwright browsers"
    exit /b 1
)

REM Run E2E tests
call npm run test:e2e
if errorlevel 1 (
    call :print_error "E2E tests failed"
    exit /b 1
)

cd ..
call :print_success "E2E tests completed"
goto :eof

REM Function to run all tests
:run_all_tests
call :print_status "Running all tests..."

call :run_frontend_unit_tests
if errorlevel 1 exit /b 1

call :run_frontend_integration_tests
if errorlevel 1 exit /b 1

call :run_backend_unit_tests
if errorlevel 1 exit /b 1

call :run_backend_integration_tests
if errorlevel 1 exit /b 1

call :run_e2e_tests
if errorlevel 1 exit /b 1

call :print_success "All tests completed successfully!"
goto :eof

REM Function to run tests with coverage
:run_tests_with_coverage
call :print_status "Running tests with coverage..."

REM Frontend coverage
cd Auricare-V2
call npm run test:coverage
if errorlevel 1 (
    call :print_error "Frontend coverage tests failed"
    exit /b 1
)
cd ..

REM Backend coverage
cd Auricare-V2\src\autism_project
pytest --cov=. --cov-report=html --cov-report=term
if errorlevel 1 (
    call :print_error "Backend coverage tests failed"
    exit /b 1
)
cd ..\..\..

call :print_success "Coverage reports generated"
call :print_status "Frontend coverage: Auricare-V2\coverage\index.html"
call :print_status "Backend coverage: Auricare-V2\src\autism_project\htmlcov\index.html"
goto :eof

REM Function to run specific test file
:run_specific_test
set "test_file=%~1"

if "%test_file%"=="" (
    call :print_error "Please specify a test file"
    exit /b 1
)

call :print_status "Running specific test: %test_file%"

if "%test_file:~-3%"==".ts" (
    REM Frontend test
    cd Auricare-V2
    call npm test -- --run "%test_file%"
    cd ..
) else if "%test_file:~-4%"==".tsx" (
    REM Frontend test
    cd Auricare-V2
    call npm test -- --run "%test_file%"
    cd ..
) else if "%test_file:~-3%"==".py" (
    REM Backend test
    cd Auricare-V2\src\autism_project
    pytest "%test_file%" -v
    cd ..\..\..
) else if "%test_file:~-7%"==".spec.ts" (
    REM E2E test
    cd Auricare-V2
    call npx playwright test "%test_file%"
    cd ..
) else (
    call :print_error "Unknown test file type: %test_file%"
    exit /b 1
)

call :print_success "Specific test completed"
goto :eof

REM Function to clean test artifacts
:clean_test_artifacts
call :print_status "Cleaning test artifacts..."

REM Clean frontend test artifacts
cd Auricare-V2
if exist coverage rmdir /s /q coverage
if exist node_modules\.vite rmdir /s /q node_modules\.vite
cd ..

REM Clean backend test artifacts
cd Auricare-V2\src\autism_project
if exist htmlcov rmdir /s /q htmlcov
if exist .pytest_cache rmdir /s /q .pytest_cache
if exist __pycache__ rmdir /s /q __pycache__
for /r . %%i in (*.pyc) do del "%%i"
cd ..\..\..

call :print_success "Test artifacts cleaned"
goto :eof

REM Function to show help
:show_help
echo Auricare Healthcare Platform Test Runner
echo.
echo Usage: %~nx0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   install                 Install all dependencies
echo   unit                    Run unit tests only
echo   integration             Run integration tests only
echo   e2e                     Run E2E system tests only
echo   all                     Run all tests
echo   coverage                Run tests with coverage reports
echo   specific ^<file^>         Run specific test file
echo   clean                   Clean test artifacts
echo   help                    Show this help message
echo.
echo Examples:
echo   %~nx0 install              # Install all dependencies
echo   %~nx0 unit                 # Run only unit tests
echo   %~nx0 integration          # Run only integration tests
echo   %~nx0 e2e                  # Run only E2E tests
echo   %~nx0 all                  # Run all tests
echo   %~nx0 coverage             # Run tests with coverage
echo   %~nx0 specific src\lib\utils.test.ts
echo   %~nx0 clean                # Clean test artifacts
goto :eof

REM Main script logic
if "%1"=="install" (
    call :check_prerequisites
    call :install_frontend_deps
    call :install_backend_deps
) else if "%1"=="unit" (
    call :check_prerequisites
    call :run_frontend_unit_tests
    call :run_backend_unit_tests
) else if "%1"=="integration" (
    call :check_prerequisites
    call :run_frontend_integration_tests
    call :run_backend_integration_tests
) else if "%1"=="e2e" (
    call :check_prerequisites
    call :run_e2e_tests
) else if "%1"=="all" (
    call :check_prerequisites
    call :run_all_tests
) else if "%1"=="coverage" (
    call :check_prerequisites
    call :run_tests_with_coverage
) else if "%1"=="specific" (
    call :check_prerequisites
    call :run_specific_test "%2"
) else if "%1"=="clean" (
    call :clean_test_artifacts
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else if "%1"=="" (
    call :show_help
) else (
    call :print_error "Unknown command: %1"
    call :show_help
    exit /b 1
)

endlocal
