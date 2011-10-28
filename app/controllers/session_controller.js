var app = require('../../'),
    error = require('../../lib/error'),
    User = app.model('User');

module.exports = {

  create: function(req, res, next) {
    User.findOne({
      _username_i: req.param('username').toLowerCase()
    }, function(e, user) {
      if (e)
        return next(e);

      user.authenticate(req.param('password'), function(authenticated) {
        if (authenticated) {
          req.session.user = user;
          res.json(user.json, 200);
        } else {
          return next(new error.Unauthorized('Invalid username or password.'));
        }
      });
    });
  }

};
