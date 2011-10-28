var config = require('./'),
    logger = require('../lib/logger');

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

  // Load routes
  var web = require('../routes').connect(null);

  // TODO is there a sync way to do this?
  web.listen(web.set('port'), function() {
    logger.info(
                ('Express').magenta.inverse,
                (' - ' + 'http://' + web.set('host') + ':' + web.set('port') + '/').magenta
    );

    exports.web = this;
  });
};

Error.stackTraceLimit = Infinity;
