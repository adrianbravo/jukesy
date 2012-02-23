module.exports = function(app) {

  return {

    welcome: function(req, res, next) {
      res.render('home/welcome', {})
    },

    about: function(req, res, next) {
      res.render('home/about', {})
    }

  }

}
