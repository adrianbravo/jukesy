module.exports = function(app) {
  var User = app.model('User')
    , Playlist = app.model('Playlist')

  return {

    index: function(req, res, next) {
      req.paramUser.findPlaylists(function(err, playlists) {
        if (err || !playlists) {
          return next(new app.Error(err || 500))
        }
        if (req.xhr) {
          res.json(
            app._.map(playlists, function(playlist) {
              return playlist.exposeJSON()
            })
          )
        } else {
          res.render('playlist/index', {
            user: req.paramUser.username,
            playlists: app._.map(playlists, function(playlist) {
              return playlist.exposeJSON()
            })
          })
        }
      })
    },

    read: function(req, res, next) {
      if (req.xhr) {
        res.json(req.paramPlaylist)
      } else {
        res.render('playlist/show', {
          playlist: req.paramPlaylist.exposeJSON(),
          nowPlaying: false,
          editName: false
        })
      }
    },
    
    create: function(req, res, next) {
      req.body.user = req.currentUser.username
      Playlist.create(req.body, function(err, playlist) {
        if (err || !playlist) {
          return next(new app.Error(err || 500))
        }
        res.json(playlist.exposeJSON())
      })
    },

    update: function(req, res, next) {
      req.paramPlaylist.updateAttributes(req.body)
      req.paramPlaylist.save(function(err, playlist) {
        if (err || !playlist) {
          return next(new app.Error(err || 500))
        }
        res.json(playlist.exposeJSON())
      })
    },

    delete: function(req, res, next) {
      req.paramPlaylist.remove(function(err) {
        if (err) {
          return next(new app.Error(err || 500))
        }
        res.json(1)
      })
    }

  }

}

