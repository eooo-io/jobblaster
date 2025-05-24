# Code Quality Guide

This guide explains how to maintain high code quality in the JobBlaster project using ESLint, Prettier, and TypeScript.

## 🛠️ Tools Setup

The project is configured with:

- **ESLint**: Identifies and fixes JavaScript/TypeScript issues
- **Prettier**: Formats code consistently
- **TypeScript**: Provides static type checking
- **EditorConfig**: Ensures consistent editor settings

## 🚀 Quick Commands

Use the code quality script for easy access to all tools:

```bash
# Show all available commands
./scripts/code-quality.sh help

# Check code for issues
./scripts/code-quality.sh lint

# Auto-fix linting issues
./scripts/code-quality.sh lint:fix

# Format code with Prettier
./scripts/code-quality.sh format

# Check if code is properly formatted
./scripts/code-quality.sh format:check

# Run TypeScript type checking
./scripts/code-quality.sh type:check

# Run all checks (recommended before commits)
./scripts/code-quality.sh check:all

# Fix all auto-fixable issues
./scripts/code-quality.sh fix:all
```

## 📋 Pre-commit Workflow

Before committing code, run:

```bash
./scripts/code-quality.sh check:all
```

This ensures:
- No ESLint errors or warnings
- Code is properly formatted
- TypeScript types are correct

## ⚙️ Configuration Files

### ESLint Configuration (`.eslintrc.json`)
- Extends recommended TypeScript and React configurations
- Includes import sorting and organization rules
- Configured for both frontend and backend code
- Special rules for test files

### Prettier Configuration (`.prettierrc`)
- 100 character line length
- 2-space indentation
- Semicolons enabled
- Double quotes for consistency
- LF line endings

### EditorConfig (`.editorconfig`)
- Consistent settings across all editors
- UTF-8 encoding
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

## 🎯 ESLint Rules Highlights

### React Rules
- Automatic JSX runtime (no need to import React)
- Hooks rules enforcement
- Component export validation

### TypeScript Rules
- Unused variables with underscore prefix allowed
- Explicit function return types optional
- Prefer const over let

### Import Rules
- Automatic import sorting and grouping
- No duplicate imports
- Proper import resolution

### Code Quality Rules
- No console.log (warnings, allows warn/error)
- No debugger statements
- Prefer arrow functions
- Consistent naming conventions

## 🔧 IDE Integration

### VS Code
Install these extensions for the best experience:
- ESLint
- Prettier - Code formatter
- EditorConfig for VS Code

Add to your VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Other Editors
Most modern editors support ESLint, Prettier, and EditorConfig through plugins.

## 🚨 Common Issues and Solutions

### ESLint Errors
```bash
# Auto-fix most issues
./scripts/code-quality.sh lint:fix

# For remaining issues, check the error messages and fix manually
```

### Formatting Issues
```bash
# Auto-format all files
./scripts/code-quality.sh format
```

### TypeScript Errors
- Check the TypeScript compiler output
- Ensure all imports have proper types
- Add type annotations where needed

### Import Order Issues
ESLint will automatically fix import order when running:
```bash
./scripts/code-quality.sh lint:fix
```

## 📝 Ignored Files

The following are automatically ignored:
- `node_modules/`
- `dist/` and `build/`
- Generated files
- Lock files (`package-lock.json`, etc.)
- Environment files (`.env*`)

## 🎨 Custom Rules

The configuration includes project-specific rules:

- Server files allow `console` statements
- Test files have relaxed type checking
- React components don't require explicit return types
- Import statements are automatically organized

## 🔄 CI/CD Integration

For continuous integration, add these commands to your pipeline:

```bash
# Install dependencies
npm ci

# Run all quality checks
./scripts/code-quality.sh check:all

# Run tests
npm test
```

## 💡 Tips for Better Code Quality

1. **Run checks frequently**: Use `check:all` before commits
2. **Fix as you go**: Don't accumulate quality debt
3. **Use IDE integration**: Real-time feedback is invaluable
4. **Follow conventions**: The tools enforce consistency
5. **Review configurations**: Adjust rules to fit team preferences

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Look at the ESLint/Prettier documentation
3. Run with `--help` flags for detailed options
4. Ask team members for assistance

Remember: These tools are here to help you write better code, not to slow you down!