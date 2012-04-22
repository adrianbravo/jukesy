module.exports = function(app) {
  var User = app.model('User')

  return {

    index: function(req, res, next) {
      next(new app.Error(501))
    },

    create: function(req, res, next) {
      User.create(req.body, function(err, user) {
        if (err || !user) {
          return next(new app.Error(err || 500))
        }
        
        app.auth.setUser(user, req, res)
        res.json(user.exposeJSON(user))
      })
    },

    forgot: function(req, res, next) {
      User.findByLogin(req.body.login || '', function(err, user) {
        if (err || !user) {
          return next(err || new app.Error(400, { $: 'no_user_or_email' }))
        }
        
        user.generateResetToken(function(err, user) {
          if (err || !user) {
            return next(err || 500)
          }

          app.controller('Mail').resetToken(user, function(err, success) {
            if (err) {
              return next(err || 500)
            }
            res.json(1)
          })
        })
      })
    },
    
    reset: function(req, res, next) {
      req.paramUser.resetPassword(req.body, function(err, user) {
        if (err || !user) {
          return next(err || new app.Error(500))
        }
        res.json(1)
      })
    },
    
    resetCheck: function(req, res, next) {
      if (!req.xhr) {
        res.render('home/welcome', { meta: app.meta() })
      } else {
        if (!req.paramUser.validResetToken(req.param('token'))) {
          return next(new app.Error(401, { $: 'reset_token_expired' }))
        }
        res.json(1)
      }
    },

    read: function(req, res, next) {
      var userJSON = req.paramUser.exposeJSON(req.currentUser)
      if (req.xhr) {
        res.json(userJSON) 
      } else {
        res.render('user/show', {
          user: userJSON,
          meta: app.meta({
                  title: req.paramUser.username + '\'s profile',
                  url: req.paramUser.url()
                })
        })
      }
    },
    
    edit: function(req, res, next) {
      var userJSON = req.paramUser.exposeJSON(req.currentUser)
      if (req.xhr) {
        res.json(userJSON) 
      } else {
        res.render('user/edit', {
          user: userJSON,
          meta: app.meta({
                  title: 'edit ' + userJSON.username + '\'s profile',
                  url: req.paramUser.url() + '/edit'
                })
        })
      }
    },

    update: function(req, res, next) {
      req.paramUser.updateAttributes(req.body)
      req.paramUser.save(function(err, user) {
        if (err || !user) {
          return next(new app.Error(err || 500))
        }

        res.json(user.exposeJSON(req.currentUser))
      })
    },

    delete: function(req, res, next) {
      next(new app.Error(501))
    }

  }

}

