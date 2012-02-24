var app = require('../')
  , url = require('url')

module.exports = {

  required: function(v) {
    return (v instanceof String || typeof v == 'string') && v.length
  },
  
  tooLong: function(max) {
    return (function(v) {
      return (v instanceof String || typeof v == 'string') && v.length <= max
    })
  },
  
  match: function(regex) {
    return function(v) {
      return v.match(regex)
    }
  },
  
  alreadyTaken: function(model, field) {
    return function(v, done) {
      if (this.isNew || this.isModified(field)) {
        var Model = app.model(model)
          , query = {}
        
        query[field] = v
        Model.findOne(query, function(err, found) {
          done(!err && !found)
        })
      } else {
        done(true)
      }
    }
  },
  
  isURL: function(v) {
    if (!app._.isString(v) || v.length == 0) {
      return true
    }
    var parsed = url.parse(v)
    return !app._.isUndefined(parsed.protocol) && !app._.isUndefined(parsed.hostname) && true
  }

}
