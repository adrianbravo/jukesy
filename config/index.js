//
// Set the current environment
//
if (['development', 'test', 'staging', 'production'].indexOf(process.env.NODE_ENV) == -1)
  process.env.NODE_ENV = 'development';
exports.env = process.env.NODE_ENV;

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
// Models builder
//
exports.connectModels = function(host, db, fn) {
  var mongodbString = 'mongodb://' + host + '/' + db
      ext = '.js';

  logger.info('Models'.yellow.inverse);
  fs.readdirSync('app/models').forEach(function(file) {
    if (!file.match(ext + '$'))
      return;

    require('../app/models/' + file);
    logger.info((' - ' + file).yellow);
  });


  logger.info('MongoDB'.green.inverse, (' - ' + mongodbString).green);

  return mongoose.connect(mongodbString, fn);
};


//
// Controllers builder
//

exports.connectControllers = function() {
  var ext = '_controller.js',
      controllers = {};

  logger.info('Controllers'.blue.inverse);
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
