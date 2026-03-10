# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [3.0.2] - 2026-03-10

### Added

- Added deep-link support for target selection via URL query parameters across battle, daily, and custom modes.
- Added a "Copy Link" toolbar button to copy the current deep-link URL for sharing.

### Fixed

- Fixed release notes generation to include all commits between the previous release tag and the current tag.
- Fixed release workflow validation by removing invalid secret checks from workflow expressions and handling optional Discord webhook posting in script logic.
## [3.0.1] - 2026-03-10

### Added

- Added a GitHub Actions release workflow that uses git-cliff to publish GitHub Release Notes on tag push without uploading build artifacts.

### Fixed

- Kept the full diff overlay visible when Diff is enabled and no hover compare is active.
- Preserved the existing hover and Shift split-compare behavior while the cursor is inside the preview.
- Removed the 1px overlay shift by replacing border-based divider lines with pseudo-elements.
- Restored divider visibility with explicit stacking order for overlay image and divider line.

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
