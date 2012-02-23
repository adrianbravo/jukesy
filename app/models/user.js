var mongoose = require('mongoose'),
    bcrypt = require('../../lib/bcrypt'), // for bcrypt
    crypto = require('crypto'),           // for md5
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Mixed = Schema.Types.Mixed,
    app = require('../../')

var User = module.exports = new Schema({
  username    : { type: String, unique: true },
  email       : { type: String, unique: true },
  password    : { type: String },
  salt        : { type: String },

  fullname    : { type: String },
  location    : { type: String },
  website     : { type: String },
  admin       : { type: Boolean }
})

User.plugin(app.mongoosePlugins.timestamps, { index: true })
User.plugin(app.mongoosePlugins.accessible, [ 'email', 'password', 'fullname', 'location', 'website' ])

User.method({
  exposeJSON: function(user) {
    var json = {
      username : this.username,
      fullname : this.fullname,
      location : this.location,
      website  : this.website
    }
    
    if (user && (user.id == this.id || user.admin)) {
      json.email = this.email
    }
    return json
  },
  
  checkPassword: function(password, next) {
    var self = this
    bcrypt.pepperedHash(password, this.salt, function(err, hash) {
      if (err || hash != self.password) {
        return next(err || null, false)
      }
      next(null, true)
    })
  }
})

User.static({
  findByLogin: function(login, next) {
    var User = app.model('User')
      , login = login.toLowerCase()

    User.findOne({ $or: [ { email: login }, { username: login } ] }, function(err, user) {
      if (err || !user) {
        return next(err || null)
      }
      next(null, user)
    })
  }
})

User.pre('validate', function(next) {
  if (this.isNew) {
    this.username = this.username ? this.username.toLowerCase() : ''
    this.password = this.password || ''
    this.email = this.email ? this.email.toLowerCase() : ''
  }
  next()
})

User.pre('validate', function(next) {
  if (!this.isNew && !this.isModified('password')) {
    return next()
  } else if (!this.password) {
    return next() // should be caught by required error
  }

  var self = this
  bcrypt.salt(function(err, salt) {
    if (err) {
      return next(err)
    }

    bcrypt.pepperedHash(self.password, salt, function(err, hash) {
      if (err) {
        return next(err)
      }

      self.salt = salt
      self.password = hash
      return next()
    })
  })
})


//
// Validators
//

var checkRequired = function(v) {
  return (v instanceof String || typeof v == 'string') && v.length
}

// Password

User.path('password').validate(checkRequired, [ 'required' ])

// Username

User.path('username').validate(checkRequired, [ 'required' ])

User.path('username').validate(function(v) {
  return v.length < 17
}, [ 'too_long', { maxlength: 16 } ])

User.path('username').validate(function(v) {
  return v.match(/^([a-z0-9]*)$/i)
}, [ 'bad_characters', { characters: 'A-Z and 0-9' } ])

User.path('username').validate(function(v, done) {
  if (this.isNew || this.isModified('username')) {
    var User = app.model('User')
    User.findOne({ username: v }, function(err, user) {
      done(!err && !user)
    })
  } else {
    done(true)
  }
}, [ 'already_taken' ])

// Email

User.path('email').validate(checkRequired, [ 'required' ])

User.path('email').validate(function(v) {
  return v.match(/^\S+@\S+\.\S+$/)
}, [ 'bad_format' ])

User.path('email').validate(function(v, done) {
  if (this.isNew || this.isModified('email')) {
    var User = app.model('User')
    User.findOne({ email: v }, function(err, user) {
      done(!err && !user)
    })
  } else {
    done(true)
  }
}, [ 'already_taken' ])

mongoose.model('User', User)
