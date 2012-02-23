var vows = require('vows'),
    assert = require('assert'),
    should = require('should'),
    app = require('../helper/api').app,
    utils = require('../helper/api').utils,
    User = app.model('User');

// Clear database
User.find().remove();

vows.describe('User').addBatch({

  'new User': {
    topic: new User,

    'has an _id': function(user) {
      assert.isObject(user._id);
    },
  },

  'User.create()': {
    topic: function() {
      User.create({ username: utils.mock.name(), password: 'meeka', email: utils.mock.email() }, this.callback);
    },

    'returns a new user': function(e, user) {
      assert.isNull(e);
      assert.isObject(user._id);
    },
    'with a json attribute': function(e, user) {
      assert.isObject(user.json);
      assert.isUndefined(user.json._id);
    },

  },

  'User#authenticate': {
    'if sent a valid password': {
      topic: function() {
        var self = this;
        User.create({ username: utils.mock.name(), password: 'pw', email: utils.mock.email() }, function(e, user) {
          user.authenticate('pw', self.callback);
        });
      },

      'returns true': function(authenticated) {
        authenticated.should.be.true;
      }
    },

    'if sent an invalid password': {
      topic: function() {
        var self = this;
        User.create({ username: utils.mock.name(), password: 'pw', email: utils.mock.email() }, function(e, user) {
          user.authenticate('notpw', self.callback);
        });
      },

      'returns false': function(authenticated) {
        authenticated.should.be.false;
      }
    },
  },

  'User#validation': {

    'returns a "required" error when passed a blank': {
      topic: function() {
        User.create({ username: '', password: '', email: '' }, this.callback);
      },

      'email': function(e, user) {
        assert.equal(e.errors.email.type, 'required');
      },
      'username ': function(e, user) {
        assert.equal(e.errors.username.type, 'required');
      },
      'password ': function(e, user) {
        assert.equal(e.errors.password.type, 'required');
      },
    },

    'returns a "required" error when passed a null': {
      topic: function() {
        User.create({}, this.callback);
      },
      'email': function(e, user) {
        assert.equal(e.errors.email.type, 'required');
      },
      'username': function(e, user) {
        assert.equal(e.errors.username.type, 'required');
      },
      'password': function(e, user) {
        assert.equal(e.errors.password.type, 'required');
      },
    },

    'when an email address is not unique': {
      topic: function() {
        var self = this;
        User.create({ username: utils.mock.name(), password: 'meeka', email: 'hello@world.com' }, function(e, user) {
          User.create({ username: utils.mock.name(), password: 'meeka', email: 'hello@world.com' }, self.callback);
        });
      },
      'return a "taken" error': function(e, user) {
        assert.equal(e.path, 'email');
        assert.equal(e.type, 'taken');
      }
    },

    'when an username is not unique': {
      topic: function() {
        var self = this;
        User.create({ username: 'test2', password: 'meeka', email: utils.mock.email() }, function(e, user) {
          User.create({ username: 'test2', password: 'meeka', email: utils.mock.email() }, self.callback);
        });
      },
      'return a "taken" error': function(e, user) {
        assert.equal(e.path, 'username');
        assert.equal(e.type, 'taken');
      }
    },

    'when an email has a funky format': {
      topic: function() {
        User.create({ email: 'what' }, this.callback);
      },
      'it gets kicked to the motherfuckin\' curb!': function(e, user) {
        assert.equal(e.errors.email.type, 'bad_format');
      },
    },

    'when an email has a familiar format': {
      topic: function() {
        User.create({ email: utils.mock.email(), username: utils.mock.name(), password: 'thepho' }, this.callback);
      },
      'it is given proper respect': function(e, user) {
        assert.isNull(e);
      },
    },

    'when a username is not alphanumeric': {
      topic: function() {
        User.create({ email: utils.mock.email(), username: 'mr_grue', password: '1' }, this.callback);
      },
      'it gets kicked to the motherfuckin\' curb!': function(e, user) {
        assert.equal(e.errors.username.type, 'bad_format');
      },
    },
  },

  'User.create() generates': {
    topic: function() {
      User.create({ email: utils.mock.email().toUpperCase(), password: 'test6', username: utils.mock.name().toUpperCase() }, this.callback);
    },

    'a _confirm token': function(e, user) {
      assert.isString(user._confirm);
    },
    'a _token': function(e, user) {
      assert.isString(user._token);
    },
    'a _salt': function(e, user) {
      assert.isString(user._salt);
    },
    'a lowercase duplicate of username, _username_i': function(e, user) {
      assert.equal(user._username_i, user.username.toLowerCase());
    },
    'email as lowercase': function(e, user) {
      assert.equal(user.email, user.email.toLowerCase());
    },
    'a hash of the original password': function(e, user) {
      assert.notEqual(user.password, 'Test6');
    }
  },

  'User.confirm()': {
    'checks the _confirm and email': {
      topic: function() {
        var self = this;
        User.create({ email: 'soda.popinsky@punch.out', username: 'soda', password: 'test' }, function(e, user) {
          User.confirm(user.email, user._confirm, self.callback);
        });
      },
      'to confirm a user': function(e, user) {
        assert.isNull(e);
        assert.equal(user.status, 'confirmed');
      }
    },

    'when sent a null email': {
      topic: function() {
        User.confirm(null, '', this.callback);
      },
      'returns an error': function(e, user) {
        e.message.should.match(/No user could be found with that email address./);
      }
    },

    'when sent an non-existent email': {
      topic: function() {
        User.confirm('notanemail', '', this.callback);
      },
      'returns an error': function(e, user) {
        e.message.should.match(/No user could be found with that email address./);
      }
    },

    'when sent an invalid confirmation token': {
      topic: function() {
        var self = this;
        User.create({ email: 'soda.popinsky@kickpunch.out', username: 'kickpuncher', password: 'test' }, function(e, user) {
          User.confirm(user.email, 'clearly not a valid confirmation token, wtf are you thinking?', self.callback);
        });
      },
      'fails to confirm a user': function(e, user) {
        e.message.should.match(/The confirmation token entered is invalid./);
      }
    }
  },

}).export(module);
