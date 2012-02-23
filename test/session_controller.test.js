describe('Session Controller', function() {

  var User = app.model('user')

  beforeEach(function(done) {
    User.find().remove()
    done()
  })

  describe('POST /session (#create)', function() {
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

    it('returns 200 when passed valid username and password', function(done) {
      request.post('/session', {
        login: 'test',
        password: 'test'
      }, function(res) {
        expect(res).status(200)
        done()
      })
    })

    it('returns 200 when passed valid email and password', function(done) {
      request.post('/session', {
        login: 'test@test.test',
        password: 'test'
      }, function(res) {
        expect(res).status(200)
        done()
      })
    })

    it('returns 401 when passed invalid login and password', function(done) {
      request.post('/session', {
        login: 'invalid',
        password: 'test'
      }, function(res) {
        expect(res).status(401)
        done()
      })
    })

    it('returns 401 when passed no login or password', function(done) {
      request.post('/session', {
      }, function(res) {
        expect(res).status(401)
        done()
      })
    })

  })

  describe('GET /session/refresh (#refresh)', function() {
    // returns 200 when logged in
    // returns 400 when not logged in
    // use cookie with _remember token
  })

  describe('DEL /session (#delete)', function() {
    // logs out user
    // should redirect and unset user cookie
  })

})
