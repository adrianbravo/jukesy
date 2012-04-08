module.exports = function(app) {
  var User = app.model('User')
    , Playlist = app.model('Playlist')

  return {

    index: function(req, res, next) {
      // TODO send different data based on logged in or not
      // if logged in w/permissions, send tracks
      // otherwise, just send counts
      Playlist
        .find({ user: req.paramUser.username })
        .select('user', 'name', 'sidebar', 'tracks_count', 'time')
        .run(function(err, playlists) {
          if (err || !playlists) {
            return next(new app.Error(err || 500))
          }
          res.json(playlists)
        })
    },

    read: function(req, res, next) {
      if (req.xhr) {
        res.json(req.paramPlaylist)
      } else {
        res.render('playlist/show', { playlist: req.paramPlaylist })
      }
    },
    
    create: function(req, res, next) {
      req.body.user = req.currentUser.username
      Playlist.create(req.body, function(err, playlist) {
        if (err || !playlist) {
          return next(new app.Error(err || 500))
        }
        res.json(playlist)
      })
    },

    /*
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
    */

  }

}

