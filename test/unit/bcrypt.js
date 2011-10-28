var vows = require('vows'),
    assert = require('assert'),
    bcrypt = require('../../lib/bcrypt');

vows.describe('bcrypt').addBatch({

  'salt': {
    topic: function() {
      bcrypt.salt(this.callback);
    },

    'generates a random salt': function(e, salt) {
      assert.isNull(e);
      assert.isString(salt);
    },
  },

  'hash': {
    topic: function() {
      bcrypt.hash('guitar33', '$2a$10$TqstvQkz8KjkrzipovqJue', this.callback);
    },

    'generates a valid hash': function(e, hash) {
      assert.isNull(e);
      assert.equal(hash, '$2a$10$TqstvQkz8KjkrzipovqJue1PPBcsxJhb4.fIxk30hQyoIiK2X/nRq');
    },
  },

}).export(module);
