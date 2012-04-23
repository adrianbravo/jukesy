module.exports = function(app) {

  return {

    query: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query
              })
      })
    },
    
    queryTrack: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search for Tracks: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query + '/track',
                image: app.set('base_url') + '/img/jukesy-play.png'
              })
      })
    },
    queryAlbum: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search for Albums: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query + '/album'
              })
      })
    },
    queryArtist: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search for Artists: ' + req.params.query,
                url: app.set('base_url') + '/search/' + req.params.query + '/artist'
              })
      })
    },
    
    artistTrack: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: req.params.artist + ' - ' + req.params.track + ' (and similar tracks)',
                url: app.set('base_url') + '/artist/' + req.params.artist + '/track/' + req.params.track,
                image: app.set('base_url') + '/img/jukesy-play.png'
              })
      })
    },
    
    artistAlbum: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: req.params.artist + ' - ' + req.params.album,
                url: app.set('base_url') + '/artist/' + req.params.artist + '/album/' + req.params.album,
                image: app.set('base_url') + '/img/jukesy-play.png'
              })
      })
    },
    
    artistTopTracks: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Top Tracks by ' + req.params.artist,
                url: app.set('base_url') + '/artist/' + req.params.artist + '/top-tracks',
                image: app.set('base_url') + '/img/jukesy-play.png'
              })
      })
    },
    
    artistTopAlbums: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Top Albums by ' + req.params.artist,
                url: app.set('base_url') + '/artist/' + req.params.artist + '/top-albums'
              })
      })
    },

    artistSimilar: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Artists similar to ' + req.params.artist,
                url: app.set('base_url') + '/artist/' + req.params.artist + '/similar'
              })
      })
    },
    
    artist: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: req.params.artist,
                url: app.set('base_url') + '/artist/' + req.params.artist
                //type
              })
      })
    }
  }
}

