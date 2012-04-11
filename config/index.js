var _ = require('underscore')
  , moment = require('moment')
  , fs = require('fs')
  , express = require('express')
  , MongoStore = require('connect-mongo')

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
  app.assets  = require('./assets')[app.set('env')]
  app.mongodb = require('./mongodb')[app.set('env')]
  app.pepper  = require('./pepper')

  app.mongooseSetters = require('../lib/mongoose_setters')
  app.mongoosePlugins = require('../lib/mongoose_plugins')
  app.mongooseValidators = require('../lib/mongoose_validators')

  app.auth = require('../lib/auth')

  app.Error   = require('../lib/error')

  app.model = function(modelName) {
    return app.db.model(app._.capitalize(modelName))
  }

  app.controller = function(controllerName) {
    return app.controllers[app._.capitalize(controllerName)]
  }

  // Express config

  app.configure('development', 'staging', 'production', function() {
    app.use(express.logger('dev'))
  })

  app.configure(function() {
    var port = 3000
    switch(app.set('env')) {
      case 'production':
        port = 80
        break
      case 'test':
        port = 7357
        break
    }

    app.dynamicHelpers({
      jadeLiteral: function(req, res) {
        return function(filename) {
          return fs.readFileSync(__dirname + '/../app/views/' + filename + '.jade', 'utf8')
        }
      },
      assets: function(req, res) {
        return app.assets
      },
      currentUser: function(req, res) {
        return req.currentUser
      },
      moment: function(req, res) {
        return moment
      },
      _: function(req, res) {
        return app._
      }
    })

    app
      .set('port', port)
      .set('host', 'localhost')
      .set('views', __dirname + '/../app/views')
      .set('view engine', 'jade')

    app
      .use(express.bodyParser())
      .use(express.cookieParser())
      .use(express.session({
        secret: 'jukesy', // TODO obfuscate this
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore({
          host: app.mongodb.host,
          db: 'jukesy-sessions'
        })
      }))
      .use(express.errorHandler({ dumpExceptions: true, showStack: true }))
      .use(express.methodOverride())
      .use(express.static(__dirname + '/../public'))
      .use(app.router)
  })

}
