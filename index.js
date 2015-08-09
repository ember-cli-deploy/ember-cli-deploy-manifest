/* jshint node: true */
'use strict';

var Promise   = require('ember-cli/lib/ext/promise');
var fs        = require('fs');
var path      = require('path');
var minimatch = require('minimatch');

var DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-manifest',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      defaultConfig: {
        filePattern: '**/*.{js,css,png,gif,jpg,map,xml,txt,svg,eot,ttf,woff,woff2}',
        manifestPath: 'manifest.txt',
        distDir: function(context) {
          return context.distDir;
        },
        distFiles: function(context) {
          return context.distFiles || [];
        }
      },

      willUpload: function(/* context */) {
        var filePattern  = this.readConfig('filePattern');
        var distDir      = this.readConfig('distDir');
        var distFiles    = this.readConfig('distFiles');
        var manifestPath = this.readConfig('manifestPath');

        this.log('generating manifest at `' + manifestPath + '`');
        try {
          var filesToInclude = distFiles.filter(minimatch.filter(filePattern, { matchBase: true }));
          filesToInclude.sort();
          var outputPath = path.join(distDir, manifestPath);
          fs.writeFileSync(outputPath, filesToInclude.join('\n'));
          this.log('generated manifest including ' + filesToInclude.length + ' files ok');
          return { manifestPath: manifestPath };
        } catch (error) {
          this.log(error, { color: 'red' });
          return Promise.reject(error);
        }
      }
    });
    return new DeployPlugin();
  }
};
