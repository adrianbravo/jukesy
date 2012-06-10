var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Mixed = Schema.Types.Mixed
  , app = require('../../')

var LastfmCache = module.exports = new Schema({
  method  : { type: String, enum: [
    'artist.getsimilar', 'artist.gettopalbums', 'artist.gettoptracks', 'artist.search',
    'album.getinfo', 'album.search',
    'chart.gettopartists', 'chart.gettoptracks',
    'track.getsimilar', 'track.search'
  ] },
  page   : Number,
  limit  : Number,
  artist : { type: String, lowercase: true },
  album  : { type: String, lowercase: true },
  track  : { type: String, lowercase: true },
  json   : {}
})

mongoose.model('Lastfm_cache', LastfmCache)