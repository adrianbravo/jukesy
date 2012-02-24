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
  
  describe('#too_long', function() {
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

})