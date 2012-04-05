describe('Playlist Model', function() {

  var User = app.model('user')
    , Playlist = app.model('playlist')

  beforeEach(function(done) {
    User.find().remove()
    //Playlist.find().remove()
    done()
  })

  describe('#create', function() {

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
          Playlist.create({ user: u.username }, function(err, p) {
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
        expect(playlist.tracks).to.have.length(0)
        done()
      })
    })
  })

/*

  describe('#exposeJSON', function() {
    var user, admin

    beforeEach(function(done) {
      User.create({
        username: 'tester',
        email: 'test@test.test',
        password: 'test',
        fullname: 'test bravo',
        location: 'sf',
        website: 'http://jukesy.com'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        User.create({
          username: 'admin',
          email: 'admin@test.test',
          password: 'admin',
          fullname: 'admian bravo',
          admin: true
        }, function(err, a) {
          admin = a
          expect(admin).to.exist
          done()
        })
      })
    })
    
    it('does not return sensitive data when passed a null viewer', function(done) {
      var json = user.exposeJSON()
      expect(json).to.exist
      expect(json).to.have.keys('username', 'fullname', 'location', 'website', 'bio')
      expect(json).to.not.have.keys('email', 'password')
      done()
    })
    
    it('does not return sensitive data when passed a non-admin, non-self viewer', function(done) {
      var json = user.exposeJSON(new User)
      expect(json).to.exist
      expect(json).to.have.keys('username', 'fullname', 'location', 'website', 'bio')
      expect(json).to.not.have.keys('email', 'password')
      done()
    })
    
    it('returns sensitive data when viewer is user', function(done) {
      var json = user.exposeJSON(user)
      expect(json).to.exist
      expect(json).to.have.keys('email', 'username', 'fullname', 'location', 'website', 'bio')
      expect(json).to.not.have.keys('password')
      done()
    })

    it('returns sensitive data when viewer is admin', function(done) {
      var json = user.exposeJSON(admin)
      expect(json).to.exist
      expect(json).to.have.keys('email', 'username', 'fullname', 'location', 'website', 'bio')
      expect(json).to.not.have.keys('password')
      done()
    })

  })

  describe('#updateAttributes (accessible plugin)', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'tester',
        email: 'test@test.test',
        password: 'test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })

    it('removes attributes that are not in User.accessible', function(done) {
      user.updateAttributes({
        username: 'blerg'
      })
      expect(user.username).to.not.equal('blerg')
      done()
    })

    it('allows attributes that are in User.accessible', function(done) {
      user.updateAttributes({
        email: 'test2@test.test',
        password: 'test3',
        fullname: 'test name',
        location: 'sf',
        website: 'jukesy'
      })
      expect(user.email).to.equal('test2@test.test')
      expect(user.password).to.equal('test3')
      expect(user.fullname).to.equal('test name')
      expect(user.location).to.equal('sf')
      expect(user.website).to.equal('jukesy')
      done()
    })

  })


  describe('#checkPassword', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'test',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })
    
    it('returns null, true if password is valid', function(done) {
      user.checkPassword('test', function(error, valid) {
        expect(error).to.not.exist
        expect(valid).to.be.true
        done()
      })
    })

    it('returns null, false if password is invalid', function(done) {
      user.checkPassword('TEST', function(error, valid) {
        expect(error).to.not.exist
        expect(valid).to.be.false
        done()
      })
    })

  })
  
  describe('#findByLogin', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'test',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })

    it('finds a user with a username', function(done) {
      User.findByLogin('test', function(err, user) {
        expect(err).to.not.exist
        expect(user).to.exist
        done()
      })
    })

    it('finds a user without case sensitivity for login', function(done) {
      User.findByLogin('TEST', function(err, user) {
        expect(err).to.not.exist
        expect(user).to.exist
        done()
      })
    })

    it('finds a user with an email', function(done) {
      User.findByLogin('test@test.test', function(err, user) {
        expect(err).to.not.exist
        expect(user).to.exist
        done()
      })
    })

    it('errors with invalid login', function(done) {
      User.findByLogin('invalid', function(err, user) {
        expect(user).to.not.exist
        expect(err).to.not.exist
        done()
      })
    })

  })

  describe('#time (timestamps plugin)', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'tester',
        email: 'test@test.test',
        password: 'test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        setTimeout(done, 1000)
      })
    })

    it('sets time.created only on create', function(done) {
      var created = user.time.created
      user.save(function(err, user) {
        expect(user).to.exist
        expect(user.time.created).to.equal(created)
        done()
      })
    })

    it('sets time.updated on update', function(done) {
      var updated = user.time.updated
      user.save(function(err, user) {
        expect(user).to.exist
        expect(user.time.updated).to.not.equal(updated)
        done()
      })
    })

  })
  */

})
