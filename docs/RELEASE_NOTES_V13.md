# NeuroTrace V1.3 — Image-first visual refinement

Production: https://neurotrace-ui-demo.vercel.app
GitHub: https://github.com/SuperMing24/neurotrace-ui-workflow

## Changes
- More faithful leaderboard: animated-style honors podium for top 3, individual medal/avatar, title pills, score glyphs, 20 scrollable rank rows, sticky sample user.
- Rich Echo Archive: neural illustration hero, research progress 87%, metrics, 5 illustrated sample records, statuses, reward markers, archive/fragments switch, search and sorting.
- The three original image-generation concept artworks remain stylistic references; text and interaction still use semantic HTML/CSS.
- Endpoint tool now selects an ORIGINAL skeleton segment through 2D projection of its actual 3D geometry, and displays only its S/E terminals. User-created edges remain independently selectable and deletable.
- Model vs imaging-style mode use identical synthetic XYZ skeleton data. Imaging mode is a stylized simulation, NOT source fluorescence microscopy.

## Testing
- scripts parsed; Chromium Playwright tests pass on desktop and mobile for original segment picking, both modes, leaderboard, archive search/tabs.
- Data are synthetic. Rankings, credits and archive statistics are illustrative only.

## Project maintenance
- Fully self-contained V1.3 index.html committed to this repository; source renderer also at src/scene3d.js.
- Original art and separate GUI WebP sources are preserved in design handoff ZIP; they have not all been pushed separately to GitHub.
- Vercel still uses direct API deployments, not Git-triggered CI. Neon cloud database is not provisioned.
