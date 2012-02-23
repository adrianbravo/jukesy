var mongoose = require('mongoose'),
    error = require('../../lib/error'),
    bcrypt = require('../../lib/bcrypt'), // for bcrypt
    crypto = require('crypto'),           // for md5
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Mixed = Schema.Types.Mixed,
    ValidatorError = mongoose.SchemaType.ValidatorError;

var User = module.exports = new Schema({
  _username_i : { type: String, index: true }, // case-insensitive username
  email       : { type: String, unique: true, required: true },
  username    : { type: String, unique: true, required: true },
  password    : { type: String, required: true },
  status      : { type: String, enum: ['unconfirmed', 'confirmed', 'admin', 'banned'], default: 'unconfirmed' },
  _token      : { type: String },
  _salt       : { type: String },
  _confirm    : { type: String }, // used for email confirmation
  _privileges : { type: Number },

  fullname    : { type: String },
  location    : { type: String },
  website     : { type: String },
  bio         : { type: String },
});
  
User.virtual('json').get(function() {
  return {
    username : this.username,
    fullname : this.fullname,
    location : this.location,
    website  : this.website,
    bio      : this.bio
  };
});

User.static({
  accessible: [ 'fullname', 'location', 'website', 'bio' ],

  hello: 'world',

  confirm: function(email, _confirm, callback) {
    var self = this;
    if (typeof email !== 'string')
      email = '';

    this.findOne({ email: email.toLowerCase() }, function(e, user) {
      if (e)
        return callback(e, null);

      if (!user)
        return callback(new error.BadRequest('No user could be found with that email address.'), null);

      if (user._confirm != _confirm)
        return callback(new error.BadRequest('The confirmation token entered is invalid.'), null);

      user._confirm = null;
      user.status = 'confirmed';
      user.save(callback);
    });
  }
});

User.method({

  updateAttributes: function(attributes) {
    var self = this;
    this.model('User').accessible.forEach(function(attribute) {
      self[attribute] = attributes[attribute];
    });
  },

  authenticate: function(password, callback) {
    var self = this;
    bcrypt.hash(password, this._salt, function(e, hash) {
      if (e) // TODO error reporting, because this is FUCKED!
        callback(false);

      callback(hash === self.password);
    });
  }

});


//
// Validators
//

User.path('email').validate(function(v) {
  if (!v)
    return true;

  return (v.match(/^\S+@\S+\.\S+$/) != null)
}, 'bad_format');


User.path('username').validate(function(v) {
  if (!v)
    return true;

  return (v.match(/^[a-z0-9]+$/i) != null)
}, 'bad_format');

//
// Hooks
//

User.pre('validate', function(next) {
  if (!this.isNew)
    return next();

  this._username_i = (this.username) ? this.username.toLowerCase() : '';
  this.email = (this.email) ? this.email.toLowerCase() : '';

  next();
});

User.pre('validate', function(next) {
  if (!this.isNew)
    return next();

  var self = this;

  self.model('User').findOne({ $or: [
    { _username_i: self._username_i },
    { email: self.email }
  ] }, function(e, user) {
    if (user && user._username_i == self._username_i)
      return next(new ValidatorError('username', 'taken'));

    if (user && user.email == self.email)
      return next(new ValidatorError('email', 'taken'));

    next();
  });
});

User.pre('validate', function(next) {
  if (!this.isNew || !this.password)
    return next();

  var self = this;
  bcrypt.salt(function(e, salt) {
    if (e)
      return next(e);

    bcrypt.hash(self.password, salt, function(e, hash) {
      if (e)
        return next(e);

      self._salt = salt;
      self.password = hash;
      next();
    });
  });
});

User.pre('save', function(next) {
  this._confirm = crypto.createHash('md5').update(this._salt + (new Date) + Math.random()).digest('hex');
  this._token   = crypto.createHash('md5').update(this._salt + (new Date) + Math.random()).digest('hex');
  next();
});

mongoose.model('User', User);
