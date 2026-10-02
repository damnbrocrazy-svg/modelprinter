# Publishing to npm

The package is published publicly to `https://registry.npmjs.org/` by
`.github/workflows/publish.yml`. A merge to `main` runs the tests and build, then
`pver release` increments the package version, publishes it, and commits the
version update. This matches jscad-electronics' release workflow. A manual run
of the workflow also creates a release; it is not a dry run.

## One-time trusted publisher setup

Sign in to the [modelprinter package settings](https://www.npmjs.com/package/@tscircuit/modelprinter/access)
as a package maintainer, complete any two-factor challenge, and configure a
GitHub Actions trusted publisher with these exact values:

| Field | Value |
| --- | --- |
| Organization or user | `tscircuit` |
| Repository | `modelprinter` |
| Workflow filename | `publish.yml` |
| Environment | Leave blank (the workflow does not use an environment) |
| Allowed actions | Allow direct `npm publish` |

Use the filename alone, not `.github/workflows/publish.yml`. Configure this
before merging the publishing change. npm binds the publisher to the GitHub
repository and workflow filename; saving it does not verify those values.

The workflow uses a GitHub-hosted runner, Node 24, and `id-token: write`.
npm authenticates the publish through OIDC. It does not need an npm token,
`NODE_AUTH_TOKEN`, or an interactive `npm login` in CI. The setup login and 2FA
are for changing the npm package settings.

See [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/)
for the required npm CLI/Node versions and authentication behavior.

## Migrating from GitHub Packages

The previous workflow ran only for published GitHub releases or manual dispatch,
targeted `npm.pkg.github.com`, and authenticated with `github.token`. The package's
`publishConfig.registry` pointed to the same registry. Merging code never
triggered an npmjs.com publish. That registry's latest modelprinter version was
still 0.0.2 when this migration was prepared.

The next pver release starts from the repository's current version and bumps it;
with 0.0.3 in the repository, the first npm release will be 0.0.4. Once it succeeds,
update the jscad-electronics dependency PR to the actual published version and
regenerate its lockfile from the npm registry. Confirm the Actions publish run
succeeded and `npm view @tscircuit/modelprinter version` shows the new version.
