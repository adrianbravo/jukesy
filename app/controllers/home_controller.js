module.exports = function(app) {

  return {

    welcome: function(req, res, next) {
      res.render('home/welcome', {})
    },

    about: function(req, res, next) {
      res.render('home/about', {})
    },
    
    termsOfService: function(req, res, next) {
      res.render('home/terms_of_service', {})
    },
    
    privacyPolicy: function(req, res, next) {
      res.render('home/privacy_policy', {})
    },
    
    nowPlaying: function(req, res, next) {
      res.render('home/now_playing', {})
    }

  }

}