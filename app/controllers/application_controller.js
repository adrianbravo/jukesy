var app = require('../../');

module.exports = {
  status : function(req, res, next) {
    res.send(process.memoryUsage(), 200);
  },

  home: function(req, res, next) {
    res.render('home', { scripts: app.assets });
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
