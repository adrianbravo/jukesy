describe('MongooseValidators Library', function() {

  var validators = app.mongooseValidators

  describe('#required', function() {
    it('returns false for non-strings', function() {
      expect(validators.required([])).to.be.false
      expect(validators.required({})).to.be.false
      expect(validators.required(0)).to.be.false
      expect(validators.required(null)).to.be.false
      expect(validators.required(true)).to.be.false
      expect(validators.required()).to.be.false
    })
    
    it('returns length of a string', function() {
      expect(validators.required('')).to.equal(0)
      expect(validators.required('123456')).to.equal(6)
    })
  })
  
  describe('#tooLong', function() {
    var tooLong = validators.tooLong(16)

    it('returns a function', function() {
      expect(tooLong).to.be.a('function')
    })
    
    describe('the function returned by #too_long(16)', function() {
      it('returns true if passed a string with length equal to 16', function () {
        expect(tooLong('1234567890123456')).to.be.true
      })
      
      it('returns true if passed a string with length equal to 0', function () {
        expect(tooLong('')).to.be.true
      })
      
      it('returns false if passed a string with length equal to 17', function () {
        expect(tooLong('12345678901234567')).to.be.false
      })
      
      it('returns false if passed a non-string', function () {
        expect(tooLong()).to.be.false
        expect(tooLong(0)).to.be.false
      })
    })
  })
  
  describe('#match', function() {
    var match = validators.match(/[a]+/)
    
    it('returns a function', function() {
      expect(match).to.be.a('function')
    })
    
    describe('the function returned by #match(/[a]+/)', function() {
      it('returns non-null if passed a string of a\'s', function () {
        expect(match('aaaaaaa')).to.not.equal(null)
      })
      
      it('returns null if passed a string with characters other than a', function () {
        expect(match('b')).to.equal(null)
      })
    })
  })
  
  describe('#alreadyTaken', function() {
    var alreadyTaken = validators.alreadyTaken('User', 'username')
      , User = app.model('User')
    
    it('returns a function', function() {
      expect(alreadyTaken).to.be.a('function')
    })
    
    describe('the function returned by #alreadyTaken("User", "username")', function() {
      
      beforeEach(function(done) {
        User.find().remove()
        User.create({
          username: 'username',
          email: 'a@b.c',
          password: 'test'
        }, function(err, user) {
          expect(user).to.exist
          done()
        })
      })
      
      it('passes true to callback if a username is not taken', function (done) {
        var user = new User({ username: 'otherusername' })
        
        alreadyTaken.apply(user, [ 'otherusername', function(pass) {
          expect(pass).to.be.true
          done()
        } ])
      })
            
      it('passes false to callback if a username is taken', function (done) {
        var user = new User({ username: 'username' })
        alreadyTaken.apply(user, [ 'username', function(pass) {
          expect(pass).to.be.false
          done()
        }])
      })
      
    })
  })

})