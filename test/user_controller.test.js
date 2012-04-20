describe('User Controller', function() {

  var User = app.model('user')

  beforeEach(function(done) {
    User.find().remove()
    done()
  })

  describe('GET /user (#index)', function() {

    it('returns a 501 error', function(done) {
      request.get('/user', function(res) {
        expect(res).status(501)
        done()
      })
    })

  })

  describe('GET /user/forgot (#forgot)', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })
    
    it('succeeds if the user exists', function(done) {
      request
        .post('/user/forgot')
        .send({ login: 'adrian' })
        .end(function(res) {
          expect(res).status(200)
          done()
        })
    })
    
    it('fails if the user does not exist', function(done) {
      request
        .post('/user/forgot')
        .send({ login: 'invalid' })
        .end(function(res) {
          expect(res).status(400)
          done()
        })
    })
  })
  
  describe('GET /user/:username/reset (#reset)', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test',
        reset: {
          token: 'abc', expire: app.moment().add('days', 7).utc().toDate()
        }
      }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })
    
    it('succeeds if the user sends a password and valid token', function(done) {
      request
        .post('/user/adrian/reset')
        .send({ password: 'a', token: 'abc' })
        .end(function(res) {
          expect(res).status(200)
          done()
        })
    })
    
    it('fails if the user does not send a password', function(done) {
      request
        .post('/user/adrian/reset')
        .send({ password: '', token: 'abc' })
        .end(function(res) {
          expect(res).status(400)
          done()
          // check user token still exists
        })
    })
    
    it('fails if the reset token is not a match', function(done) {
      request
        .post('/user/adrian/reset')
        .send({ password: 'password', token: 'def' })
        .end(function(res) {
          expect(res).status(401)
          done()
        })
    })
    
    it('fails if the reset token is expired', function(done) {
      user.reset.expire = app.moment().subtract('days', 7).utc().toDate()
      user.save(function(err, user) {
        expect(err).to.not.exist
        request
          .post('/user/adrian/reset')
          .send({ password: 'invalid', token: 'abc' })
          .end(function(res) {
            expect(res).status(401)
            done()
          })
      })
    })
    

  })
  
  describe('GET /user/:username (#read)', function() {
    var user

    beforeEach(function(done) {
      User.create({
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(err, u) {
        user = u
        expect(user).to.exist
        done()
      })
    })
    
    it('shows the info for an existing user', function(done) {
      request
        .get('/user/adrian')
        .set('X-Requested-With', 'XMLHttpRequest')
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.username).to.equal('adrian')
          done()
        })
    })
    
    it('returns a 404 for non-existant users', function(done) {
      request.get('/user/nope', function(res) {
        expect(res).status(404)
        done()
      })
    })
  })

  describe('PUT /user/:username (#update)', function() {
    var user, cookie
    
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
          cookie = res.headers['set-cookie'][1]
          done()
        })
      })
    })
    
    it('returns 401 if not logged in', function(done) {
      request.put('/user/adrian', {}, function(res) {
        expect(res).status(401)
        done()
      })
    })
    
    it('returns 404 if user does not exist', function(done) {
      request
        .put('/user/notadrian', {})
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
          .put('/user/notadrian', {})
          .set('cookie', cookie)
          .end(function(res) {
            expect(res).status(401)
            done()
          })
      })
    })
    
    
    it('returns 200 if logged in as right user', function(done) {
      request
        .put('/user/adrian', {})
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.username).to.equal('adrian')
          done()
        })
    })
    
    it('does not accept username field', function(done) {
      request
        .put('/user/adrian', { username: 'test' })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.username).to.equal('adrian')
          done()
        })
    })
    
    it('accepts fullname, location, and website fields', function(done) {
      request
        .put('/user/adrian', {
          fullname: 'Adrian Bravo',
          location: 'sf',
          website: 'http://jukesy.com/'
        })
        .set('cookie', cookie)
        .end(function(res) {
          expect(res).status(200)
          expect(res.body.fullname).to.equal('Adrian Bravo')
          expect(res.body.location).to.equal('sf')
          expect(res.body.website).to.equal('http://jukesy.com/')
          done()
        })
    })
    
  })

  describe('POST /user (#create)', function() {

    it('succeeds when passed username, email, and password', function(done) {
      request.post('/user', {
        username: 'adrian',
        password: 'test',
        email: 'test@test.test'
      }, function(res) {
        expect(res).status(200)
        expect(res.body.username).to.equal('adrian')
        done()
      })
    })

    it('fails when passed no username, email, or password', function(done) {
      request.post('/user', {}, function(res) {
        expect(res).status(400)
        expect(res.body.errors.password[0]).to.equal('required')
        expect(res.body.errors.username[0]).to.equal('required')
        expect(res.body.errors.email[0]).to.equal('required')
        done()
      })
    })

    it('fails when passed invalid username, email', function(done) {
      request.post('/user', {
        username: 'usernameisclearlywaytoolong',
        password: 'blerg',
        email: 'test'
      }, function(res) {
        expect(res).status(400)
        expect(res.body.errors.username[0]).to.equal('too_long')
        expect(res.body.errors.email[0]).to.equal('bad_format')
        done()
      })
    })

  })

})
