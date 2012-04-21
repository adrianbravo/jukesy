var mongoose = require('mongoose')
  , bcrypt = require('../../lib/bcrypt') // for bcrypt
  , crypto = require('crypto')           // for md5
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Mixed = Schema.Types.Mixed
  , app = require('../../')
  , validators = app.mongooseValidators
    
var User = module.exports = new Schema({
  username    : { type: String, unique: true, set: app.mongooseSetters.toLower },
  email       : { type: String, unique: true, set: app.mongooseSetters.toLower },
  password    : { type: String },
  salt        : { type: String },
  bio         : { type: String },
  fullname    : { type: String },
  location    : { type: String },
  website     : { type: String },
  admin       : { type: Boolean },
  reset : {
    token: { type: String },
    expire: { type: Date }
  }
}, { strict: true })

User.plugin(app.mongoosePlugins.timestamps, { index: true })
User.plugin(app.mongoosePlugins.accessible, [ 'email', 'password', 'fullname', 'location', 'website', 'bio' ])

User.method({
  exposeJSON: function(user) {
    var json = {
      username : this.username,
      fullname : this.fullname,
      bio      : this.bio,
      location : this.location,
      website  : this.website
    }
    
    if (user && (user.id == this.id || user.admin)) {
      json.email = this.email
      json._id = this._id
    }
    if (this.playlists) {
      json.playlists = app._.map(this.playlists, function(playlist) {
        return playlist.exposeJSON()
      })
    }
    return json
  },
  
  findPlaylists: function(next) {
    app.model('Playlist')
      .find({ user: this.username })
      .select('user', 'name', 'sidebar', 'tracks_count', 'time')
      .run(next)
  },
  
  checkPassword: function(password, next) {
    var self = this
    bcrypt.pepperedHash(password, this.salt, function(err, hash) {
      if (err || hash != self.password) {
        return next(err || null, false)
      }
      next(null, true)
    })
  },
  
  generateResetToken: function(next) {
    this.reset = {
      token: crypto.createHash('md5').update(new Date + Math.random()).digest('hex'),
      expire: app.moment().add('days', 7).utc().toDate()
    }
    this.save(next)
  },

  resetPassword: function(attrs, next) {
    if (!attrs.password) {
      return next(new app.Error(400, { $: 'reset_password_required' }))
    } else if (!this.validResetToken(attrs.token)) {
      return next(new app.Error(401, { $: 'reset_token_expired' }))
    }
    this.password = attrs.password
    this.reset = null
    this.save(next)
  },
  
  validResetToken: function(token) {
    return (!this.reset || this.reset.expire < app.moment().utc().toDate() || token != this.reset.token) ? false : true
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
    this.username = this.username || ''
    this.password = this.password || ''
    this.email = this.email || ''
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

// Username
User.path('username').validate(validators.required, [ 'required' ])
User.path('username').validate(validators.tooLong(16), [ 'too_long', { maxlength: 16 } ])
User.path('username').validate(validators.match(/^([a-z0-9]*)$/i), [ 'bad_characters', { characters: 'A-Z and 0-9' } ])
User.path('username').validate(validators.alreadyTaken('User', 'username'), [ 'already_taken' ])

// Password
User.path('password').validate(validators.required, [ 'required' ])

// Email
User.path('email').validate(validators.required, [ 'required' ])
User.path('email').validate(validators.tooLong(200), [ 'too_long', { maxlength: 200 } ])
User.path('email').validate(validators.match(/^\S+@\S+\.\S+$/), [ 'bad_format' ])
User.path('email').validate(validators.alreadyTaken('User', 'email'), [ 'already_taken' ])

// Bio
User.path('bio').validate(validators.tooLong(1000), [ 'too_long', { maxlength: 1000 } ])

// Full Name
User.path('fullname').validate(validators.tooLong(100), [ 'too_long', { maxlength: 100 } ])

// Location
User.path('location').validate(validators.tooLong(100), [ 'too_long', { maxlength: 100 } ])

// Website
User.path('website').validate(validators.tooLong(200), [ 'too_long', { maxlength: 200 } ])
User.path('website').validate(validators.isURL, [ 'bad_format' ])

mongoose.model('User', User)
