var config = require('./'),
    logger = require('../lib/logger'),
    MongoStore = require('connect-mongo'),
    express = require('express'),
    i18n = require('i18n'),
    less = require('less'),
    exec = require('child_process').exec,
    fs = require('fs'),
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
    if (config.env == 'production') {
      var js = '',
          css = '',
          lesscss = '';

      // Generate all.js
      config.assets.js.forEach(function(partialPath) {
        js += ';' + fs.readFileSync('public/' + partialPath);
      });
      fs.writeFileSync('public/all.js', js);
      config.assets.js = [ 'all.js' ];

      // Generate all.css and less.css
      config.assets.css.forEach(function(partialPath) {
        css += '' + fs.readFileSync('public/' + partialPath);
      });
      exec('lessc public/' + config.assets.less[0] + ' public/less.css', function() {});
      css += fs.readFileSync('public/less.css');
      fs.writeFileSync('public/all.css', css);
      config.assets.css = [ 'all.css' ];
      config.assets.less = [];
    }

    exports.assets = config.assets;
    next();
  },

], function(e) {
  if (e) {
    logger.error(('\n\nError in boot process:').red, e);
    return;
  }

  // Load controllers
  exports.controllers = config.connectControllers();

  // Start webserver
  var server = express.createServer();

  server.configure('development', 'staging', 'production', function() {
    server.use(express.logger('dev'));
  });

  server.configure(function() {
    var port = config.env == 'production' ? 80 : 8080
    server.set('port', port)
          .set('host', 'localhost')
          .set('views', __dirname + '/../app/views')
          .set('view engine', 'jade');

    server.use(i18n.init)
          .use(express.bodyParser())
          .use(express.cookieParser())
          .use(express.session({
            secret: 'jukesy',
            maxAge: new Date(Date.now() + 3600000),
            store: new MongoStore({ db: config.db.database })
          }))
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
