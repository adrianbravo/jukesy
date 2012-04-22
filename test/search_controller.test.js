describe('Search Controller', function() {

  describe('GET /search/:query (#query)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp'), function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Search: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /search/:query/track (#queryTrack)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp') + '/track', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Search for Tracks: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /search/:query/album (#queryAlbum)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp') + '/album', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Search for Albums: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /search/:query/artist (#queryArtist)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp') + '/artist', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Search for Artists: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /artist/:artist/track/:track (#artistTrack)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/artist/' + encodeURIComponent('Röyksopp') + '/track/' + encodeURIComponent('Happy Up Here'), function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Röyksopp - Happy Up Here \(and similar tracks\)/)
        done()
      })
    })
  })
  
  describe('GET /artist/:artist (#artistAlbum)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/artist/mud/album/dirt', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/mud - dirt/)
        done()
      })
    })
  })
  
  describe('GET /artist/:artist (#artistTopTracks)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/artist/' + encodeURIComponent('Röyksopp') + '/top-tracks', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Top Tracks by Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /artist/:artist (#artistTopAlbums)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/artist/' + encodeURIComponent('Röyksopp') + '/top-albums', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Top Albums by Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /artist/:artist (#artistSimilar)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/artist/' + encodeURIComponent('Röyksopp') + '/similar', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Artists similar to Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /artist/:artist (#artist)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/artist/' + encodeURIComponent('Röyksopp'), function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/Röyksopp/)
        done()
      })
    })
  })

})
