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

  app.set('base_url', {
    development : 'http://127.0.0.1:3000',
    test        : 'http://127.0.0.1:7357',
    staging     : 'http://staging.jukesy.com',
    production  : 'http://jukesy.com'
  }[app.set('env')])

  app.set('port', {
    development : '3000',
    test        : '7357',
    staging     : '4000',
    production  : '3000'
  }[app.set('env')])

  app._       = _
  app.moment  = moment
  app.assets  = require('./assets')[app.set('env')]
  app.mongodb = require('./mongodb')[app.set('env')]
  app.pepper  = require('./pepper')

  app.mongooseSetters = require('../lib/mongoose_setters')
  app.mongoosePlugins = require('../lib/mongoose_plugins')
  app.mongooseValidators = require('../lib/mongoose_validators')

  app.auth = require('../lib/auth')
  
  app.meta = function(meta) {
    return app._.extend({
      title       : 'jukesy - watch music videos',
      description : 'Jukesy is an application that helps you watch music videos from YouTube. With Jukesy, you can create playlists, discover new music, listen to your favorite albums, and more.',
      image       : 'http://static2.jukesy.com/img/jukesy-256.png',
      type        : 'website',
      url         : 'http://jukesy.com'
    }, meta)
  }

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
    app.dynamicHelpers({
      jadeLiteral: function(req, res) {
        return function(filename) {
          return fs.readFileSync(__dirname + '/../app/views/' + filename + '.jade', 'utf8')
        }
      },
      env: function() { return app.set('env') },
      assets: function() { return app.assets },
      currentUser: function(req, res) { return req.currentUser },
      moment: function() { return app.moment },
      _: function() { return app._ },
      Charts: function() { return app.charts }
    })

    app
      .set('host', 'localhost')
      .set('views', __dirname + '/../app/views')
      .set('view engine', 'jade')

    app
      .use(express.bodyParser())
      .use(express.cookieParser())
      .use(express.session({
        secret: 'jukesy', // TODO clean this up
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore({
          auto_reconnect: true,
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
