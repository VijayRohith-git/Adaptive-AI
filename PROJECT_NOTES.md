Project Notes

This document provides concise, project notes for the Adaptive UI. It describes implementation details, testing instructions, reproducibility steps, and known limitations.

- Project: Adaptive UI
- Author: Rohith Pamidi
- Last updated: 2026-08-12

Overview
- Short description: A local-first static web that adapts presentation (font size, contrast, layout density) using simple client-side heuristics based on interaction signals (click counts, seconds on page, and explicit controls).

Architecture and key files
- `index.html`: Static UI and control buttons (theme toggle, text size controls, reset, notes panel).
- `styles.css`: CSS variables and utility classes for `large-text`, `high-contrast`, and `compact-layout` modifiers.
- `app.js`: JavaScript controlling state, persistence, inference (`inferPreference()`), UI adaptation (`adapt()`), and notes loading/saving.
- `PROJECT_NOTES.md`: Instructor-facing project notes (this file).

Runtime behavior
- State object: `{ clicks, seconds, preference, textSize, theme }` persisted under the `localStorage.adaptiveState` key.
- Inference: heuristic rules compute a `preference` value which toggles CSS classes and adjusts `textSize`.
- Controls: users can override automatic adaptations using visible UI controls; control actions are excluded from click-count telemetry to avoid polluting signals.

How to run locally
1. In the project root folder, run:
   `python3 -m http.server 8000`
2. Open `http://localhost:8000` in your browser.
3. Use the top controls to toggle theme and text size. Click "Load Project Notes" in the UI to view this file.

Testing guidance
- Manual checks: verify the theme toggle, A+/A- text size buttons, and Reset button function, and that the notes panel loads `PROJECT_NOTES.md` when served.
- Persistence: confirm `localStorage.adaptiveState` updates after interactions and persists across reloads.
- Accessibility: run a keyboard navigation pass and a screen-reader check for dynamic content announcements. Add ARIA attributes where necessary.

Known limitations and future work
- Heuristics: the current approach is rule-based and may misclassify user needs for short sessions; consider a small on-device model (TensorFlow.js) for better personalization.
- Accessibility: improve ARIA roles, focus management, and test color contrast across themes for WCAG conformance.
- Testing: add automated e2e tests (Playwright) to validate control flows and persistence.

Privacy and data handling
- This records only local interaction signals in the browser's `localStorage`. No telemetry or data is sent to external services, and no personally-identifying information is collected.

Contact
- For questions about implementation or reproducibility steps, contact the author listed above.
