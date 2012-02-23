module.exports = function(app) {
  var User = app.model('User')

  return {

    create: function(req, res, next) {
      User.findByLogin(req.body.login || '', function(err, user) {
        if (err || !user) {
          return next(err || new app.Error(401, { $: 'bad_credentials' }))
        }
        
        user.checkPassword(req.body.password || '', function(err, valid) {
          if (err || !valid) {
            return next(err || new app.Error(401, { $: 'bad_credentials' }))
          }
          
          app.auth.setUser(user, req, res)
          res.json(user.exposeJSON(req.currentUser))
        })
      })
    },

    delete: function(req, res, next) {
      app.auth.unsetUser(req, res)
      res.redirect('/')
    },

    // primary session check, used once on front-end loading to set the session up.
    // allows untying of session logic from "/" route for better caching of front page.
    refresh: function(req, res, next) {
      if (req.currentUser) {
        app.auth.setUser(req.currentUser, req, res)
        res.json(req.currentUser.exposeJSON(req.currentUser))
      } else {
        app.auth.unsetUser(req, res)
        res.json(0, 401) // not logged in
      }
    }

  }

}


