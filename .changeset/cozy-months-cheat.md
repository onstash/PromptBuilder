---
"builder-prompt-ai": patch
---

Refactored wizard store to centralize advanced mode toggle logic and removed unused derived getters (`getPromptText`, `getCompressedData`). This ensures `total_steps` is updated atomically with `show_advanced`, preventing potential state inconsistencies.
