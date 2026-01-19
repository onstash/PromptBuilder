---
"builder-prompt-ai": minor
---

refactor(wizard): move mode state to store & fix validation; Migrated wizard mode state to global store for better persistence and access. Fixed SSR error by safe-guarding localStorage access. Corrected useWizardForm validation loop to cover all advanced steps.
