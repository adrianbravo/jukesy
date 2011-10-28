var mongoose = require('mongoose'),
    error = require('../../lib/error'),
    //crypto = require('crypto'),           // for md5
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Mixed = Schema.Types.Mixed,
    ValidatorError = mongoose.SchemaType.ValidatorError;

var Track = new Schema({
  artist: String,
  title: String,
  ytid: String // optional youtube id for default video
});

var Playlist = module.exports = new Schema({
  name   : { type: String, required: true },
  tracks : { type: [ Track ], required: true },
  userid : { type: ObjectId, index: { required: true } },
  slug   : { type: String, index: true }
  //private: { type: Boolean, default: true },
});

/*
Playlist.virtual('json').get(function() {
  return {
    name   : this.name,
    tracks : this.tracks
  };
});
*/

Playlist.static({
});

Playlist.method({
});


//
// Validators
//

// validate that json parses, userid exists

//
// Hooks
//

Playlist.pre('validate', function(next) {
  next();
});

mongoose.model('Playlist', Playlist);

