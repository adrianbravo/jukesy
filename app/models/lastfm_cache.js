var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Mixed = Schema.Types.Mixed
  , app = require('../../')

var LastfmCache = module.exports = new Schema({
  method : { type: String },
  page   : { type: Number },
  limit  : { type: Number },
  artist : { type: String, lowercase: true },
  album  : { type: String, lowercase: true },
  track  : { type: String, lowercase: true },
  json   : {},
  expiry : Date
})

LastfmCache.pre('save', function (next) {
  this.expiry = new Date(Date.now() + 604800000) // 7 days
  next()
})

mongoose.model('Lastfm_cache', LastfmCache)
