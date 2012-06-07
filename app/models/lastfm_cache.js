var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Mixed = Schema.Types.Mixed
  , app = require('../../')

var LastfmCache = module.exports = new Schema({
  method : String,
  page   : Number,
  limit  : Number,
  artist : String,
  album  : String,
  track  : String,
  json   : {}
})

mongoose.model('Lastfm_cache', LastfmCache)