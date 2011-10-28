var vows = require('vows'),
    assert = require('assert'),
    should = require('should'),
    request = require('../helper/api').request,
    app = require('../helper/api').app,
    User = app.model('User');

// Clear database
User.find().remove();

vows.describe('SessionController').addBatch({

  '/login': {
    'with valid username and password': {
      topic: function() {
        var self = this;
        User.create({ username: 'adrian', password: 'pw', email: 'me@adrianbravo.net' }, function(e, user) {
          request.post({
            uri: '/login',
            json: {
              username: 'adrian',
              password: 'pw'
            }
          }, self.callback);
        });
      },

      'returns a 200': function(e, res) {
        res.statusCode.should.eql(200);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns user data': function(e, res) {
        res.body.username.should.eql('adrian');
      },
      // This does not actually work.
      /*
      'sets a user session': function(e, res) {
        should.exist(res.request.session.user);
      },
      */
    },

    'with invalid username and password': {
      topic: function() {
        var self = this;
        User.create({ username: 'adrian2', password: 'pw2', email: 'me2@adrianbravo.net' }, function(e, user) {
          request.post({
            uri: '/login',
            json: {
              username: 'adrian2',
              password: 'what'
            }
          }, self.callback);
        });
      },

      'returns a 401': function(e, res) {
        res.statusCode.should.eql(401);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns user data': function(e, res) {
        res.body.message.should.eql('Invalid username or password.');
      },
      /*
      'does not set a user session': function(e, res) {
        should.not.exist(res.request.session.user);
      },
      */
    },

    // Add ability to login with email in the future
  },

}).export(module);
