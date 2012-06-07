var app = require('../')
  , qs = require('qs')
  , request = require('request')
  , util = require('util')

// TODO objectify

module.exports = {
  queue: [],

  startQueue: function() {
    var self = this
    setInterval(function() {
      self.dequeue()
    }, 200)
  },

  dequeue: function() {
    if (this.queue.length) {
      var key = this.queue.pop()
      this.fetch(key)
      // remove key from queue elsewhere?
    }
  },

  enqueue: function(key) {
    this.queue.push(key)
  },

  get: function(key, methods) {
    var self = this
    app.model('Lastfm_cache').findOne(key, function(err, value) {
      if (err || !value) {
        methods.error()
        self.enqueue(key)
      } else {
        methods.success(value.json)
      }
    })
  },

  // TODO prevent caching of blank results?
  fetch: function(key) {
    var cache = app.model('Lastfm_cache')
      , extraParams = {
          api_key: '75c8c3065db32d805a292ec1af5631a3',
          autocorrect: 1,
          format: 'json'
        }

    request.get('http://ws.audioscrobbler.com/2.0/?' +
                qs.stringify(key) + '&' +
                qs.stringify(extraParams), function(err, res, body) {
      if (err) {
        console.error('Failed to cache', key)
        return
      }

      try {
        var index = app._.clone(key)
        key.json = JSON.parse(body)
        cache.create(key, function(err, value) {
          if (value) {
            console.log('Cached', index)
          }
        })
      } catch(e) {}
    })
  }

}

