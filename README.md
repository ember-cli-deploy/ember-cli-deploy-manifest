# ember-cli-deploy-manifest

This plugin generates a text manifest of all built assets that can be used by other plugins to perform a differential (i.e. speedier) upload.

How does this work in practice? As an example, the ember-cli-deploy-s3 plugin will upload this manifest to its bucket, and when asked to upload a set of assets, will download the most recent manifest to quickly compare against the new manifest and determine which files actually need uploading. This is possible because we are using content-based fingerprints in the file names, so if there is a matching filename, we can assume that we do not need to re-upload the file.

## Example

In deployment #1, we build our app and generate 4 files:

```
app-abc123.js
vendor-def456.js
app-ghi789.css
vendor-jkl012.css
```

This plugin generates this list as `manifest.txt` and the s3 plugin (or another plugin with similar intent) uploads the manifest file to S3 along with all 4 asset files.

A few minutes pass, and you make a change to a javascript file in your app. You kick off deployment #2, and the build step generates 4 files, of which only the app.\*.js file has changed. This time, the s3 plugin downloads the previous manifest from the s3 bucket, compares it to the new one, and notices that the only difference is the app.\*.js file, so it only uploads that file, which is much faster than uploading all of the files.

## Installation

* `ember install ember-cli-deploy-manifest`

## ember-cli-deploy Hooks Implemented

* configure
* willUpload

## Configuration Options

### filePattern

Files matching this pattern will be included in the manifest.

_Default:_ "\*\*/\*.{js,css,png,gif,jpg,map,xml,txt,svg,eot,ttf,woff,woff2}"

### manifestPath

The relative path that the manifest is written to.

_Default:_ "manifest.txt"

### distDir

Directory where assets have been written to

_Default:_ the distDir property of the deployment context

### distFiles

The Array of built assets.

_Default:_ the distFiles property of the deployment context

## Prequisites

The default configuration of this plugin expects the deployment context to have `distDir` and `distFiles` properties. These are conveniently created by the [ember-cli-deploy-build](https://github.com/zapnito/ember-cli-deploy-build) plugin so will work out of the box if you are using that plugin.

## Plugins known to work well with this one

[ember-cli-deploy-s3](https://github.com/zapnito/ember-cli-deploy-s3)

## Running Tests

* `npm test`

