#!/bin/bash

# Comprehensive Test Runner Script for Auricare Healthcare Platform
# This script provides organized test execution for different test types

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js and npm
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Python and pip
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    if ! command_exists pip; then
        print_error "pip is not installed. Please install pip first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd Auricare-V2
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Function to install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd Auricare-V2/src/autism_project
    
    # Install main dependencies
    pip install -r requirements.txt
    
    # Install test dependencies
    pip install -r requirements-test.txt
    
    cd ../../..
    print_success "Backend dependencies installed"
}

# Function to run frontend unit tests
run_frontend_unit_tests() {
    print_status "Running frontend unit tests..."
    cd Auricare-V2
    
    # Run unit tests only (excluding integration tests)
    npm test -- --run src/lib/utils.test.ts src/components/ui/button.test.tsx src/components/ui/input.test.tsx src/test/unit/
    
    cd ..
    print_success "Frontend unit tests completed"
}

# Function to run frontend integration tests
run_frontend_integration_tests() {
    print_status "Running frontend integration tests..."
    cd Auricare-V2
    
    # Run integration tests
    npm test -- --run src/test/integration/
    
    cd ..
    print_success "Frontend integration tests completed"
}

# Function to run backend unit tests
run_backend_unit_tests() {
    print_status "Running backend unit tests..."
    cd Auricare-V2/src/autism_project
    
    # Run only unit tests
    pytest -m unit -v
    
    cd ../../..
    print_success "Backend unit tests completed"
}

# Function to run backend integration tests
run_backend_integration_tests() {
    print_status "Running backend integration tests..."
    cd Auricare-V2/src/autism_project
    
    # Run only integration tests
    pytest -m integration -v
    
    cd ../../..
    print_success "Backend integration tests completed"
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E system tests..."
    cd Auricare-V2
    
    # Install Playwright browsers if not already installed
    npx playwright install
    
    # Run E2E tests
    npm run test:e2e
    
    cd ..
    print_success "E2E tests completed"
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    run_frontend_unit_tests
    run_frontend_integration_tests
    run_backend_unit_tests
    run_backend_integration_tests
    run_e2e_tests
    
    print_success "All tests completed successfully!"
}

# Function to run tests with coverage
run_tests_with_coverage() {
    print_status "Running tests with coverage..."
    
    # Frontend coverage
    cd Auricare-V2
    npm run test:coverage
    cd ..
    
    # Backend coverage
    cd Auricare-V2/src/autism_project
    pytest --cov=. --cov-report=html --cov-report=term
    cd ../../..
    
    print_success "Coverage reports generated"
    print_status "Frontend coverage: Auricare-V2/coverage/index.html"
    print_status "Backend coverage: Auricare-V2/src/autism_project/htmlcov/index.html"
}

# Function to run specific test file
run_specific_test() {
    local test_file="$1"
    
    if [[ -z "$test_file" ]]; then
        print_error "Please specify a test file"
        exit 1
    fi
    
    print_status "Running specific test: $test_file"
    
    if [[ "$test_file" == *".ts" || "$test_file" == *".tsx" ]]; then
        # Frontend test
        cd Auricare-V2
        npm test -- --run "$test_file"
        cd ..
    elif [[ "$test_file" == *".py" ]]; then
        # Backend test
        cd Auricare-V2/src/autism_project
        pytest "$test_file" -v
        cd ../../..
    elif [[ "$test_file" == *".spec.ts" ]]; then
        # E2E test
        cd Auricare-V2
        npx playwright test "$test_file"
        cd ..
    else
        print_error "Unknown test file type: $test_file"
        exit 1
    fi
    
    print_success "Specific test completed"
}

# Function to run tests in watch mode
run_tests_watch() {
    local test_type="$1"
    
    case "$test_type" in
        "frontend")
            print_status "Running frontend tests in watch mode..."
            cd Auricare-V2
            npm test -- --watch
            ;;
        "backend")
            print_status "Running backend tests in watch mode..."
            cd Auricare-V2/src/autism_project
            pytest -f
            ;;
        *)
            print_error "Please specify test type: frontend or backend"
            exit 1
            ;;
    esac
}

# Function to clean test artifacts
clean_test_artifacts() {
    print_status "Cleaning test artifacts..."
    
    # Clean frontend test artifacts
    cd Auricare-V2
    rm -rf coverage/
    rm -rf node_modules/.vite/
    cd ..
    
    # Clean backend test artifacts
    cd Auricare-V2/src/autism_project
    rm -rf htmlcov/
    rm -rf .pytest_cache/
    rm -rf __pycache__/
    find . -name "*.pyc" -delete
    cd ../../..
    
    print_success "Test artifacts cleaned"
}

# Function to show help
show_help() {
    echo "Auricare Healthcare Platform Test Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  install                 Install all dependencies"
    echo "  unit                    Run unit tests only"
    echo "  integration             Run integration tests only"
    echo "  e2e                     Run E2E system tests only"
    echo "  all                     Run all tests"
    echo "  coverage                Run tests with coverage reports"
    echo "  specific <file>         Run specific test file"
    echo "  watch <type>           Run tests in watch mode (frontend/backend)"
    echo "  clean                   Clean test artifacts"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install              # Install all dependencies"
    echo "  $0 unit                 # Run only unit tests"
    echo "  $0 integration          # Run only integration tests"
    echo "  $0 e2e                  # Run only E2E tests"
    echo "  $0 all                  # Run all tests"
    echo "  $0 coverage             # Run tests with coverage"
    echo "  $0 specific src/lib/utils.test.ts"
    echo "  $0 watch frontend       # Watch frontend tests"
    echo "  $0 clean                # Clean test artifacts"
}

# Main script logic
main() {
    case "${1:-help}" in
        "install")
            check_prerequisites
            install_frontend_deps
            install_backend_deps
            ;;
        "unit")
            check_prerequisites
            run_frontend_unit_tests
            run_backend_unit_tests
            ;;
        "integration")
            check_prerequisites
            run_frontend_integration_tests
            run_backend_integration_tests
            ;;
        "e2e")
            check_prerequisites
            run_e2e_tests
            ;;
        "all")
            check_prerequisites
            run_all_tests
            ;;
        "coverage")
            check_prerequisites
            run_tests_with_coverage
            ;;
        "specific")
            check_prerequisites
            run_specific_test "$2"
            ;;
        "watch")
            check_prerequisites
            run_tests_watch "$2"
            ;;
        "clean")
            clean_test_artifacts
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
