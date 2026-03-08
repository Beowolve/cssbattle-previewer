# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [3.0.0] - 2026-03-08

### Changed

- Completed a major rebuild of the app structure into modular domains under `src/packages/*`.
- Redesigned the workspace flow to focus on editing, previewing, and comparing CSSBattle outputs.
- Modernized the top-level app shell (header, tool links, and theme controls).
- Reworked target management with Battle/Daily mode handling, improved selection UX, and persistent local state.
- Consolidated Supabase-based target loading for battle and daily tables.
- Expanded built-in helper tools, including color and spacing/Unicode workflows.

### Technical

- Standardized on React 18 + Vite 5 + TypeScript with stricter project organization.
- Improved maintainability through separated packages for app, editor, preview, targets, tools, theme, and shared utilities.
