/*
 * bcrypt.js
 *
 * Standardizes certain settings we use for hashing via bcrypt, such as
 * using a pepper set in config and choosing ten rounds for salt sync.
 *
 */

var bcrypt = require('bcrypt'),
    config = require('../config');

var BCrypt = function() {
};

BCrypt.prototype.hash = function(password, salt, callback) {
  bcrypt.encrypt(password + config.pepper, salt, callback);
};

BCrypt.prototype.salt = function(callback) {
  bcrypt.gen_salt(10, callback);
};

module.exports = new BCrypt();
