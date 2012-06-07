module.exports = function(app) {

  var ApplicationController = app.controller('Application')
    , HomeController = app.controller('Home')
    , SearchController = app.controller('Search')
    , UserController = app.controller('User')
    , PlaylistController = app.controller('Playlist')
    , SessionController = app.controller('Session')
    , LastfmController = app.controller('Lastfm')
    , User = app.model('User')
    , Playlist = app.model('Playlist')
  
  app.nocache = function(req, res, next) {
    res.header('Cache-Control', 'no-cache')
    next()
  }

  app.param('username', function(req, res, next, username) {
    User.findOne({ username: (username || '').toLowerCase() }, function(err, user) {
      if (err || !user) {
        return next(new app.Error(err || 404))
      }
      req.paramUser = user
      next()
    })
  })

  app.param('playlist', function(req, res, next, _id) {
    // user in this query is superfluous as id is unique
    Playlist.findOne({ _id: (_id || ''), user: req.paramUser.username }, function(err, playlist) {
      if (err || !playlist) {
        return next(new app.Error(err || 404))
      }
      req.paramPlaylist = playlist
      next()
    })
  })
  
  app.get('/status', app.nocache, ApplicationController.status)
  app.get('/', HomeController.welcome)
  app.get('/about', HomeController.about)
  app.get('/terms-of-service', HomeController.termsOfService)
  app.get('/privacy-policy', HomeController.privacyPolicy)

  app.get('/user', app.nocache, UserController.index)
  app.post('/user/forgot', UserController.forgot)
  app.post('/user', UserController.create)
  app.get('/user/:username', app.nocache, app.auth.authenticate, UserController.read)
  app.get('/user/:username/reset', app.nocache, UserController.resetCheck)
  app.post('/user/:username/reset', UserController.reset)
  app.get('/user/:username/edit', app.nocache, app.auth.authenticate, app.auth.authorize, UserController.edit)
  app.put('/user/:username', app.auth.authenticate, app.auth.authorize, UserController.update)
  app.del('/user/:username', app.auth.authenticate, app.auth.authorize, UserController.delete)

  app.get('/user/:username/playlist', app.nocache, PlaylistController.index)
  app.get('/user/:username/playlist/:playlist', app.nocache, PlaylistController.read)
  app.post('/user/:username/playlist', app.auth.authenticate, app.auth.authorize, PlaylistController.create)
  app.put('/user/:username/playlist/:playlist', app.auth.authenticate, app.auth.authorize, PlaylistController.update)
  app.del('/user/:username/playlist/:playlist', app.auth.authenticate, app.auth.authorize, PlaylistController.delete)
  app.put('/user/:username/playlist/:playlist/tracks/add', app.auth.authenticate, app.auth.authorize, PlaylistController.add)

  app.get('/session/refresh', app.nocache, app.auth.authenticate, SessionController.refresh)
  app.post('/session', SessionController.create)
  app.del('/session', SessionController.delete)
  app.get('/logout', app.nocache, SessionController.delete)

  app.get('/lastfm_cache', LastfmController.get)

  app.get('/artist/:artist/track/:track', SearchController.artistTrack)
  app.get('/artist/:artist/album/:album', SearchController.artistAlbum)
  app.get('/artist/:artist/top-tracks', SearchController.artistTopTracks)
  app.get('/artist/:artist/top-albums', SearchController.artistTopAlbums)
  app.get('/artist/:artist/similar', SearchController.artistSimilar)
  app.get('/artist/:artist', SearchController.artist)
  app.get('/search/:query/track', SearchController.queryTrack)
  app.get('/search/:query/album', SearchController.queryAlbum)
  app.get('/search/:query/artist', SearchController.queryArtist)
  app.get('/search/:query', SearchController.query)

  app.error(ApplicationController.error)
  app.all('*', ApplicationController.notFound)

}
