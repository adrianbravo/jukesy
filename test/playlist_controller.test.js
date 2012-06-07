describe('Playlist Controller', function() {

  var User = app.model('user')
    , Playlist = app.model('playlist')

  beforeEach(function(done) {
    User.find().remove()
    Playlist.find().remove()
    done()
  })

  describe('GET /user/:username/playlist (#index)', function() {
    var user

    beforeEach(function(done) {
      User.create({ username: 'adrian', password: 'pw', email: 'own@test.test' }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })

    it('returns a 200 if user exists', function(done) {
      request.get('/user/adrian/playlist', function(res) {
        expect(res).status(200)
        done()
      })
    })

    it('returns a 404 if user does not exist', function(done) {
      request.get('/user/osfjaofjsf/playlist', function(res) {
        expect(res).status(404)
        done()
      })
    })

    it('returns all playlists for the user', function(done) {
      Playlist.create({ user: user.username, name: 'Durr' }, function(err, playlist) {
        expect(playlist).to.exist
        Playlist.create({ user: user.username }, function(err, playlist) {
          expect(playlist).to.exist
          request
            .get('/user/adrian/playlist')
            .set('X-Requested-With', 'XMLHttpRequest')
            .end(function(res) {
              expect(res).status(200)
              expect(res.body).to.have.length(2)
              done()
            })
        })
      })
    })
  })


  describe('GET /user/:username/playlist/:playlist (#read)', function() {
    var user, playlist

    beforeEach(function(done) {
      User.create({ username: 'adrian', password: 'pw', email: 'own@test.test' }, function(err, u) {
        user = u
        expect(user).to.exist
        Playlist.create({ user: user.username, name: 'Durr' }, function(err, p) {
          playlist = p
          expect(playlist).to.exist
          done()
        })
      })
    })

    it('returns a 200 if playlist exists', function(done) {
      request
        .get('/user/adrian/playlist/' + playlist.id)
        .set('X-Requested-With', 'XMLHttpRequest')
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.user).to.equal(user.username)
          done()
        })
    })

    it('returns a 404 if playlist does not exist', function(done) {
      request.get('/user/adrian/playlist/4f7e536db5e0942238000010', function(res) {
        expect(res).status(404)
        done()
      })
    })

    it('returns a 500 if playlist does not exist and id is malformed', function(done) {
      request.get('/user/adrian/playlist/invalid', function(res) {
        expect(res).status(500)
        done()
      })
    })
  })
  
  describe('POST /user/:username/playlist (#create)', function() {
    var user, cookie, user2, cookie2
    
    // TODO dry this up wtf
    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        request.post('/session', {
          login: 'adrian',
          password: 'test'
        }, function(res) {
          expect(res).status(200)
          cookie = res.headers['set-cookie'][0]
          User.create({
            username: 'adrian2',
            password: 'test2',
            email: 'test2@test.test'
          }, function(err, u) {
            user2 = u
            expect(user2).to.exist
            request.post('/session', {
              login: 'adrian2',
              password: 'test2'
            }, function(res) {
              expect(res).status(200)
              cookie2 = res.headers['set-cookie'][0]
              done()
            })
          })
        })
      })
    })

    it('returns 200 and json when logged in and passed valid data', function(done) {
      request
        .post('/user/adrian/playlist', {
          name: 'Funk',
          sidebar: true,
          tracks: [
            { artist: 'Sly & the Family Stone', name: 'Spaced Cowboy' },
            { artist: 'Sly & the Family Stone', name: 'Family Affair' }
          ]
        })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.user).to.equal('adrian')
          expect(res.body.name).to.equal('Funk')
          expect(res.body.sidebar).to.be.true
          expect(res.body.tracks).to.have.length(2)
          expect(res.body._id).to.exist
          done()
        })
    })
    
    it('fails when logged in as a different user', function(done) {
      request
        .post('/user/adrian/playlist', {})
        .set('cookie', cookie2)
        .end(function(res) {
          expect(res).status(401)
          done()
        })
    })
    
    it('fails when not logged in', function(done) {
      request
        .post('/user/adrian/playlist', {})
        .end(function(res) {
          expect(res).status(401)
          done()
        })
    })
    
    /*
    it('fails when sent invalid json is passed for tracks', function(done) {
      request
        .post('/user/adrian/playlist', {
          name: 'Funk',
          tracks: 'invalid',
          sidebar: true
        })
        .set('cookie', cookie)
        .end(function(res) {
          console.log(res)
          expect(res).status(400)
          done()
        })
    })
    */
  })
  
  describe('PUT /user/:username/playlist/:playlist (#update)', function() {
    var user, playlist, cookie
    
    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        Playlist.create({
          user: user.username
        }, function(err, p) {
          playlist = p
          expect(playlist).to.exist
          request.post('/session', {
            login: 'adrian',
            password: 'test'
          }, function(res) {
            expect(res).status(200)
            cookie = res.headers['set-cookie'][0]
            done()
          })
        })
      })
    })
    
    it('returns 401 if not logged in', function(done) {
      request.put('/user/adrian/playlist/' + playlist.id, {}, function(res) {
        expect(res).status(401)
        done()
      })
    })
    
    it('returns 404 if user does not exist', function(done) {
      request
        .put('/user/notadrian/playlist/' + playlist.id, {})
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(404)
          done()
        })
    })
    
    it('returns 401 if logged in as different user', function(done) {
      User.create({
        username: 'notadrian',
        password: 'test',
        email: 'test2@test.test'
      }, function(err, u) {
        request
          .put('/user/notadrian/playlist/' + playlist.id, {})
          .set('cookie', cookie)
          .end(function(res) {
            expect(res).status(404)
            done()
          })
      })
    })
    
    it('returns 200 if logged in as right user', function(done) {
      request
        .put('/user/adrian/playlist/' + playlist.id, {})
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.user).to.equal('adrian')
          done()
        })
    })
    
    it('does not accept username field', function(done) {
      request
        .put('/user/adrian/playlist/' + playlist.id, { user: 'test' })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.user).to.equal('adrian')
          done()
        })
    })
    
    it('accepts name, tracks, sidebar, and autosave fields', function(done) {
      request
        .put('/user/adrian/playlist/' + playlist.id, {
          name: 'funk',
          tracks: [ { artist: 'alanis morissette', name: 'ironic' }],
          sidebar: true,
          autosave: false
        })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.name).to.eql('funk')
          expect(res.body.tracks).to.have.length(1)
          expect(res.body.sidebar).to.be.true
          expect(res.body.autosave).to.be.false
          done()
        })
    })
    
  })

  describe('DELETE /user/:username/playlist/:playlist (#delete)', function() {
    var user, playlist, cookie
    
    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        Playlist.create({
          user: user.username
        }, function(err, p) {
          playlist = p
          expect(playlist).to.exist
          request.post('/session', {
            login: 'adrian',
            password: 'test'
          }, function(res) {
            expect(res).status(200)
            cookie = res.headers['set-cookie'][0]
            done()
          })
        })
      })
    })
    
    it('returns 401 if not logged in', function(done) {
      request
        .del('/user/adrian/playlist/' + playlist.id, function(res) {
        expect(res).status(401)
        done()
      })
    })
    
    it('returns 404 if user does not exist', function(done) {
      request
        .del('/user/notadrian/playlist/' + playlist.id)
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(404)
          done()
        })
    })
    
    it('returns 401 if logged in as different user', function(done) {
      User.create({
        username: 'notadrian',
        password: 'test',
        email: 'test2@test.test'
      }, function(err, u) {
        request
          .del('/user/notadrian/playlist/' + playlist.id)
          .set('cookie', cookie)
          .end(function(res) {
            expect(res).status(404)
            done()
          })
      })
    })
    
    it('returns 200 if logged in as right user', function(done) {
      request
        .del('/user/adrian/playlist/' + playlist.id)
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body).to.equal(1)
          done()
        })
    })
        
  })
  
  describe('PUT /user/:username/playlist/:playlist/tracks/add (#add)', function() {
    var user, playlist, cookie
    
    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        Playlist.create({
          user: user.username
        }, function(err, p) {
          playlist = p
          expect(playlist).to.exist
          request.post('/session', {
            login: 'adrian',
            password: 'test'
          }, function(res) {
            expect(res).status(200)
            cookie = res.headers['set-cookie'][0]
            done()
          })
        })
      })
    })
    
    it('returns 401 if not logged in', function(done) {
      request.put('/user/adrian/playlist/' + playlist.id + '/tracks/add', {}, function(res) {
        expect(res).status(401)
        done()
      })
    })
    
    it('returns 404 if user does not exist', function(done) {
      request
        .put('/user/notadrian/playlist/' + playlist.id + '/tracks/add', {})
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(404)
          done()
        })
    })
    
    it('returns 401 if logged in as different user', function(done) {
      User.create({
        username: 'notadrian',
        password: 'test',
        email: 'test2@test.test'
      }, function(err, u) {
        request
          .put('/user/notadrian/playlist/' + playlist.id + '/tracks/add', {})
          .set('cookie', cookie)
          .end(function(res) {
            expect(res).status(404)
            done()
          })
      })
    })
    
    it('returns 200 if logged in as right user', function(done) {
      request
        .put('/user/adrian/playlist/' + playlist.id + '/tracks/add', {})
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.user).to.equal('adrian')
          done()
        })
    })
    
    it('does not accept username, name, or sidebar fields', function(done) {
      request
        .put('/user/adrian/playlist/' + playlist.id + '/tracks/add', { user: 'test', name: 'hello', sidebar: false })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.user).to.equal('adrian')
          expect(res.body.name).to.equal('Untitled Playlist')
          expect(res.body.sidebar).to.be.false
          done()
        })
    })
    
    it('accepts tracks field', function(done) {
      request
        .put('/user/adrian/playlist/' + playlist.id + '/tracks/add', {
          tracks: [ { artist: 'okay', name: 'okay' }]
        })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.tracks).to.have.length(1)
          done()
        })
    })
    
  })
  

})
