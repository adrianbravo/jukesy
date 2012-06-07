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
      this.initialAttempt = false
      Backbone.history.start({ pushState: true })
    } else {
      Backbone.history.refresh()
    }
    SidebarView.render()
    this.viewButton.render()
  },

  logout: function() {
    delete this.user
    _.defer(this.refresh)
  },

  login: function (model) {
    var user = model
    if (user) {
      user.id = user.username
      user = new Model.User(user)
    }
    if (model.playlists) {
      Playlists.add(model.playlists)
    }
    Playlists.user = user.get('username')
    this.user = user
    _.defer(this.refresh)
    this.trigger('login')
  }
})

View.SessionButton = Backbone.View.extend({
  el: $('#session-button'),

  events: {
    'click a.sign-in': 'newSession',
    'click a.sign-up': 'newUser'
  },
    
  template: jade.compile($('#session-button-template').text()),

  newSession: function() {
    loginModal.render()
    return false
  },
  
  newUser: function() {
    signupModal.render()
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

View.SessionCreate = View.Form.extend({
  template: jade.compile($('#session-new-template').text()),
  
  elAlert: '.modal-body',
  elFocus: '#session-new-password',

  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'      : 'keyDown',
    'click a.sign-up'     : 'newUser',
    'click a.forgot'      : 'forgot'
  },

  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitSuccess', 'submitError')
  },

  render: function() {
    this.$el.html(this.template())
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
  
  newUser: function() {
    signupModal.render()
    return false
  },
  
  forgot: function() {
    forgotModal.render()
    return false
  },

  submitSuccess: function(user, response) {
    Session.login(response)
    ModalView.hide()
  }       
})
