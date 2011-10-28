var vows = require('vows'),
    should = require('should'),
    request = require('../helper/api').request,
    app = require('../helper/api').app;

vows.describe('ApplicationController').addBatch({

  /*
  '/css/reset.css': {
    topic: function() {
      request.get('/css/reset.css', this.callback);
    },

    'responds with 200': function(e, res) {
      res.statusCode.should.eql(200);
    }
  },
  */

  '/status': {
    topic: function() {
      request.get('/status', this.callback);
    },

    'responds with 200': function(e, res) {
      res.statusCode.should.eql(200);
    },
    'responds with content-type application/json': function(e, res) {
      res.headers['content-type'].should.match(/application\/json/);
    },
    'returns rss': function(e, res) {
      var json = JSON.parse(res.body);
      should.exist(json.rss);
    }
  },

  '/': {
    topic: function() {
      request.get('/', this.callback);
    },

    'responds with 200': function(e, res) {
      res.statusCode.should.eql(200);
    },
    'includes content': function(e, res) {
      res.body.should.match(/DOCTYPE/);
    }
  },

  '/fail': {
    topic: function() {
      request.get('/fail', this.callback);
    },

    'responds with 500': function(e, res) {
      res.statusCode.should.eql(500);
    },
    'includes 500 text': function(e, res) {
      res.body.should.match(/500!/);
    }
    // split out by xhr vs non-xhr
  },

  '/page-does-not-exist': {
    topic: function() {
      request.get('/page-does-not-exist', this.callback);
    },

    'responds with 404': function(e, res) {
      res.statusCode.should.eql(404);
    },
    'includes 404 text': function(e, res) {
      res.body.should.match(/404!/);
    }
    // split out by xhr vs non-xhr
  },

}).export(module);
