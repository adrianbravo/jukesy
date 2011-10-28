/*
 * logger.js
 *
 * Standardizes certain settings we use for logging.
 *
 * Usage:
 *   var logger = require('lib/logger');
 *   logger.debug('hello world');
 *
 */

var config = require('../config'),
    colors = require('colors'),
    levels = ['debug', 'info', 'warn', 'error', 'critical'];

var Logger = function(options) {
  this.settings({ level: 'debug' });
  return this;
};

Logger.prototype.settings = function(options) {
  this.options = options || {};

  // TODO set up a merge function
  if (!this.options.level)
    this.options.level = 'debug';

  this.level = levels.indexOf(this.options.level);
};

// console aliasing
console.debug = console.info;
console.critical = console.error;

// level methods
levels.forEach(function(method) {
  Logger.prototype[method] = function() {
    if (levels.indexOf(method) >= this.level) {
      [].slice.call(arguments).forEach(function(arg) {
        console[method](arg);
      });
    }
  };
});

module.exports = new Logger();
