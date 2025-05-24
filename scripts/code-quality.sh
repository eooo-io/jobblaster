#!/bin/bash

# JobBlaster Code Quality Scripts
# Provides linting, formatting, and type checking commands

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
    echo -e "${BLUE}JobBlaster Code Quality Tools${NC}"
    echo -e "${BLUE}============================${NC}"
    echo ""
    echo "Available commands:"
    echo "  lint              Run ESLint to check for code issues"
    echo "  lint:fix          Run ESLint and automatically fix issues"
    echo "  format            Format code with Prettier"
    echo "  format:check      Check if code is properly formatted"
    echo "  type:check        Run TypeScript type checking"
    echo "  check:all         Run all checks (lint, format, types)"
    echo "  fix:all           Fix all auto-fixable issues"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/code-quality.sh lint"
    echo "  ./scripts/code-quality.sh fix:all"
}

# Lint command
run_lint() {
    print_info "Running ESLint..."
    if npx eslint . --ext .ts,.tsx,.js,.jsx --report-unused-disable-directives --max-warnings 0; then
        print_status "ESLint passed - no issues found!"
    else
        print_error "ESLint found issues. Run 'lint:fix' to auto-fix some issues."
        exit 1
    fi
}

# Lint fix command
run_lint_fix() {
    print_info "Running ESLint with auto-fix..."
    npx eslint . --ext .ts,.tsx,.js,.jsx --fix
    print_status "ESLint auto-fix completed!"
}

# Format command
run_format() {
    print_info "Formatting code with Prettier..."
    npx prettier --write .
    print_status "Code formatting completed!"
}

# Format check command
run_format_check() {
    print_info "Checking code formatting..."
    if npx prettier --check .; then
        print_status "Code is properly formatted!"
    else
        print_error "Code is not properly formatted. Run 'format' to fix."
        exit 1
    fi
}

# Type check command
run_type_check() {
    print_info "Running TypeScript type checking..."
    if npx tsc --noEmit; then
        print_status "TypeScript type checking passed!"
    else
        print_error "TypeScript type checking failed."
        exit 1
    fi
}

# Check all command
run_check_all() {
    print_info "Running all code quality checks..."
    echo ""
    
    echo -e "${BLUE}1. Running ESLint...${NC}"
    run_lint
    echo ""
    
    echo -e "${BLUE}2. Checking code formatting...${NC}"
    run_format_check
    echo ""
    
    echo -e "${BLUE}3. Running TypeScript type checking...${NC}"
    run_type_check
    echo ""
    
    print_status "All code quality checks passed! 🎉"
}

# Fix all command
run_fix_all() {
    print_info "Running all auto-fixable improvements..."
    echo ""
    
    echo -e "${BLUE}1. Running ESLint with auto-fix...${NC}"
    run_lint_fix
    echo ""
    
    echo -e "${BLUE}2. Formatting code with Prettier...${NC}"
    run_format
    echo ""
    
    print_status "All auto-fixable issues have been resolved! 🎉"
    print_info "Run 'check:all' to verify everything is working correctly."
}

# Main command handler
case "${1:-help}" in
    "lint")
        run_lint
        ;;
    "lint:fix")
        run_lint_fix
        ;;
    "format")
        run_format
        ;;
    "format:check")
        run_format_check
        ;;
    "type:check")
        run_type_check
        ;;
    "check:all")
        run_check_all
        ;;
    "fix:all")
        run_fix_all
        ;;
    "help"|*)
        show_help
        ;;
esac