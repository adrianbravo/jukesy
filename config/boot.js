Error.stackTraceLimit = Infinity;

var mongoose = require('mongoose')
  , fs = require('fs')
  , async = require('async')

module.exports = function(app, bootCallback) {
  var config = require('./')(app)

  async.series([

    // Load models
    function(next) {
      var ext = '.js'
      fs.readdirSync(__dirname + '/../app/models').forEach(function(filename) {
        if (!filename.match(ext + '$')) {
          return
        }
        require(__dirname + '/../app/models/' + filename)
      })
      next()
    },

    // Connect to mongoose
    function(next) {
      var mongodbURL = 'mongodb://' + app.mongodb.host + '/' + app.mongodb.database
      app.db = mongoose.connect(mongodbURL, { autoReconnect: true })
      next()
    },

    // Load controllers
    function(next) {
      app.controllers = {}

      var ext = '_controller.js'
      fs.readdirSync(__dirname + '/../app/controllers').forEach(function(filename) {
        if (!filename.match(ext + '$')) {
          return
        }
        var controller = require(__dirname + '/../app/controllers/' + filename)(app)
          , controllerName = ''
        filename.replace(new RegExp(ext + '$'), '').split('_').forEach(function(token) {
          controllerName += app._.capitalize(token)
        })
        app.controllers[controllerName] = controller
      })
      next()
    }

  ], bootCallback)

}
