# NeuroTrace V1.6 — Functional web prototype release

## Status
- Latest working prototype source: `index.html` + `scene3d.js` + `assets/`.
- Public visualization is a **synthetic example**, not the collaborator's actual mobile APP.
- Auth: default simulated user 四七; logout enters the login screen, demo login returns to the study page. Status stored locally. The WeChat / QQ controls are **integration entry points only**. No actual OAuth app registration, server-side callback or association has been performed. Never fake OAuth success.
- Shop: catalog illustrations generated specifically for the demo, including a stylized product *reference* named 沃集鲜芥末海苔味三文鱼脆片55g. These are NOT photographs or licensed official packshots. Costs, availability, brand reference, inventory and reward policy are illustrative only. Redemption deducts local demo points and creates a local-only sample order; **no orders are sent and no physical items are supplied**.
- 3D: synthetic segment endpoints with explicitly annotated `boundaryTerminals` represent task-box truncations and are selectable for inspection, but disallowed from connection; `末端` toggles their warning markers. Segments and other end-points are selectable without enabling the button.
- Camera: vertical pointer motion reversed compared with V1.5.1; pitch wraps through 360 degrees rather than clamping to ±1.48 radians. The fixed reset views remain available.
- Private/demo edits and shop orders use different browser localStorage keys. No Neon DB writes are attempted from this public site.

## Files and assets
- `scene3d.js` — source graph, camera, picking and boundary rules.
- `data/synthetic_tasks.json` — baseline graph samples, see note below.
- `data/catalog_v16.json` — staged catalog content.
- `assets/shop-*.webp` — 4 standalone AI-generated concept crops.
- `original-imagegen/shop-concept-board.png` — shop art generation output.
- `db/migrations/002_auth_shop_proposal.sql` — future DB design; **not applied**.
- `tests/verify_v16.py` — browser interaction smoke tests.
- `standalone.html` — self-contained HTML with inline images and scene source, plus existing music path.

## Next steps toward a real platform
- Web and native WeChat/QQ require independently approved provider app IDs and secure OAuth callback credentials, held in Vercel environment variables (never JS/source code).
- Multi-device persistence should use a protected Neon/PostgreSQL database and verified sessions, not public anonymous API writes.
- Physical redemptions need a staffed fulfillment workflow, inventory reconciliation, legal terms, separate secure shipping PII collection, and atomic point-ledger transactions.
- Import the collaborator's real 3D graph data only after permission and geometry/data contract validation. The demo's synthetic boundary tags cannot substitute for volume-boundary evidence in production.