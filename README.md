# ember-cli-deploy-manifest

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-manifest.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

This plugin generates a [manifest file](https://en.wikipedia.org/wiki/Manifest_file) listing the versioned asset files generated by your app's build process.  By comparing the latest manifest to the previous one, your deployment plugin (such as [ember-cli-deploy-s3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3)) can determine which files have changed and only upload those, improving efficiency.

**How does this work in detail?**

When you build your ember-cli app in development, your files get globbed together into a bunch of asset files such as myapp.js vendor.js, myapp.css, and vendor.css (see your project's dist/assets dir).

When you do a production build, your build process will produce fingerprinted copies of these asset files.  Fingerprints are used for versioning as described [here](https://en.wikipedia.org/wiki/Fingerprint_(computing)).  In practice fingerprints are long hash strings, but for exposition we'll pretend our fingerprints look like a version number.  So our manifest will look like:

```
myapp-1.js
vendor-1.js
myapp-1.css
vendor-1.css
```

The first time we deploy, our deployment plugin uploads everything, including our manifest file.

Say we then edit our app javascript but everything else remains the same.  After rebuilding, when we generate our new manifest, it will look something like:

```
myapp-2.js
vendor-1.js
myapp-1.css
vendor-1.css
```

When our deployment plugin is ready to deploy, it retrieves the old manifest (from S3 or wherever its stored), diffs it with the current one, and determines it only has to upload myapp-2.js.  For large asset files, this can save alot of time and bandwidth.

## Installation

* `ember install ember-cli-deploy-manifest`

## ember-cli-deploy Hooks Implemented

* `configure`
* `willUpload`

## Configuration Options

### filePattern

Files matching this pattern will be included in the manifest.

_Default:_ `"**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2}"`

### manifestPath

The relative path that the manifest is written to.

_Default:_ `"manifest.txt"`

### distDir

Directory where assets have been written to

_Default:_ the `distDir` property of the deployment context

### distFiles

The Array of built assets.

_Default:_ the `distFiles` property of the deployment context

## Prerequisites

The default configuration of this plugin expects the deployment context to have `distDir` and `distFiles` properties. These are conveniently created by the [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build) plugin so will work out of the box if you are using that plugin.

## Plugins known to work well with this one

[ember-cli-deploy-s3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3)

## Tests

* yarn test

## Why `ember build` and `ember test` don't work

Since this is a node-only ember-cli addon, this package does not include many files and dependencies which are part of ember-cli's typical `ember build` and `ember test` processes.
