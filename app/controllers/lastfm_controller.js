// To create a capped collection 2 gigabytes (2147483648 bytes) in size:
//
// db.createCollection("lastfm-cache", { capped: true, size: 2147483648 });
//

module.exports = function(app) {

  return {
  	get: function(req, res, next) {
      var params = {}
      app._.each([ 'method', 'page', 'limit', 'artist', 'album', 'track' ], function(param) {
        if (req.param(param)) {
          params[param] = req.param(param)
        }
      })

      app.lastfm_cache.get(params, {
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
