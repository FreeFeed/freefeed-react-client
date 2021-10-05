# FreeFeed Release Process

## Requirements for Release Manager
1. Must be administrator of github.com/FreeFeed organization
2. Must have active pgp/gpg key registered with github

## Stable branch requirements
All automatic tests should pass. It includes:

- `yarn test`
- `yarn lint`
- `yarn stylelint`
- `yarn tsc`

## Pre-release steps (optional)
Update safe dependencies. It should be limited to patch-level updates (change of "Z" in "x.y.Z"). We can update "Y" in "x.Y.z" if dependency is known to be maintained in a good fashion and maintainer can be trusted to not break things in minor releases (that's rare!).

Technically it is done like this:

* `yarn set version berry` (upgrade YARN)
* `yarn plugin import interactive-tools` (upgrade YARN's plugin)
* `yarn upgrade-interactive` — select required updates using rules given above and wait till it succeeds.
* `rm -rf yarn.lock node_modules; yarn install` to upgrade indirect dependencies.

## Release steps
1. Check that CHANGELOG.md includes everything it should have. Edit and commit if needed.
2. Switch to `release` branch
3. Set current date in `CHANGELOG.md` and `src/components/footer.jsx`. Add commit with "Release 1.2.3" message (use real version number)
4. Create signed tag: `git tag -s freefeed_release_1.2.3`
5. `git push --tags origin release`

## Post-release steps
1. Merge release into `beta` branch and make sure that "Experimental" section of CHANGELOG.md is higher than new release and that it is up to date.
2. Merge release into `stable` branch.
3. Update `package.json`, `src/components/footer.jsx` and `CHANGELOG.md` to mention next minor version without release date ("Not released"). Commit it with "Back to dev" message
