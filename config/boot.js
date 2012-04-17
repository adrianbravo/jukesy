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
      app.db = mongoose.connect(mongodbURL)
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
    },

    // Bootstrap charts JSON
    function(next) {
      var artists, tracks
      try {
        artists = JSON.parse(fs.readFileSync(__dirname + '/../public/chart/topartists.json'))
        tracks = JSON.parse(fs.readFileSync(__dirname + '/../public/chart/toptracks.json'))
      } catch (e) {
        console.error('Error: Could not bootstrap top charts JSON.')
      }
      app.charts = JSON.stringify({ artists: artists, tracks: tracks })
      next()
    }

  ], bootCallback)

}
