var app = require('../../'),
    error = require('../../lib/error'),
    User = app.model('User'),
    async = require('async');

module.exports = {

  index: function(req, res, next) {
    User.find({})
      .select('username', 'fullname', 'location', 'website', 'bio')
      .skip(0)
      .limit(20)
      .asc('username')
      .slaveOk()
      .run(function(e, users) {
        // TODO e
        async.map(users, function(user, callback) {
          callback(null, user.json);
        }, function(e, users) {
          // TODO e
          res.json(users);
        });
      });
  },

  show: function(req, res, next) {
    User.findOne({
      _username_i: req.param('username').toLowerCase()
    }, function(e, user) {
      if (e)
        return next(e);
      if (!user)
        return next(new error.NotFound('User does not exist.'));

      res.json(user.json);
    });
  },

  create: function(req, res, next) {
    User.create({
      username: req.param('username'),
      password: req.param('password'),
      email: req.param('email'),
    }, function(e, user) {
      if (e)
        return next(e);

      res.json(user.json);
    });
  },

  update: function(req, res, next) {
    User.findOne({
      _username_i: req.param('username').toLowerCase()
    }, function(e, user) {
      if (e)
        return next(e);
      if (!user)
        return next(new error.NotFound('User does not exist.'));

      user.updateAttributes(req.body);
      user.save(function(e, user) {
        if (e)
          return next(e);

        res.json(user.json);
      });
    });
  }

};


