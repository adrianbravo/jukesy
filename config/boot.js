Error.stackTraceLimit = Infinity;

var fs = require('fs')
  , exec = require('child_process').exec
  , async = require('async')

module.exports = function(app, bootCallback) {
  var config = require('./')(app)

  async.series([

    // Set gitsha
    function(next) {
      if (app.set('env') == 'test') {
        return next()
      }

      exec('git rev-parse --short HEAD', function(err, gitsha) {
        if (err) {
          console.error('Failed to get gitsha')
          return
        }
        app.gitsha = gitsha
        next()
      })
    },

    // Connect to mongodb
    function(next) {
      require('./mongodb')(app, next)
    },

    // Load models
    function(next) {
      var ext = '.js'
      fs.readdirSync(__dirname + '/../app/models').forEach(function(filename) {
        if (!filename.match(ext + '$')) {
          console.error('Failed to load model:', filename)
          return
        }
        require(__dirname + '/../app/models/' + filename)
      })
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

    // Express
    function(next) {
      require('./express')(app)
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
