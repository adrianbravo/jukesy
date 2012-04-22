module.exports = function(app) {

  return {

    query: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'search: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query
              })
      })
    },
    
    queryTrack: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'search tracks: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query + '/track'
              })
      })
    },
    queryAlbum: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'search albums: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query + '/album'
              })
      })
    },
    queryArtist: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'search artists: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query + '/artist'
              })
      })
    },

  }
}

