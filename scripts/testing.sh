#!/bin/bash

# JobBlaster Testing Utilities
# Comprehensive testing scripts for all test types

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Help function
show_help() {
    echo -e "${BLUE}JobBlaster Testing Suite${NC}"
    echo -e "${BLUE}=======================${NC}"
    echo ""
    echo "Available commands:"
    echo "  unit              Run unit tests"
    echo "  integration       Run integration tests"
    echo "  e2e               Run end-to-end tests"
    echo "  all               Run all tests"
    echo "  watch             Run tests in watch mode"
    echo "  coverage          Run tests with coverage report"
    echo "  setup             Set up test database and environment"
    echo "  cleanup           Clean up test artifacts"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/testing.sh unit"
    echo "  ./scripts/testing.sh coverage"
    echo "  ./scripts/testing.sh setup"
}

# Setup test environment
run_setup() {
    print_info "Setting up test environment..."
    
    # Create test database if needed
    if [ ! -z "$TEST_DATABASE_URL" ]; then
        print_info "Using test database: $TEST_DATABASE_URL"
    else
        print_warning "TEST_DATABASE_URL not set, using in-memory storage for tests"
    fi
    
    # Ensure test directories exist
    mkdir -p test/fixtures
    mkdir -p coverage
    
    # Create test fixtures if they don't exist
    if [ ! -f "test/fixtures/sample-resume.json" ]; then
        print_info "Creating test fixtures..."
        cat > test/fixtures/sample-resume.json << 'EOF'
{
  "basics": {
    "name": "Test User",
    "label": "Software Developer",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "summary": "Test resume for automated testing",
    "location": {
      "city": "Test City",
      "countryCode": "US"
    }
  },
  "work": [
    {
      "company": "Test Company",
      "position": "Developer",
      "startDate": "2020-01-01",
      "summary": "Test work experience"
    }
  ],
  "skills": [
    {
      "name": "Programming",
      "keywords": ["JavaScript", "TypeScript", "React"]
    }
  ]
}
EOF
    fi
    
    print_status "Test environment setup completed!"
}

# Run unit tests
run_unit() {
    print_info "Running unit tests..."
    
    if npx vitest run --reporter=verbose --config vitest.config.ts; then
        print_status "Unit tests passed!"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

# Run integration tests
run_integration() {
    print_info "Running integration tests..."
    
    # Set test environment
    export NODE_ENV=test
    
    if npx vitest run --reporter=verbose --config vitest.config.ts test/**/*.integration.test.*; then
        print_status "Integration tests passed!"
    else
        print_error "Integration tests failed"
        exit 1
    fi
}

# Run end-to-end tests
run_e2e() {
    print_info "Running end-to-end tests..."
    print_warning "E2E tests require the application to be running"
    
    # Check if server is running
    if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_error "Server is not running on port 3000"
        echo "Please start the server with 'npm run dev' before running E2E tests"
        exit 1
    fi
    
    if npx vitest run --reporter=verbose --config vitest.config.ts test/**/*.e2e.test.*; then
        print_status "E2E tests passed!"
    else
        print_error "E2E tests failed"
        exit 1
    fi
}

# Run all tests
run_all() {
    print_info "Running complete test suite..."
    
    # Setup first
    run_setup
    
    # Run tests in order
    run_unit
    run_integration
    
    # Only run E2E if server is available
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        run_e2e
    else
        print_warning "Skipping E2E tests - server not running"
    fi
    
    print_status "All available tests completed successfully!"
}

# Run tests in watch mode
run_watch() {
    print_info "Starting test watch mode..."
    print_info "Tests will re-run automatically when files change"
    print_info "Press Ctrl+C to exit"
    
    npx vitest --reporter=verbose --config vitest.config.ts
}

# Run tests with coverage
run_coverage() {
    print_info "Running tests with coverage analysis..."
    
    if npx vitest run --coverage --reporter=verbose --config vitest.config.ts; then
        print_status "Coverage analysis completed!"
        print_info "Coverage report generated in coverage/ directory"
        
        # Try to open coverage report
        if command -v open >/dev/null 2>&1; then
            print_info "Opening coverage report..."
            open coverage/index.html
        elif command -v xdg-open >/dev/null 2>&1; then
            print_info "Opening coverage report..."
            xdg-open coverage/index.html
        else
            print_info "Coverage report available at coverage/index.html"
        fi
    else
        print_error "Coverage analysis failed"
        exit 1
    fi
}

# Clean up test artifacts
run_cleanup() {
    print_info "Cleaning up test artifacts..."
    
    # Remove coverage files
    rm -rf coverage/
    
    # Remove test logs
    rm -f test/*.log
    
    # Remove temporary test files
    rm -rf test/tmp/
    
    print_status "Test cleanup completed!"
}

# Main command handler
case "${1:-help}" in
    "unit")
        run_setup
        run_unit
        ;;
    "integration")
        run_setup
        run_integration
        ;;
    "e2e")
        run_setup
        run_e2e
        ;;
    "all")
        run_all
        ;;
    "watch")
        run_setup
        run_watch
        ;;
    "coverage")
        run_setup
        run_coverage
        ;;
    "setup")
        run_setup
        ;;
    "cleanup")
        run_cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac