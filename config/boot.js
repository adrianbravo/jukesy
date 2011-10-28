var config = require('./'),
    logger = require('../lib/logger'),
    express = require('express'),
    i18n = require('i18n');

// Load models and start connection to mongodb
exports.models = config.connectModels(config.db.host, config.db.database);

// Alias app.models.model() to app.model()
exports.model = function(model) {
  return exports.models.model(model);
};

// Set up app.controller() for calling controllers by string name
exports.controller = function(controller) {
  return exports.controllers[controller];
};

// CSS, JS and image assets
exports.assets = config.assets;

// Start the web app
exports.boot = function() {

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

  // TODO is there a sync way to do this?
  server.listen(server.set('port'), function() {
    logger.info(
                ('Express').magenta.inverse,
                (' - ' + 'http://' + server.set('host') + ':' + server.set('port') + '/').magenta
    );

    exports.web = this;
  });
};

Error.stackTraceLimit = Infinity;
