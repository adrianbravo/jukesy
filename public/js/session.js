Model.Session = Backbone.Model.extend({
  urlRoot: '/session',

  initialize: function() {
    _.bindAll(this, 'logout', 'login', 'refresh', 'userJSON')

    this.viewButton = new View.SessionButton({ model: this })
    this.initialAttempt = true
    $.ajax({
      url: '/session/refresh',
      dataType: 'json',
      success: this.login,
      error: this.logout
    })
  },
    
  userJSON: function() {
    return this.user && this.user.toJSON()
  },

  refresh: function() {
    if (this.initialAttempt) {
      this.startHistory()
    } else {
      Backbone.history.refresh()
    }
    SidebarView.render()
    this.viewButton.render()
  },
  
  startHistory: function() {
    this.initialAttempt = false
    // TODO
    // Move some of this logic elsewhere
    Backbone.history.start({ pushState: true })
    Backbone.history.refresh = function() {
      var fragment = this.fragment
      this.navigate('', { trigger: false, replace: true })
      this.navigate(fragment, { trigger: true, replace: true })
    }
  },

  logout: function() {
    delete this.user
    _.defer(this.refresh)
  },

  login: function () {
    cookieParser()
    var user = Cookies.user
    if (user) {
      user.id = user.username
      user = new Model.User(user)
    }
    this.user = user
    _.defer(this.refresh)
  }
})

View.SessionButton = Backbone.View.extend({
  el: $('#session-button'),

  events: {
    'click a.sign-in': 'newSession',
    'click a.sign-up': 'newUser'
  },
    
  template: jade.compile($('#session-button-template').text()),

  // TODO DRY up use of newSession, newUser
  newSession: function() {
    new View.SessionCreate({ model: Session })
    return false
  },
  
  newUser: function() {
    new View.UserCreate()
    return false
  },

  render: function() {
    this.$el.html(this.template({ currentUser: Session.userJSON() }))
    if (this.model.user) {
      this.$el.addClass('dropdown')
    } else {
      this.$el.removeClass('dropdown')
    }
  }
})

View.SessionCreate = Backbone.View.extend(_.extend({
  template: jade.compile($('#session-new-template').text()),
  
  elAlert: '.modal-body',
  elFocus: '#session-new-password',

  events: {
    'click a.btn-primary' : 'submit',
    'keypress input'      : 'keyDown',
    'click a.sign-up'     : 'newUser'
  },

  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitSuccess', 'submitError')
    this.$el = $(this.el)
    this.render()
  },

  render: function() {
    this.$el.html(this.template())
    ModalView.render(this.$el)
  },
  
  newUser: function() {
    new View.UserCreate()
    return false
  },

  keyDown: function(event) {
    if (event.keyCode == 13) {
      this.submit()
      $(event.target).blur()
    }
  },

  submitSuccess: function(user) {
    ModalView.hide()
    this.model.login()
  }
        
}, Mixins.ViewFormErrors))