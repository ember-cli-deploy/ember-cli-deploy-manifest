var assert = require('ember-cli/tests/helpers/assert');

describe('validate-config', function() {
  var subject;
  var config;
  var mockUi;

  before(function() {
    subject = require('../../../../lib/utilities/validate-config');
  });

  beforeEach(function() {
    mockUi = {
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  describe('without providing config', function () {
    beforeEach(function() {
      config = { };
    });
    it('warns about missing optional config', function() {
      return assert.isFulfilled(subject(mockUi, config))
        .then(function() {
          var messages = mockUi.messages.reduce(function(previous, current) {
            if (/- Missing config:\s.*, using default:\s/.test(current)) {
              previous.push(current);
            }

            return previous;
          }, []);

          assert.equal(messages.length, 2);
        });
    });

    it('adds default config to the config object', function() {
      return assert.isFulfilled(subject(mockUi, config))
        .then(function() {
          assert.isDefined(config.filePattern);
          assert.isDefined(config.manifestPath);
        });
    });

    it('resolves', function() {
      return assert.isFulfilled(subject(mockUi, config));
    })
  });
});
