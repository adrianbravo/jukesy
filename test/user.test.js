describe('User Model', function() {

  var User = app.model('user')

  beforeEach(function(done) {
    User.find().remove()
    done()
  })

  describe('#create', function() {

    describe('required error', function() {

      it('occurs when username, password, or email is blank', function(done) {
        User.create({
          email: ''
        }, function(err, user) {
          expect(user).to.not.exist
          expect(err.errors.username.type[0]).to.equal('required')
          expect(err.errors.username.type[1]).to.not.exist
          expect(err.errors.password.type[0]).to.equal('required')
          expect(err.errors.password.type[1]).to.not.exist
          expect(err.errors.email.type[0]).to.equal('required')
          expect(err.errors.email.type[1]).to.not.exist
          done()
        })
      })

    })

    describe('too_long error', function() {
      var createString = function(length) {
        var string = ''
        for (i = 0; i < length; i++) {
          string += 'a'
        }
        return string
      }
      
      it('occurs when username.length is greater than 16', function(done) {
        User.create({ username: '1234567890abcdefh' }, function(err, user) {
          expect(err.errors.username.type[0]).to.equal('too_long')
          expect(err.errors.username.type[1].maxlength).to.equal(16)
          done()
        })
      })
      
      it('occurs when email.length is greater than 200', function(done) {
        User.create({ email: createString(201) }, function(err, user) {
          expect(err.errors.email.type[0]).to.equal('too_long')
          expect(err.errors.email.type[1].maxlength).to.equal(200)
          done()
        })
      })
      
      it('occurs when bio.length is greater than 200', function(done) {
        User.create({ bio: createString(1001) }, function(err, user) {
          expect(err.errors.bio.type[0]).to.equal('too_long')
          expect(err.errors.bio.type[1].maxlength).to.equal(1000)
          done()
        })
      })

      it('occurs when fullname.length is greater than 100', function(done) {
        User.create({ fullname: createString(101) }, function(err, user) {
          expect(err.errors.fullname.type[0]).to.equal('too_long')
          expect(err.errors.fullname.type[1].maxlength).to.equal(100)
          done()
        })
      })

      it('occurs when location.length is greater than 100', function(done) {
        User.create({ location: createString(101) }, function(err, user) {
          expect(err.errors.location.type[0]).to.equal('too_long')
          expect(err.errors.location.type[1].maxlength).to.equal(100)
          done()
        })
      })

      it('occurs when website.length is greater than 200', function(done) {
        User.create({ website: createString(201) }, function(err, user) {
          expect(err.errors.website.type[0]).to.equal('too_long')
          expect(err.errors.website.type[1].maxlength).to.equal(200)
          done()
        })
      })

    })
    
    describe('bad_characters error', function() {

      it('occurs when username is has non-accepted characters', function(done) {
        User.create({
          username: '.',
        }, function(err, user) {
          expect(user).to.not.exist
          expect(err.errors.username.type[0]).to.equal('bad_characters')
          expect(err.errors.username.type[1]).to.have.keys('characters')
          done()
        })
      })

    })

    describe('bad_format error', function() {

      it('occurs when email does not match pattern', function(done) {
        User.create({
          email: 'a'
        }, function(err, user) {
          expect(user).to.not.exist
          expect(err.errors.email.type[0]).to.equal('bad_format')
          expect(err.errors.email.type[1]).to.not.exist
          done()
        })
      })
      
      it('occurs when website does not match pattern', function(done) {
        User.create({
          website: 'a'
        }, function(err, user) {
          expect(user).to.not.exist
          expect(err.errors.website.type[0]).to.equal('bad_format')
          expect(err.errors.website.type[1]).to.not.exist
          done()
        })
      })

    })

    describe('already_taken error', function() {
      var user

      beforeEach(function(done) {
        User.create({
          username : 'test1',
          email    : 'test2@test.test',
          password : 'test3'
        }, function(err, u) {
          user = u
          expect(user).to.exist
          done()
        })
      })

      it('does not occur when record is not new and email or username are unmodified', function(done) {
        user.save(function(err, user) {
          expect(err).to.not.exist
          done()
        })
      })

      it('occurs when username or email are modified and taken', function(done) {
        User.create({
          username: 'newusername',
          email: 'newemail@test.test',
          password: 'test'
        }, function(err, user2) {
          user.username = 'newusername'
          user.email = 'newemail@test.test'
          user.save(function(err, user) {
            expect(err).to.exist
            expect(err.errors.username.type[0]).to.equal('already_taken')
            expect(err.errors.username.type[1]).to.not.exist
            expect(err.errors.email.type[0]).to.equal('already_taken')
            expect(err.errors.email.type[1]).to.not.exist
            done()
          })
        })
      })

      it('occurs when username is taken', function(done) {
        User.create({
          username : 'test1',
          email    : 'testb@test.test',
          password : 'testc'
        }, function(err, user) {
          expect(user).to.not.exist
          expect(err.errors.username.type[0]).to.equal('already_taken')
          expect(err.errors.username.type[1]).to.not.exist
          done()
        })
      })

      it('occurs when email is taken', function(done) {
        User.create({
          username : 'testa',
          email    : 'test2@test.test',
          password : 'testc'
        }, function(err, user) {
          expect(user).to.not.exist
          expect(err.errors.email.type[0]).to.equal('already_taken')
          expect(err.errors.email.type[1]).to.not.exist
          done()
        })
      })

    })


    describe('successfully', function() {
      var user

      beforeEach(function(done) {
        User.create({
          username : 'TEST1',
          email    : 'TEST2@test.test',
          password : 'TEST3!'
        }, function(err, u) {
          user = u
          expect(user).to.exist
          done()
        })
      })

      it('adds time data', function(done) {
        expect(user.time).to.exist
        expect(user.time.created).to.exist
        expect(user.time.updated).to.exist
        // TODO find a way to test these are instances of Date
        done()
      })

      it('hashes the password', function(done) {
        expect(user.salt).to.exist
        expect(user.password).to.not.equal('TEST3')
        expect(user.password).to.match(/[a-z0-9\$]+/i)
        done()
      })

      it('lowercases email and username', function(done) {
        expect(user.username).to.equal('test1')
        expect(user.email).to.equal('test2@test.test')
        done()
      })

    })

  })

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

})

