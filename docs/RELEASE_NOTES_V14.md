# NeuroTrace V1.4 — Taurus constellation and graph interaction
Release date: 2026-11-02
Live: https://neurotrace-ui-demo.vercel.app
Deployment: dpl_8gJSY7y4LK34zmWNRpvSggd5eSjc
Source commit: fcfab52bdc3f094542f385753e36be15139abd86

## Changes
- AI-generated Taurus-themed illustrated starfield, as a real inline WebP asset in self-contained index.html. Artistic scene, not astronomically calibrated.
- 3D orientation X/Y/Z mini triad follows camera rotation.
- Direct endpoint picking at all times, no “末端” prerequisite. Invisible hitbox enlarged; small visual endpoint cues remain.
- Original segments and user-created edges can both be selected; “末端” is a read-only reveal of the selected line's endpoints.
- Original polyline graph built from shared 3D XYZ vertices. Prevent adding an edge when endpoints already connected through original segments, even through branch junctions. No 2D projection-crossing merges.
- Add, select, undo and delete user-created connections remain separate from immutable source geometry.
- Settings has actual original procedural ambient music via Web Audio API, explicitly initiated by user click. Optional local audio selected by the user (never uploaded). Copyrighted “Cornfield Chase” is NOT bundled; official publisher link is offered.
- The demonstration uses synthetic neural data; it is not the collaborator's actual APP.

## QA
Tested locally with Chromium / Playwright at 1450x980 and 390x844. Direct segment selection, topology block of original duplicates, adding/choosing/deleting new edge, terminal reveal, original audio on/off and image loading passed.

## Packaging
Full multi-file source, uncompressed image assets and visual test screenshots are maintained in the separately exported NeuroTrace_UI_v1.4 bundle. GitHub currently has the independently runnable self-contained production HTML plus docs; Git synchronization of the raw individual art files is pending.
