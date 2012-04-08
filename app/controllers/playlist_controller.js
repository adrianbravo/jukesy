module.exports = function(app) {
  var User = app.model('User')
    , Playlist = app.model('Playlist')

  return {

    index: function(req, res, next) {
      req.paramUser.findPlaylists(function(err, playlists) {
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
        res.render('playlist/show', {
          playlist: req.paramPlaylist,
          nowPlaying: false,
          edit: false
        })
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

    update: function(req, res, next) {
      req.paramPlaylist.updateAttributes(req.body)
      req.paramPlaylist.save(function(err, playlist) {
        if (err || !playlist) {
          return next(new app.Error(err || 500))
        }
        res.json(playlist)
      })
    },

    /*
    delete: function(req, res, next) {
      next(new app.Error(501))
    }
    */

  }

}

