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
}, { strict: true })

Playlist.plugin(app.mongoosePlugins.timestamps)
Playlist.plugin(app.mongoosePlugins.accessible, [ 'name', 'tracks', 'sidebar' ])

Playlist.method({
  exposeJSON: function() {
    var json = {
      _id          : this._id,
      user         : this.user,
      name         : this.name,
      sidebar      : this.sidebar,
      tracks       : this.tracks,
      tracks_count : this.tracks_count,
      time         : this.time,
      url: '/user/' + this.user + '/playlist/' + this.id
    }
    return json
  }
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
Playlist.path('name').validate(validators.required, [ 'required' ])
Playlist.path('name').validate(validators.tooLong(50), [ 'too_long', { maxlength: 50 } ])

mongoose.model('Playlist', Playlist)
