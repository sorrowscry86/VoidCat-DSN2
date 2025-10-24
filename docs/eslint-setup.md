# ESLint Configuration

## Overview

ESLint has been configured for the VoidCat-DSN v2.0 project with a baseline configuration that enforces ES Module standards, code quality, and style consistency.

## Configuration

The ESLint configuration is defined in `eslint.config.js` (flat config format, ESLint 9+).

### Key Features

- **ES Module Support**: Configured for ES2022 with `sourceType: 'module'`
- **Recommended Rules**: Includes `@eslint/js` recommended rule set
- **NO SIMULATIONS Alignment**: Rules support the project's integrity-first architecture
- **Test Support**: Special configuration for Mocha test files

### Rule Highlights

#### ES Module Standards
- `no-undef`: Error - Ensures all variables are defined
- `no-var`: Error - Enforces `const`/`let` over `var`
- `prefer-const`: Warning - Suggests `const` for immutable variables

#### Code Quality
- `eqeqeq`: Error - Enforces strict equality (`===` over `==`)
- `no-unused-vars`: Warning - Allows unused vars prefixed with `_`
- `no-empty`: Error - Disallows empty blocks (except catch blocks)

#### Style Consistency
- `semi`: Error - Requires semicolons
- `quotes`: Warning - Prefers single quotes
- `indent`: Warning - Enforces 2-space indentation
- `object-curly-spacing`: Warning - Requires spaces in object literals
- `comma-dangle`: Warning - No trailing commas

### Ignored Files

The following are automatically ignored:
- `node_modules/**`
- `coverage/**`
- `dist/**`, `build/**`
- `.git/**`, `.github/**`
- `.specstory/**`
- `docker/**`
- `*.md` (documentation files)

## Usage

### Run ESLint

```bash
# Lint all files
npm run lint

# Lint with auto-fix
npx eslint . --fix

# Lint specific files
npx eslint src/clones/beta/BetaClone.js
```

### Integration with Development

ESLint can be integrated into your development workflow:

1. **Pre-commit hooks**: Use husky or similar to run ESLint before commits
2. **IDE integration**: Install ESLint extension for your editor (VS Code, etc.)
3. **CI/CD**: Add `npm run lint` to your CI pipeline

### Handling Unused Variables

If you need to capture a variable but not use it (e.g., in error handlers), prefix it with underscore:

```javascript
// ❌ Triggers warning
try {
  await someOperation();
} catch (error) {
  // Not using error
}

// ✅ Correct
try {
  await someOperation();
} catch (_error) {
  // Error intentionally unused
}
```

## Dependencies

- `eslint`: ^9.x (latest)
- `@eslint/js`: ^9.x (recommended rules)

## Verification

After setup, the entire codebase passes linting with zero errors and zero warnings:

```bash
$ npm run lint
> eslint .
✅ No issues found
```

All 254 tests continue to pass with 95.01% coverage after ESLint fixes.

## Future Enhancements

Potential future improvements:

1. **TypeScript Support**: Add `@typescript-eslint` if TypeScript is adopted
2. **Import Order**: Add `eslint-plugin-import` for consistent import ordering
3. **Security Rules**: Add `eslint-plugin-security` for security best practices
4. **Complexity Metrics**: Enable complexity rules when codebase stabilizes
5. **Pre-commit Hook**: Set up Husky to run ESLint automatically before commits

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [ESLint Flat Config Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Project Architecture Guide](.github/copilot-instructions.md)

---

**Last Updated**: 2025-10-24  
**Status**: Baseline configuration complete and verified
