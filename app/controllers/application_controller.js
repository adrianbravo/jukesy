var app = require('../../');

module.exports = {
  status : function(req, res, next) {
    res.send(process.memoryUsage(), 200);
  },

  home: function(req, res, next) {
    res.render('home', {
      scripts: app.assets.js,
      stylesheets: app.assets.less
    });
  },

  // This is not an active endpoint yet.
  // Add tests.
  // Primary purpose is to mirror /#/search on front-end.
  // Should have meta tags for SEO and sharing to social networks.
  search: function(req, res, next) {
    console.log(req.param('type'), req.param('method'), req.param('query'));
    res.render('home', {
      scripts: app.assets.js,
      stylesheets: app.assets.less
    });
    // server.get('/lastfm/:type/:method/:query', ApplicationController.search);
  },

  notFound: function(req, res, next) {
    res.render('404', { layout: false, status: 404 });
  },

  internalServerError: function(req, res, next) {
    res.render('500', { layout: false, status: 500 });
  },

  fail: function(req, res, next) {
    var fail = {};
    fail.to.run;
  },

};
