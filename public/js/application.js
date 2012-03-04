AppRouter = Backbone.Router.extend({
  routes: {
    ''                    : 'welcome',
    'about'               : 'about',
    'terms-of-service'    : 'termsOfService',
    'privacy-policy'      : 'privacyPolicy',
    'now-playing'         : 'nowPlaying',
    'user/:username'      : 'userView',
    'user/:username/edit' : 'userEdit'
  },

  initialize: function() {
    _.bindAll(this, 'error')
    
    Backbone.history.refresh = function() {
      var fragment = this.fragment
      this.navigate('', { trigger: false, replace: true })
      this.navigate(fragment, { trigger: true, replace: true })
    }
  },
    
  welcome: function() {
    MainView.render('welcome')
  },

  about: function() {
    MainView.render('about')
  },
  
  privacyPolicy: function() {
    MainView.render('privacyPolicy')
  },
  
  termsOfService: function() {
    MainView.render('termsOfService')
  },
  
  nowPlaying: function() {
    MainView.render('nowPlaying')
  },
  
  // TODO waitstate ???
  userView: function(username) {
    var user = new Model.User({ id: username, username: username })
    user.fetch({
      success: function(model, response) {
        MainView.render(new View.User({ model: model }))
      },
      error: this.error
    })
  },
  
  // TODO waitstate ???
  userEdit: function(username) {
    var user = new Model.User({ id: username, username: username })
    user.fetch({
      success: function(model, response) {
        MainView.render(new View.UserEdit({ model: model }))
      },
      error: this.error
    })
  },
  
  error: function(model, response) {
    MainView.render((response && response.status == 404) ? '404' : '500')
  }
})

View.Main = Backbone.View.extend({
  el: $('#main'),

  templates: {
    welcome        : jade.compile($('#welcome-template').text()),
    about          : jade.compile($('#about-template').text()),
    termsOfService : jade.compile($('#terms-of-service-template').text()),
    privacyPolicy  : jade.compile($('#privacy-policy-template').text()),
    nowPlaying     : jade.compile($('#now-playing-template').text()),
    401   : jade.compile($('#401-template').text()),
    404   : jade.compile($('#404-template').text()),
    500   : jade.compile($('#500-template').text())
  },

  initialize: function() {
    _.bindAll(this, 'render')
  },

  render: function(template) {    
    if (_.isString(template)) {
      this.$el.html(this.templates[template]({ currentUser: Session.userJSON() }))
    } else if (_.isObject(template)) {
      this.$el.html(template.render().$el)
      template.delegateEvents()
    }
  }
})

View.Sidebar = Backbone.View.extend({
  el: $('#sidebar'),
  
  template: jade.compile($('#sidebar-template').text()),
  
  render: function() {
    this.$el.html(this.template({ currentUser: Session.userJSON() }))
  }
})

View.Alert = Backbone.View.extend({
  className: 'alert',

  template: jade.compile($('#alert-template').text()),

  render: function() {
    this.$el.html(this.template({ message: this.options.message }))
    return this.$el
  }
})

$(function() {
  window.MainView = new View.Main
  window.Session = new Model.Session
  window.ModalView = new View.Modal
  window.SidebarView = new View.Sidebar
  window.Video = new Model.Video

  // hijack links
  // https://github.com/documentcloud/backbone/issues/456#issuecomment-2557835
  window.document.addEventListener('click', function(e) {
    e = e || window.event
    var $target = $(e.target || e.srcElement)
    if ($target.is('a') && !$target.hasClass('ll')) { // literal link
      var uri = $target.attr('href')
      if (uri) {
        e.preventDefault()
        Router.navigate(uri.substr(1), true)
      }
    }
  })
  /*
  window.addEventListener('popstate', function(e) {
    Router.navigate(location.pathname.substr(1), true)
  })
  // done hijacking links
  */

  $('body').addClass('in') // fade in

  window.Router = new AppRouter
})
