module.exports = function(app) {

  return {

    query: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search: ' + req.params.query,
                url: null
              })
      })
    },
    
    queryTrack: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search for Tracks: ' + req.params.query,
                image: app.set('base_url') + '/img/jukesy-play.png',
                url: null
              })
      })
    },
    queryAlbum: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search for Albums: ' + req.params.query,
                url: null
              })
      })
    },
    queryArtist: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Search for Artists: ' + req.params.query,
                url: null
              })
      })
    },
    
    artistTrack: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: req.params.artist + ' - ' + req.params.track + ' (and similar tracks)',
                image: app.set('base_url') + '/img/jukesy-play.png',
                url: null
              })
      })
    },
    
    artistAlbum: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: req.params.artist + ' - ' + req.params.album,
                image: app.set('base_url') + '/img/jukesy-play.png',
                url: null
              })
      })
    },
    
    artistTopTracks: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Top Tracks by ' + req.params.artist,
                image: app.set('base_url') + '/img/jukesy-play.png',
                url: null
              })
      })
    },
    
    artistTopAlbums: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Top Albums by ' + req.params.artist,
                url: null
              })
      })
    },

    artistSimilar: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: 'Artists similar to ' + req.params.artist,
                url: null
              })
      })
    },
    
    artist: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta({
                title: req.params.artist,
                url: null
                //type
              })
      })
    }
  }
}

