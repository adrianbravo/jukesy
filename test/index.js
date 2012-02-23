// Run this once.
if (typeof app == 'undefined') {
  process.env.NODE_ENV = 'test'

  app     = require('../')
  expect  = require('chai').expect
  request = require('superagent')

  // Wrapping superagent's request.get, etc. to prepend
  // urls with the host and port for HTTP requests.
  app._.each(['del', 'get', 'post', 'put'], function(method) {
    request['old' + method] = request[method]

    request[method] = function() {
      var args = app._.toArray(arguments).slice(0)
      args[0] = 'http://' + app.set('host') + ':' + app.set('port') + args[0]
      return request['old' + method].apply(request, args)
    }
  })
}
