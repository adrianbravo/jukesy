module.exports = function(app) {

  return {
  	get: function(req, res, next) {
      var params = {}
      app._.each([ 'method', 'page', 'limit', 'artist', 'album', 'track' ], function(param) {
        if (req.param(param)) {
          params[param] = req.param(param).toLowerCase()
        }
      })

      if (!params.method || !params.page || !params.limit) {
        return next(new app.Error(403))
      }

      app.lastfmCache.get(params, {
        success: function(json) {
          res.json(json)
        },
        error: function(err) {
          next(new app.Error(404))
        }
      })
  	}
  }
}
