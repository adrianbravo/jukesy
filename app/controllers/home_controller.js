module.exports = function(app) {

  return {

    welcome: function(req, res, next) {
      res.render('home/welcome', {
        meta: app.meta()
      })
    },

    about: function(req, res, next) {
      res.render('home/about', {
        meta: app.meta({
                title: 'about jukesy',
                url: app.set('base_url') + '/about'
              })
      })
    },
    
    termsOfService: function(req, res, next) {
      return next(new app.Error(501))
      res.render('home/terms_of_service', {
        meta: app.meta({
                title: 'jukesy - terms of service',
                url: app.set('base_url') + '/terms-of-service'
                // description
              })
      })
    },
    
    privacyPolicy: function(req, res, next) {
      return next(new app.Error(501))
      res.render('home/privacy_policy', {
        meta: app.meta({
                title: 'jukesy - privacy policy',
                url: app.set('base_url') + '/privacy-policy'
                // description
              })
      })
    }
  }

}
