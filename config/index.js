var _ = require('underscore')
  , moment = require('moment')

module.exports = function(app) {

  _.mixin({
    capitalize: function(string) {
      string = '' + string
      return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
    },
    plural: function(count, singular, plural) {
      return count == 1 ? singular : plural
    }
  })

  // Restrict environments to what we anticipate
  if (['development', 'test', 'staging', 'production'].indexOf(app.set('env')) == -1) {
    app.set('env', 'development')
  }

  app._       = _
  app.moment  = moment
  app.assets  = require('./assets')[app.set('env')]
  app.pepper  = require('./pepper')

  app.auth = require('../lib/auth')
  app.lastfmCache = require('../lib/lastfm_cache')
  app.lastfmCache.initQueue()
  
  app.Error   = require('../lib/error')

  app.model = function(modelName) {
    return app.db.model(app._.capitalize(modelName))
  }

  app.controller = function(controllerName) {
    return app.controllers[app._.capitalize(controllerName)]
  }

}
