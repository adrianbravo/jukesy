module.exports = function(app) {

  return {

    status : function(req, res, next) {
      res.send(process.memoryUsage(), 200);
    },

    error: function(err, req, res) {
      var stack = err && err.stack
      
      if (!err.code) {
        err = new app.Error(500)
      }
      
      if (req.xhr) {
        res.json(err, err.code)
      } else {
        switch(err.code) {
          case 500:
            res.render('500', { status: 500 })
            break
          case 404:
            res.render('404', { status: 404 })
            break
          case 401:
            res.render('401', { status: 401 })
            break
          default:
            res.json(err, err.code)
        }
      }
      
      stack && console.error(stack)
    },

    notFound: function(req, res, next) {
      res.render('404', { status: 404 })
    }

  }

}
