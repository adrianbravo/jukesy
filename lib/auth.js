var app = require('../')

module.exports = {

  setUser: function(user, req, res) {
    req.session.user_id = user._id
  },

  unsetUser: function(req, res) {
    delete req.session.user_id
  },

  authorize: function(req, res, next) {
    if (req.currentUser && req.currentUser.username == req.params.username) {
      return next()
    }
    return next(new app.Error(401))
  },
  
  authenticate: function(req, res, next) {
    var User = app.model('User')

    if (!req.session.user_id) {
      return next()
    }

    User.findOne({ _id: req.session.user_id }, function(err, user) {
      if (err || !user) {
        app.auth.unsetUser(req, res)
        return next()
      }

      req.currentUser = user
      next()
    })
  }

}

