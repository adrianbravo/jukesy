describe('Search Controller', function() {

  describe('GET /search/:query (#query)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp'), function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/search: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /search/:query/track (#queryTrack)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp') + '/track', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/search tracks: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /search/:query/album (#queryAlbum)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp') + '/album', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/search albums: Röyksopp/)
        done()
      })
    })
  })
  
  describe('GET /search/:query/artist (#queryArtist)', function() {
    it('returns a 200 with proper metadata', function(done) {
      request.get('/search/' + encodeURIComponent('Röyksopp') + '/artist', function(res) {
        expect(res).status(200)
        expect(res.text).to.match(/search artists: Röyksopp/)
        done()
      })
    })
  })
  
})
