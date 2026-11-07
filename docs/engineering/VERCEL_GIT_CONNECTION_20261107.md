# GitHub → Vercel existing-project connection handoff (2026-11-07)

## Verified baseline
- Product baseline is existing V2.3 / `release.json: 2.3.0`. This is an engineering configuration change, not a release.
- Existing GitHub source: `SuperMing24/neurotrace-ui-workflow`, branch `main`.
- Version review is already integrated into the left “从设计到上线” workflow rail in `review/shell.js` and `review/shell.css`. Preserve that implementation and frozen history.
- Existing Vercel project: `neurotrace-ui-demo` (`prj_rltLMiGve1xnjVgoXp2XALNvcspx`), team `superming96-9947` (`team_8p2UchCd10odjkArWG7L0sEC`); production deployment before Git linkage is `dpl_3NGqNE2yX9JdYkjVahPA4Vdku779`.
- The repository previously set `git.deploymentEnabled: false`. This engineering commit changes it to `true`; doing so does **not** itself connect an existing unlinked Vercel project.

## Remaining external account action
The existing project's Git integration must be attached **in that project**, not by creating a second Vercel project. In the Vercel dashboard open `neurotrace-ui-demo → Settings → Git → Connect Git Repository`, choose GitHub `SuperMing24/neurotrace-ui-workflow` and production branch `main`. Confirm the project ID and domain remain the same.

**Production safety gate:** This public repository intentionally excludes `api/letters.js`, private tests, secrets and license-unconfirmed audio. Its contents cannot be treated as the full original production deployment input. Linking Git may immediately trigger a production build and may remove excluded production functionality. Before enabling automatic production deployments, restore the authorized private overlay or establish an equivalent private build/deployment pipeline and verify backend parity without exposing private contents in Git. Do not execute database migrations or modify accounts/points/auth during linking.

## Acceptance checks after Git connection
1. Read Vercel project settings and confirm the `link` points to GitHub `SuperMing24/neurotrace-ui-workflow`, production branch `main`.
2. Confirm a Git commit triggers a deployment sourced from the expected commit SHA; check READY/build logs and deployment target.
3. Check desktop/mobile workflow rail and version selection on actual deployment, confirm API health and private-service parity.
4. Confirm `release.json` still reports `2.3.0`; no new product tag or release.
5. Record the deployment ID, commit SHA and validation evidence in the engineering docs.

**Status on document creation:** Git configuration enabled in repository; existing Vercel project Git attachment and first automatic deployment not yet confirmed. Do not present the connection as complete until confirmed in Vercel project state and a test deployment.
