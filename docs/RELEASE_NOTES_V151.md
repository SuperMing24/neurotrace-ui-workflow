# NeuroTrace V1.5.1 — 2026-11-02

## Changes
- Shifted Taurus constellation background toward the center in portrait research view, preserving the 3D neural scene and controls.
- Overall (总榜) #1 **四七 / 破壁人**, #2 **小王 / 面壁者**. Consistent in podium, ranked list, and personal rank.
- A single FLAC audio source at `assets/music/check1.flac` starts by default, loops, and can be toggled in Settings. Audible autoplay may be blocked until the first user gesture.

## Verification
- Chromium Playwright: leaderboard names/titles, FLAC decode and looping, pause/resume setting, page errors (passed).
- Vercel Production deployment **dpl_FSRXAN96P76ibLfNU8BSuBEVaQZo**: READY; includes `index.html`, `workflow.html`, and `assets/music/check1.flac` with SHA1 `77069e8d69ed5841a2556ba22ce5a0392a8ef64f`.
- URL: https://neurotrace-ui-demo.vercel.app

## Asset/source boundaries
- The music was uploaded and marked as publicly usable by the user; publishing rights were not independently verified.
- Production audio currently lives as a Vercel deployment asset; the binary FLAC has **not** been committed to the GitHub repository by this connector.
- The source reference points to the public audio path. For local builds, supply the identical file at `assets/music/check1.flac` or use the delivered V1.5.1 asset package.
- All neuronal samples remain synthetic, and edit results remain browser-local.
