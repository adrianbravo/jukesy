module.exports = function(app) {

  var ApplicationController = app.controller('Application')
    , HomeController = app.controller('Home')
    , UserController = app.controller('User')
    , SessionController = app.controller('Session')
    , User = app.model('User')
  
  app.param('username', function(req, res, next, username) {
    User.findOne({ username: (username || '').toLowerCase() }, function(err, user) {
      if (err || !user) {
        return next(new app.Error(err || 404))
      }
      req.paramUser = user
      next()
    })
  })
  
  app.get('/status', ApplicationController.status)
  app.get('/', HomeController.welcome)
  app.get('/about', HomeController.about)

  app.get('/user', UserController.index)
  app.post('/user', UserController.create)
  app.get('/user/:username', app.auth.authenticate, UserController.read)
  app.put('/user/:username', app.auth.authenticate, app.auth.authorize, UserController.update)
  app.del('/user/:username', app.auth.authenticate, app.auth.authorize, UserController.delete)

  app.get('/session/refresh', app.auth.authenticate, SessionController.refresh)
  app.post('/session', SessionController.create)
  app.del('/session', SessionController.delete)
  app.get('/logout', SessionController.delete)

  app.error(ApplicationController.error)
  app.all('*', ApplicationController.notFound)

}
