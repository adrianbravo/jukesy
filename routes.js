var express = require('express'),
    i18n = require('i18n'),
    app = require('./'),
    logger = require('./lib/logger'),
    error = require('./lib/error'),
    User = app.model('User'),
    ApplicationController = app.controller('Application'),
    UserController = app.controller('User'),
    SessionController = app.controller('Session');

exports.connect = function() {
  var server = express.createServer();

  server.configure(function() {
    server.set('port', 8080)
          .set('host', 'localhost')
          .set('views', __dirname + '/app/views')
          .set('view engine', 'jade');
      
    server.use(express.logger(''))
          .use(i18n.init)
          .use(express.bodyParser())
          .use(express.cookieParser())
          .use(express.session({ secret: 'jukesy' }))
          .use(express.errorHandler({ dumpExceptions: true, showStack: true }))
          .use(express.methodOverride())
          .use(express.static(__dirname + '/public'))
          .use(server.router);

    server.helpers({ __: i18n.__ });
  });

  server.configure('test', function() {
  });
  
  server.get('/status', ApplicationController.status);
  server.get('/fail', ApplicationController.fail);
  server.get('/', ApplicationController.home);

  server.get('/users', UserController.index);
  server.get('/users/:username', UserController.show);
  server.post('/users/create', UserController.create);
  server.post('/users/:username', UserController.update);
  //server.delete('/users/:username', UserController.delete);

  server.post('/login', SessionController.create);

  server.error(function(err, req, res) {
    if (err.name === 'ValidationError' || err.name === 'ValidatorError')
      err = new error.ValidationError(err);

    if (!err.code || err.code == 500) {
      res.render('500', { layout: false, status: 500 });
    } else if (err.code == 404) {
      res.render('404', { layout: false, status: 404 });
    } else {
      res.send({
        message : err.message,
        errors  : err.errors,
        code    : err.code,
        type    : err.type
      }, err.code);
    }

    if (typeof err.stack != 'undefined' && err.stack)
      logger.error(err.stack);
  });

  server.get('/404', ApplicationController.notFound);
  server.get('/500', ApplicationController.internalServerError);
  server.all('*', ApplicationController.notFound);
  
  return server;
};
