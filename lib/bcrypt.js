/*
 * bcrypt.js
 *
 * Standardizes certain settings we use for hashing via bcrypt, such as
 * using a pepper set in config and choosing ten rounds for salt sync.
 *
 */

var bcrypt = require('bcrypt')
  , pepper = require('../').pepper

var BCrypt = function() {
}

BCrypt.prototype.pepperedHash = function(password, salt, callback) {
  bcrypt.hash(password + pepper, salt, callback)
}

BCrypt.prototype.salt = function(callback) {
  bcrypt.genSalt(10, callback)
}

module.exports = new BCrypt()
