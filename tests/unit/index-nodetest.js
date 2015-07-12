'use strict';

var Promise = require('ember-cli/lib/ext/promise');
var assert  = require('ember-cli/tests/helpers/assert');
var fs  = require('fs');
var path  = require('path');
var rimraf  = Promise.denodeify(require('rimraf'));

describe('manifest plugin', function() {
  var subject, mockUi;

  beforeEach(function() {
    subject = require('../../index');
    mockUi = {
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
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
        ui: mockUi,
        config: {
          manifest: {
            filePattern: '**/*',
            manifestPath: 'manifest.txt'
          }
        }
      };

      plugin.beforeHook(context);
      plugin.configure(context);
      assert.ok(true); // it didn't throw
    });
    describe('without providing config', function () {
      var plugin, context, config;
      beforeEach(function() {
        config = { };
        plugin = subject.createDeployPlugin({
          name: 'manifest'
        });
        context = {
          ui: mockUi,
          config: config
        };
        plugin.beforeHook(context);
      });
      it('warns about missing optional config', function() {
        plugin.configure(context);
        var messages = mockUi.messages.reduce(function(previous, current) {
          if (/- Missing config:\s.*, using default:\s/.test(current)) {
            previous.push(current);
          }

          return previous;
        }, []);
        assert.equal(messages.length, 4);
      });

      it('adds default config to the config object', function() {
        plugin.configure(context);
        assert.isDefined(config.manifest.filePattern);
        assert.isDefined(config.manifest.manifestPath);
        assert.isDefined(config.manifest.distDir);
        assert.isDefined(config.manifest.distFiles);
      });
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
        ui: mockUi,
        project: { name: function() { return 'test-project'; } },
        config: {
          manifest: {
            filePattern: '**/*.{js,css,png,gif,jpg,map,xml,txt,svg,eot,ttf,woff,woff2}',
            manifestPath: 'manifest.txt',
            distDir: function(context){ return context.distDir; },
            distFiles: function(context){ return context.distFiles; }
          }
        }
      };
      if (!fs.existsSync('tmp')) { fs.mkdirSync('tmp'); }
      if (!fs.existsSync(context.distDir)) { fs.mkdirSync(context.distDir); }
      if (!fs.existsSync(path.join(context.distDir, 'assets'))) { fs.mkdirSync(path.join(context.distDir, 'assets')); }
      fs.writeFileSync(path.join(context.distDir, context.distFiles[0]), 'alert("Hello foo world!");', 'utf8');
      fs.writeFileSync(path.join(context.distDir, context.distFiles[1]), 'body { color: red; }', 'utf8');
      fs.writeFileSync(path.join(context.distDir, context.distFiles[2]), '<html>Hello world</html>', 'utf8');
      plugin.beforeHook(context);
    });

    afterEach(function(){
      return rimraf(context.distDir);
    });

    it('includes the matching files in a manifest', function(done) {
      var result = plugin.willUpload(context);
      try {
        var manifestContents = fs.readFileSync(path.join(context.distDir, 'manifest.txt'), { encoding: 'utf8' });
        var lines = manifestContents.split("\n");
        assert.equal(lines.length, 2);
        assert.equal(lines[0], "assets/bar-da3d0fb7db52f8273550c11403df178f.css");
        assert.equal(lines[1], "assets/foo-178d195608c0b18cf0ec5e982b39cad8.js");
        assert.deepEqual(result, { manifestPath: 'manifest.txt' });
        done();
      } catch(err) {
        console.log(err);
        console.log(err.stack);
        done(err);
      }
    });
  });
});
