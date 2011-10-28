/*
 * api.js
 *
 * This helper starts the webserver and creates a wrapper
 * for the *request* module.
 *
 */

var request = require('request'),
    utils = require('./utils'),
    app = require('../coverage');

function Request () {
  return this;
};

Request.prototype.prependHost = function() {
  if (typeof this.options === 'object') {
    this.options.uri = this.options.url ? this.options.url : this.options.uri;
    delete this.options.url;
  } else {
    this.options = { uri: this.options };
  }

  if (!this.options.uri.match(/^https?:\/\//))
    this.options.uri = 'http://' + app.web.set('host') + ':' + app.web.set('port') + this.options.uri;
};

Request.prototype.request = function(options, callback) {
  this.options = options;
  this.prependHost();
  request(this.options, callback);
};

['get', 'post', 'put', 'head', 'del'].forEach(function(method) {
  Request.prototype[method] = function(options, callback) {
    this.options = options;
    this.prependHost();
    request[method](this.options, callback);
  };
});

/*
Request.prototype.defaults = function(options) {
  this.options = options;
  this.prependHost();
  request.defaults(this.options);
};
*/

exports.request = new Request();
exports.utils = utils;
exports.app = app;

