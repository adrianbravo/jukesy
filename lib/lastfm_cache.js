var app = require('../')
  , qs = require('qs')
  , request = require('request')
  , util = require('util')

module.exports = {
  queueSize: 25,
  queue: [],

  initQueue: function() {
    var self = this
    setInterval(function() {
      self.dequeue()
    }, 200)
  },

  dequeue: function() {
    if (this.queue.length) {
      var key = this.queue.pop()
      this.fetchFromAPI(key)
    }
  },

  enqueue: function(key) {
    if (this.queue.length < this.queueSize) {
      this.queue.push(key)
    }
  },

  get: function(key, options) {
    var self = this
    app.model('Lastfm_cache').findOne(key, function(err, value) {
      if (err || !value) {
        options.error(err)
        self.enqueue(key)
        return
      }

      options.success(value.json)
      if (value.expiry < new Date) {
        self.enqueue(key)
      }
    })
  },

  fetchFromAPI: function(params) {
    var extraParams = {
          api_key: '75c8c3065db32d805a292ec1af5631a3',
          autocorrect: 1,
          format: 'json'
        }

    request.get({
      url: 'http://ws.audioscrobbler.com/2.0/?' + qs.stringify(params) + '&' + qs.stringify(extraParams),
      headers: {
        'User-Agent': 'jukesy.com'
      }
    }, this.fetchComplete(params))
  },

  fetchComplete: function(params) {
    return function(err, res, body) {
      var cache = app.model('Lastfm_cache')
      if (err) {
        return
      }

      try {
        var index = app._.clone(params)
        params.json = JSON.parse(body)
        cache.create(params, function(err, value) {
          if (value) {
            console.log('Cached', index)
          }
        })
      } catch(e) {
        console.log('Cache error', e, "\n\n", 'on index', index)
      }
    }
  }

}

