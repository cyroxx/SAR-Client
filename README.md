# SarClient

[![Travis-CI Build Status](https://travis-ci.org/sea-watch/SAR-Client.svg?branch=master)](https://travis-ci.org/sea-watch/SAR-Client)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/junqykua8xanmt9f/branch/master?svg=true)](https://ci.appveyor.com/project/bernd/sar-client/branch/master)

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.25.5.

Run `bower install`

Run `npm install` to install dependencies.

Run `npm run electron` to build angular and electron application.

Run `ng serve` inside the src/ directory to build and serve the angular application. 

## Contributing

Please see our [contributors guide](CONTRIBUTING.md) for details on how to contribute to the project. Thank you!

## Release New Version

Version examples:

- Stable release: `1.1.0`
- Alpha release: `1.1.0-alpha.1`, `1.1.0-alpha.2`
- Beta release. `1.1.0-beta.1`, `1.1.0-beta.2`
- Release candidate: `1.0.0-rc.1`

Use the following commands to create a new release:

1. Set new `version` in `package.json` (e.g. `"version": "0.2.0-rc.1"`)
1. Commit `package.json` file after changing the version
1. Push commit
1. Create git tag via `git tag v<version>` (e.g. `git tag v0.1.0-alpha.2`)
1. Push git tags via `git push --tags`

Travis-CI and Appveyor will build the release artifacts and upload them to
the GitHub releases page.

