# New conversation / Codex handoff
1. Read README.md and docs/PROJECT_STATUS.md; inspect repo files and latest commit.
2. Compare GitHub source against public Vercel version. Do not assume automatic sync.
3. Recover original V1.2 multi-file source, images, and tests from 'NeuroTrace_GitHub_Ready_v1.2.zip' or 'NeuroTrace_Git_Baseline_v1.2.bundle'; do not force-push over history without reviewing the existing commits.
4. Establish GitHub to existing Vercel project link; retain neurotrace-ui-demo.vercel.app.
5. Connect Neon on FREE plan; apply db/migrations/001_demo_schema.sql only after confirming authorization, permissions, and the database target. Do not use anonymous publicly writable connections.
6. Simulated game has multiple tasks, synthetic skeleton vertices and per-task added edges with undo/delete/local storage.
7. Full design process: human brief -> image generation -> GUI cutout assets -> Web interactive prototype -> Playwright tests -> Vercel Preview -> approved Production.
