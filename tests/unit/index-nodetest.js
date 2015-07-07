'use strict';

var Promise = require('ember-cli/lib/ext/promise');
var assert  = require('ember-cli/tests/helpers/assert');
var fs  = require('fs');
var path  = require('path');
var rimraf  = Promise.denodeify(require('rimraf'));

describe('manifest plugin', function() {
  var subject;

  before(function() {
    subject = require('../../index');
  });

  it('has a name', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(result.name, 'test-plugin');
  });

  it('implements the correct hooks', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(typeof result.configure, 'function');
    assert.equal(typeof result.willUpload, 'function');
  });

  describe('configure hook', function() {
    it('resolves if config is ok', function() {
      var plugin = subject.createDeployPlugin({
        name: 'manifest'
      });

      var context = {
        deployment: {
          ui: { write: function() {}, writeLine: function() {} },
          config: {
            manifest: {
              filePattern: '**/*',
              manifestPath: 'manifest.txt'
            }
          }
        }
      };

      return assert.isFulfilled(plugin.configure.call(plugin, context))
    });
  });

  describe('willUpload hook', function() {
    var plugin;
    var context;

    beforeEach(function() {
      plugin = subject.createDeployPlugin({
        name: 'manifest'
      });

      context = {
        distDir: 'tmp/test-dist',
        distFiles: [
          'assets/foo-178d195608c0b18cf0ec5e982b39cad8.js',
          'assets/bar-da3d0fb7db52f8273550c11403df178f.css',
          'index.html',
        ],
        deployment: {
          ui: { write: function() {} },
          project: { name: function() { return 'test-project'; } },
          config: {
            manifest: {
              filePattern: '**/*.{js,css,png,gif,jpg,map,xml,txt,svg,eot,ttf,woff,woff2}',
              manifestPath: 'manifest.txt',
              distDir: function(context){ return context.distDir; },
              distFiles: function(context){ return context.distFiles; }
            }
          }
        }
      };
      if (!fs.existsSync('tmp')) { fs.mkdirSync('tmp'); }
      if (!fs.existsSync(context.distDir)) { fs.mkdirSync(context.distDir); }
      if (!fs.existsSync(path.join(context.distDir, 'assets'))) { fs.mkdirSync(path.join(context.distDir, 'assets')); }
      fs.writeFileSync(path.join(context.distDir, context.distFiles[0]), 'alert("Hello foo world!");', 'utf8');
      fs.writeFileSync(path.join(context.distDir, context.distFiles[1]), 'body { color: red; }', 'utf8');
      fs.writeFileSync(path.join(context.distDir, context.distFiles[2]), '<html>Hello world</html>', 'utf8');
    });

    afterEach(function(){
      return rimraf(context.distDir);
    });

    it('includes the matching files in a manifest', function(done) {
      return assert.isFulfilled(plugin.willUpload.call(plugin, context))
        .then(function(result) {
          var manifestContents = fs.readFileSync(path.join(context.distDir, 'manifest.txt'), { encoding: 'utf8' });
          var lines = manifestContents.split("\n");
          assert.equal(lines.length, 2);
          assert.equal(lines[0], "assets/bar-da3d0fb7db52f8273550c11403df178f.css");
          assert.equal(lines[1], "assets/foo-178d195608c0b18cf0ec5e982b39cad8.js");
          assert.deepEqual(result, { manifestPath: 'manifest.txt' });
          done();
        }).catch(function(reason){
          console.log(reason);
          console.log(reason.actual.stack);
          done(reason);
        });
    });
  });
});
