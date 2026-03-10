# Repository Guidelines

## Release Tagging

- Use `v*.*.*` tags for releases (example: `v3.0.1`).
- Do not create release tags without the `v` prefix.

## Versioning Before Release Commit/Push

- Before a release commit and push, update `CHANGELOG.md`.
- Before a release commit and push, update `package.json` to the target release version.
- Keep release metadata consistent across files (for npm projects, also keep `package-lock.json` aligned).

## Commit Message Convention

- Write commit messages according to the `cliff.toml` conventional commit groups.
- Use prefixes like `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, and `chore`.
- Keep commit subjects clear, imperative, and scoped where useful (example: `fix(preview): keep diff divider aligned`).

## Security

- Never commit passwords, API keys, tokens, private keys, credentials, secrets, or any other security-sensitive data to the repository under any circumstances.
- Use GitHub Secrets (or an equivalent secret manager) for all sensitive values required by CI/CD.

## Best Practices: Modern Coding Standards

- Follow current TypeScript and React best practices with strict typing and clear component boundaries.
- Prefer maintainable, readable, and testable code over quick fixes.
- Keep changes small, focused, and reviewable.
- Enforce quality gates: linting and type checks must pass before commit/push.
- Use clear naming, avoid dead code, and document non-obvious decisions briefly in code comments.
- Prioritize backward-compatible changes and explicit migration notes when behavior changes.