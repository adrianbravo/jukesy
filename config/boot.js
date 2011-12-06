var config = require('./'),
    logger = require('../lib/logger'),
    express = require('express'),
    i18n = require('i18n'),
    async = require('async');

Error.stackTraceLimit = Infinity;

// Runs as a synchronous series to capture errors in startup process.
async.series([

  // Load models and start connection to mongodb
  function(next) {
    exports.models = config.connectModels(config.db.host, config.db.database, next);
  },

  // Alias app.models.model() to app.model()
  function(next) {
    console.log('setting model');
    exports.model = function(model) {
      return exports.models.model(model);
    };
    next();
  },

  // Set up app.controller() for calling controllers by string name
  function(next) {
    exports.controller = function(controller) {
      return exports.controllers[controller];
    };
    next();
  },

  // CSS, JS and image assets
  function(next) {
    exports.assets = config.assets;
    next();
  },

], function(e) {
  if (e) {
    logger.error(('\n\nError in boot process:').red, e);
    return;
  }

    console.log('booting');

  // Load controllers
  exports.controllers = config.connectControllers();

  // Start webserver
  var server = express.createServer();

  server.configure('development', 'staging', 'production', function() {
    server.use(express.logger('dev'));
  });

  server.configure(function() {
    server.set('port', 8080)
          .set('host', 'localhost')
          .set('views', __dirname + '/../app/views')
          .set('view engine', 'jade');

    server.use(i18n.init)
          .use(express.bodyParser())
          .use(express.cookieParser())
          .use(express.session({ secret: 'jukesy' }))
          .use(express.errorHandler({ dumpExceptions: true, showStack: true }))
          .use(express.methodOverride())
          .use(express.static(__dirname + '/../public'))
          .use('/locales', express.static(__dirname + '/../locales'))
          .use(server.router);

    server.helpers({ __: i18n.__ });
  });

  // Load routes
  require('../routes')(server);

  server.listen(server.set('port'), function() {
    logger.info(
                ('Express').magenta.inverse,
                (' - ' + 'http://' + server.set('host') + ':' + server.set('port') + '/').magenta
    );

    exports.web = this;
  });

});
