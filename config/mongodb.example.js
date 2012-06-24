var mongoose = require('mongoose')
  , fs = require('fs')

module.exports = function(app, callback) {
  var databaseConfig = {
    development: {
      host     : 'localhost',
      database : 'jukesy-development'
    },
    test: {
      host     : 'localhost',
      database : 'jukesy-test'
    },
    staging: {
      host     : 'localhost',
      database : 'jukesy-staging'
    },
    production: {
      host     : 'localhost',
      database : 'jukesy'
    }
  }

  app.mongodb = databaseConfig[app.set('env')]
  app.mongooseSetters = require('../lib/mongoose_setters')
  app.mongoosePlugins = require('../lib/mongoose_plugins')
  app.mongooseValidators = require('../lib/mongoose_validators')

  var mongodbURL = 'mongodb://' + app.mongodb.host + '/' + app.mongodb.database
  app.db = mongoose.connect(mongodbURL)
  callback()
}

