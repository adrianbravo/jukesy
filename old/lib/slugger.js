/*
 * slugger.js
 *
 * Alters a string into a slug.
 *
 * Usage:
 *   var slugger = require('lib/slugger');
 *   slugger('coolio dawg', 'Playlist');
 *   >> "coolio-dawg-3"
 *
 */

var diacritics = require('./diacritics');

module.exports = function(title, modelName) {
  title = diacritics.remove(title);
  return title.replace(/[^\w- ]/g, '')        // non-word (0-9a-z_) and - are muted
              .replace(/-/g, ' ')             // - turned to whitespace
              .replace(/^[\s]+|[\s]+$/g, '')  // trim whitespace
              .replace(/[\s]+/g, ' ')         // condense whitespace
              .replace(/[\s]/g, '-')          // replacing spaces with dashes, finally
              .toLowerCase();
};
