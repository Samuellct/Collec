# Branch Protection Rules

Rules to configure manually via GitHub UI: Settings > Branches > Add rule.

## `main`

- **Require a pull request before merging** : enabled
  - Require approvals : 0 (solo dev)
  - Dismiss stale pull request approvals when new commits are pushed : enabled
- **Require status checks to pass before merging** : enabled
  - Required checks : `ci` (job name from ci.yml), `lighthouse` (when applicable)
  - Require branches to be up to date before merging : enabled
- **Do not allow bypassing the above settings** : enabled
- **Require linear history** : enabled (enforces rebase/squash merges)

## `develop` (if used)

- **Require status checks to pass before merging** : enabled
  - Required checks : `ci`

## Notes

- `GITHUB_TOKEN` is automatically available, no manual secret needed for CI or semantic-release.
- Secrets to add for future deployment (Settings > Secrets > Actions):
  - `VPS_HOST` : IP or hostname of the VPS
  - `VPS_USER` : SSH user on the VPS
  - `VPS_SSH_KEY` : private SSH key
