# Changelog

## 2.0.1

### Patch Changes

- e1198c7: Refactored wizard store to centralize advanced mode toggle logic and removed unused derived getters (`getPromptText`, `getCompressedData`). This ensures `total_steps` is updated atomically with `show_advanced`, preventing potential state inconsistencies.

## 2.0.0

### Major Changes

- 9d5ba9b: Add mobile web UI support with responsive layout and bottom sheet preview

### Patch Changes

- 65c1962: Improve Mixpanel event tracking by including device and OS in event names for better analytics segmentation

## 1.7.0

### Minor Changes

- 89a509f: Fix wizard step tracking with serializable Record type and resolve TanStack SSR serialization error

## 1.6.0

### Minor Changes

- 12fe817: Move step completion tracking to Zustand store and optimize component subscriptions with useShallow

## 1.5.0

### Minor Changes

- bed5ec9: Refactor WizardPreview into separate SharePage and WizardPage variants for better code separation. Remove console.log statements from generatePromptText and return empty string when user hasn't interacted.

## 1.4.0

### Minor Changes

- 1417c12: feat(wizard): add step tracking, latency logging, and remove demo routes

## 1.3.0

### Minor Changes

- 2ddde0e: feat(analytics): prefix mixpanel events with app version

## 1.2.0

### Minor Changes

- 6158dbd: docs(changeset): show preview in DWeb next to wizard; chore: dweb fixes 1; chore: dweb fixes 2; feat(analytics): split referer into chunks and enhance share page tracking; feat(analytics): granular event tracking and Sentry error logging;

## 1.1.0

### Minor Changes

- 7f1aca3: feat: changeset cli integration
- 2333256: show preview in DWeb next to wizard

### Patch Changes

- 26edf6e: changeset version
- 33ca578: og tags

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of Prompt Builder AI
- Interactive prompt wizard for creating AI prompts
- URL compression for shareable prompts
- Sentry integration for error tracking and performance monitoring
- Mixpanel analytics integration
- Session ID management
- Responsive UI with Tailwind CSS and Radix UI components

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A
