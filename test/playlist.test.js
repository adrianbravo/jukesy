describe('Playlist Model', function() {

  var User = app.model('user')
    , Playlist = app.model('playlist')

  beforeEach(function(done) {
    User.find().remove()
    //Playlist.find().remove()
    done()
  })

  describe('#create', function() {

    describe('too_long error', function() {
      var createString = function(length) {
        var string = ''
        for (i = 0; i < length; i++) {
          string += 'a'
        }
        return string
      }
      it('occurs when playlist.name is greater than 50', function(done) {
        Playlist.create({ user: 'test', name: createString(51) }, function(err, playlist) {
          expect(err.errors.name.type[0]).to.equal('too_long')
          expect(err.errors.name.type[1].maxlength).to.equal(50)
          done()
        })
      })
    })
    
    describe('required error', function() {
      it('occurs when user is blank', function(done) {
        Playlist.create({}, function(err, playlist) {
          expect(playlist).to.not.exist
          expect(err.errors.user.type[0]).to.equal('required')
          expect(err.errors.user.type[1]).to.not.exist
          done()
        })
      })
    })

    // json parse errors?
    // non-existant user errors?

    describe('successfully', function() {
      var user, playlist

      beforeEach(function(done) {
        User.create({
          username : 'adrian',
          email    : 'adrian@test.test',
          password : 'pw'
        }, function(err, u) {
          user = u
          expect(user).to.exist
          Playlist.create({
            user: u.username,
            tracks: [ 0, 1, 2, 3 ]
          }, function(err, p) {
              playlist = p
              expect(playlist).to.exist
              done()
            })
        })
      })

      it('adds time data', function(done) {
        expect(playlist.time).to.exist
        expect(playlist.time.created).to.exist
        expect(playlist.time.updated).to.exist
        done()
      })

      it('adds default name and tracks', function(done) {
        expect(playlist.name).to.equal('Untitled Playlist')
        expect(playlist.tracks).to.be.an.instanceof(Array)
        expect(playlist.tracks).to.have.length(4)
        done()
      })
      
      it('sets tracks_count based on tracks size', function(done) {
        expect(parseInt(playlist.tracks_count)).to.eql(4)
        done()
      })

    })
  })

})
