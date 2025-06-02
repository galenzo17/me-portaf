# Contributor Guidelines

This repository contains a Qwik + Vite project written in TypeScript. Use the following conventions when contributing.

## Local setup

1. Install dependencies with `npm install`.
2. Start a dev server with `npm run dev`.
3. Build the production bundle with `npm run build`.

## Coding conventions

- Prefer `const` and `let` over `var` in `.ts` or `.js` files.
- Use backtick strings for concatenation.
- Iterate over arrays with `for...of` instead of `forEach`.
- Keep code and branch names in English.
- Look for similar implementations in the codebase before adding new ones.

## Pull requests

Use one of the following prefixes in PR titles depending on the change:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting-only commits
- `refactor:` for code refactoring
- `perf:` for performance improvements
- `test:` for adding or correcting tests
- `build:` for build or dependency changes
- `ci:` for CI configuration changes
- `chore:` for other changes not modifying src or test files
- `revert:` for revert commits

