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

          // send an email
          res.json(1)
        })
      })
    },
    
    reset: function(req, res, next) {
      // should actually set auth cookie, set password, unset token
      // should fail if expires is up
      // should fail if reset token is not a match
      if (!req.param('password')) {
        return next(new app.Error(400, { $: 'password_required' }))
      } else if (!req.paramUser.reset || req.paramUser.reset.expire < app.moment().utc().toDate()) {
        return next(new app.Error(401, { $: 'reset_token_expired' }))
      } else if (req.param('token') != req.paramUser.reset.token) {
        return next(new app.Error(401, { $: 'reset_token_expired'}))
      }
      
      return next(new app.Error(501))
      /*
      User.findByLogin(req.body.login || '', function(err, user) {
        if (err || !user) {
          return next(err || new app.Error(400, { $: 'no_user_or_email' }))
        }
        
        user.generateResetToken(function(err, user) {
          if (err || !user) {
            return next(err || 500)
          }

          // send an email
          res.json(1)
        })
      })
      */
    },

    read: function(req, res, next) {
      var userJSON = req.paramUser.exposeJSON(req.currentUser)
      if (req.xhr) {
        res.json(userJSON) 
      } else {
        res.render('user/show', { user: userJSON })
      }
    },
    
    edit: function(req, res, next) {
      var userJSON = req.paramUser.exposeJSON(req.currentUser)
      if (req.xhr) {
        res.json(userJSON) 
      } else {
        res.render('user/edit', { user: userJSON })
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

