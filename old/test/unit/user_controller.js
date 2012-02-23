var vows = require('vows'),
    assert = require('assert'),
    should = require('should'),
    request = require('../helper/api').request,
    app = require('../helper/api').app,
    User = app.model('User');

// Clear database
User.find().remove();

vows.describe('UserController').addBatch({

  '/users': {
    topic: function() {
      var self = this;
      User.create({ username: 'testusername', password: 'testpassword', email: 'testemail@email.mail' }, function(e, user) {
        request.get('/users', self.callback);
      });
    },

    'responds with 200': function(e, res) {
      res.statusCode.should.eql(200);
    },
    'responds with content-type application/json': function(e, res) {
      res.headers['content-type'].should.match(/application\/json/);
    },
    'shows a list of users': function(e, res) {
      var json = JSON.parse(res.body);
      json.should.be.an.instanceof(Array)
    },
    'includes testusername': function(e, res) {
      var json = JSON.parse(res.body), found;
      json.forEach(function(user) {
        if (user.username == 'testusername')
          found = true;
      });
      found.should.eql(true);
    },
  },

  'GET /users/:username': {
    'with an existing username': {
      topic: function() {
        var self = this;
        User.create({ username: 'adrian', password: 'test', email: 'adrian@me.net' }, function(e, user) {
          request.get('/users/adrian', self.callback);
        });
      },

      'responds with 200': function(e, res) {
        res.statusCode.should.eql(200);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns user data': function(e, res) {
        var json = JSON.parse(res.body);
        json.username.should.eql('adrian');
      }
    },

    'without an existing username': {
      topic: function() {
        request.get('/users/sudaneseflowerchild', this.callback);
      },

      'responds with 404': function(e, res) {
        res.statusCode.should.eql(404);
      },
    }
  },

  '/users/create': {
    'with valid params': {
      topic: function() {
        request.post({
          uri: '/users/create',
          json: {
            username: 'hello',
            password: 'test',
            email: 'hello@kitty.net'
          }
        }, this.callback);
      },

      'responds with 200': function(e, res) {
        res.statusCode.should.eql(200);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns created user': function(e, res) {
        res.body.username.should.eql('hello');
      },
      'does not return sensitive info': function(e, res) {
        should.not.exist(res.body._salt);
      }
    },

    'with a taken email': {
      topic: function() {
        var self = this;
        User.create({ username: 'fatty', password: 'fat', email: 'fatty@fat.fat' }, function(e, user) {
          request.post({
            uri: '/users/create',
            json: {
              username: 'thyroidproblems',
              password: 'test',
              email: 'fatty@fat.fat'
            }
          }, self.callback);
        });
      },
      'responds with 400': function(e, res) {
        res.statusCode.should.eql(400);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns error information for taken email': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'email' && error.type == 'taken')
            found = true;
        });
        found.should.eql(true);
      }
    },

    'with a taken username': {
      topic: function() {
        var self = this;
        User.create({ username: 'fat', password: 'fat', email: 'fat@fat.fat' }, function(e, user) {
          request.post({
            uri: '/users/create',
            json: {
              username: 'fat',
              password: 'test',
              email: 'bigboned@fat.fat'
            }
          }, self.callback);
        });
      },
      'responds with 400': function(e, res) {
        res.statusCode.should.eql(400);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns error information for taken username': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'username' && error.type == 'taken')
            found = true;
        });
        found.should.eql(true);
      }
    },

    'with invalid email address or username': {
      topic: function() {
        request.post({
          uri: '/users/create',
          json: {
            username: 'mr_grue',
            email: 'NO'
          }
        }, this.callback);
      },

      'responds with 400': function(e, res) {
        res.statusCode.should.eql(400);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns error information for poorly-formatted username': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'username' && error.type == 'bad_format')
            found = true;
        });
        found.should.eql(true);
      },
      'returns error information for poorly-formatted email': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'email' && error.type == 'bad_format')
            found = true;
        });
        found.should.eql(true);
      },
    },

    'without required params': {
      topic: function() {
        request.post({
          uri: '/users/create',
          json: {}
        }, this.callback);
      },

      'responds with 400': function(e, res) {
        res.statusCode.should.eql(400);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns error information for missing email': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'email' && error.type == 'required')
            found = true;
        });
        found.should.eql(true);
      },
      'returns error information for missing username': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'username' && error.type == 'required')
            found = true;
        });
        found.should.eql(true);
      },
      'returns error information for missing password': function(e, res) {
        var found;
        res.body.errors.forEach(function(error) {
          if (error.field == 'password' && error.type == 'required')
            found = true;
        });
        found.should.eql(true);
      }
    }
  },

  'POST /users/:username': {
    'with an existing username': {
      topic: function() {
        var self = this;
        User.create({ username: 'updater', password: 'test', email: 'updater@me.net' }, function(e, user) {
          request.post({
            uri: '/users/updater',
            json: {
              fullname: 'Adrian Bravo',
              location: 'San Francisco',
              _salt: ''
            }
          }, self.callback);
        });
      },

      'responds with 200': function(e, res) {
        res.statusCode.should.eql(200);
      },
      'responds with content-type application/json': function(e, res) {
        res.headers['content-type'].should.match(/application\/json/);
      },
      'returns user data': function(e, res) {
        res.body.username.should.eql('updater');
        res.body.fullname.should.eql('Adrian Bravo');
        res.body.location.should.eql('San Francisco');
      }
    },

    'without an existing username': {
      topic: function() {
        request.post({
          uri: '/users/sudaneseflowerchild',
          json: {}
        }, this.callback);
      },

      'responds with 404': function(e, res) {
        res.statusCode.should.eql(404);
      },
    }
  }

}).export(module);

