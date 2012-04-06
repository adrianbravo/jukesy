var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Mixed = Schema.Types.Mixed
  , app = require('../../')
  , validators = app.mongooseValidators
    
var Playlist = module.exports = new Schema({
  user    : { type: String, set: app.mongooseSetters.toLower, index: true },
  name    : { type: String, default: 'Untitled Playlist' },
  tracks  : { type: Array, default: [] },
  share   : { type: Boolean, default: true },
  sidebar : { type: Boolean, default: false }
})

Playlist.plugin(app.mongoosePlugins.timestamps, { index: true })
Playlist.plugin(app.mongoosePlugins.accessible, [ 'name', 'tracks', 'share', 'sidebar' ])

Playlist.method({
  /*
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
    }
    return json
  },
  */
})

Playlist.static({
})

Playlist.pre('validate', function(next) {
  if (this.isNew) {
    this.user = this.user || ''
  }
  next()
})

//
// Validators
//

// User
Playlist.path('user').validate(validators.required, [ 'required' ])
//Playlist.path('user').validate(validators.isUser, [ '' ])
// similar to alreadyTaken???

// Name
//Playlist.path('name').validate(validators.required, [ 'required' ])

// Tracks
//Playlist.path('tracks').validate(validators.properJSON, [ 'bad_json' ])

mongoose.model('Playlist', Playlist)
