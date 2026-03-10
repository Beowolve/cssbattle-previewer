# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [3.0.4] - 2026-03-10

### Fixed

- Removed border radius from output and target previews to keep full target visibility.
- Added a minimum mobile editor height to prevent the code editor from collapsing to a single line.
- Improved touch interaction for slide/compare mode so the divider can be dragged smoothly on touch devices.
- Kept tool links in the mobile header between brand and theme switch with compact icon-only layout.
- Corrected Discord release webhook variable handling in CI.

## [3.0.3] - 2026-03-10

### Fixed

- Prevented output image rerenders when switching targets; output generation now only reacts to editor code changes.
- Updated Discord release notification workflow to use `curl` and `jq` with embed payload handling.
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
