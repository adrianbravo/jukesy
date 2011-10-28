//
// Set the current environment
//
exports.env = process.env.NODE_ENV;
if (['development', 'test', 'staging', 'production'].indexOf(exports.env) == -1)
  exports.env = 'development';

//
// Libraries we need in config steps
//
var mongoose = require('mongoose'),
    logger = require('../lib/logger'),
    async = require('async'),
    fs = require('fs');
logger.info('Environment'.red.inverse, (' - ' + exports.env).red);

//
// Pepper used by bcrypt for hashing password
//
exports.pepper = '12febe85f1b1c312b9a44c1744760ddfdfd9660ac94b619ff41e3d344e25ede2f50633237b2c5f68e8bb72181c211920fa49ff4f99547912311a2e4b1ce7814a'

//
// Database environment settings
//
exports.db = require('./database')[exports.env];

//
// Logger environment settings
//
logger.settings(require('./logger')[exports.env]);

//
// CSS, JS, and image assets
exports.assets = require('./assets')[exports.env];

//
// Mongoose booter
//
exports.connectModels = function(host, db) {
  logger.info('Models'.yellow.inverse);
  var ext = '.js';

  fs.readdirSync('app/models').forEach(function(file) {
    if (!file.match(ext + '$'))
      return;

    require('../app/models/' + file);
    logger.info((' - ' + file).yellow);
  });

  var mongodbString = 'mongodb://' + host + '/' + db;
  logger.info(
    'MongoDB'.green.inverse,
    (' - ' + mongodbString).green
  );
  return mongoose.connect(mongodbString);
};


//
// Controllers builder
//

exports.connectControllers = function() {
  logger.info('Controllers'.blue.inverse);

  var ext = '_controller.js',
      controllers = {};

  fs.readdirSync('app/controllers').forEach(function(file) {
    if (!file.match(ext + '$'))
      return;

    var controller = require('../app/controllers/' + file),
        controllerName = '';

    file.replace(new RegExp(ext + '$'), '').split('_').forEach(function(fileToken) {
      controllerName += fileToken.charAt(0).toUpperCase() + fileToken.slice(1).toLowerCase(); // Capitalize
    });
    controllers[controllerName] = controller;

    logger.info((' - ' + controllerName + ' (' + file + ') ').blue);
  });

  return controllers;
};
