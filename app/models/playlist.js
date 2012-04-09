var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Mixed = Schema.Types.Mixed
  , app = require('../../')
  , validators = app.mongooseValidators

var Playlist = module.exports = new Schema({
  user    : { type: String, set: app.mongooseSetters.toLower, index: true },
  name    : { type: String, default: 'Untitled Playlist' },
  sidebar : { type: Boolean, default: false },
  tracks_count : { type: Number },
  tracks  : { type: Array, default: [] }
})

Playlist.plugin(app.mongoosePlugins.timestamps)
Playlist.plugin(app.mongoosePlugins.accessible, [ 'name', 'tracks', 'sidebar' ])

Playlist.method({
})

Playlist.static({
})

Playlist.pre('validate', function(next) {
  if (this.isNew) {
    this.user = this.user || ''
  }
  next()
})

Playlist.pre('save', function(next) {
  this.tracks_count = this.tracks.length
  next()
})

//
// Validators
//

// User
Playlist.path('user').validate(validators.required, [ 'required' ])

// Name
Playlist.path('name').validate(validators.tooLong(50), [ 'too_long', { maxlength: 50 } ])

mongoose.model('Playlist', Playlist)
