var vows = require('vows'),
    should = require('should'),
    app = require('../helper/api').app,
    utils = require('../helper/api').utils;
    slugger = require('../../lib/slugger');

vows.describe('Slugger').addBatch({

  // it should append -N based on length of .slug found in model modelStr
    // (coolio-dawg, then coolio-dawg-2, then coolio-dawg-3)
    // test by creating several playlists 
  'running slugger on a string': {
    topic: slugger(' ^%$^$%&&&   H\u011B!!l_lo % %% %  %%!#@!%@%& ^#||}{ % % %  w0rld   - - -   '),

    'cuts out all the bullshit (trims, replaces spaces with dashes, purges garbage)': function(slug) {
      slug.should.equal('hel_lo-w0rld');
    },
  },
}).export(module);
