Model.User = Backbone.Model.extend({
  urlRoot: '/user',
  
  url: function() {
    var url = this.urlRoot
    if (!this.isNew()) {
      url += '/' + this.get('username')
    }
    return url
  },
  
  isCurrentUser: function() {
    return Session.user && Session.user.id == this.id
  },
  
  initialize: function() {
    this.view = new View.User({ model: this })
    this.viewEdit = new View.UserEdit({ model: this })
    this.viewReset = new View.UserReset({ model: this })
  }
})


View.User = Backbone.View.extend({
  template: jade.compile($('#user-show-template').text()),
  
  render: function() {
    this.$el.html(this.template({
      user: this.model.toJSON(),
      currentUser: Session.userJSON()
    }))
    return this
  }
})

View.UserEdit = View.Form.extend({
  template: jade.compile($('#user-edit-template').text()),
  
  elAlert: 'form',
  
  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'      : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitSuccess', 'submitError')
  },
    
  render: function() {
    if (this.model.isCurrentUser()) {
      this.$el.html(this.template({
        user: this.model.toJSON(),
        currentUser: Session.userJSON()
      }))
    } else {
      _.defer(function() {
        MainView.render('404')
      })
    }

    return this
  },
    
  submitSuccess: function(model, response) {
    this.removeErrors()
    var $alert = new View.Alert({
          className: 'alert-success alert fade',
          message: 'Your changes have been saved.'
        }).render()
      
    this.$el.find('form').prepend($alert)
    _.defer(function() {
      $alert.addClass('in')
    })
  }
})

View.UserReset = View.Form.extend({
  className: 'reset modal',
  template: jade.compile($('#user-reset-template').text()),
  
  elAlert: 'form',
  
  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'      : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown')
  },
  
  render: function() {
    this.$el.modal({
      backdrop: 'static',
      keyboard: false
    })
    this.$el.html(this.template())
    this.delegateEvents()
    return this
  },
  
  submit: function() {
  }
})

View.UserForgot = View.Form.extend({
  template: jade.compile($('#user-forgot-template').text()),
  
  elAlert: 'form',
  
  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'      : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown')
  },
  
  render: function() {
    this.$el.html(this.template())
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
    
  submit: function() {
  }
})

View.UserCreate = View.Form.extend({
  template: jade.compile($('#user-new-template').text()),
  
  elAlert: '.modal-body',

  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'      : 'keyDown',
    'click a.sign-in'     : 'newSession'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitSuccess', 'submitError', 'newSession')
    this.model = new Model.User
  },
    
  newSession: function() {
    window.loginModal.render()
    return false
  },
    
  render: function() {
    this.$el.html(this.template())
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
  
  submitSuccess: function(user, response) {
    Session.login(response)
    ModalView.hide()
  }
})


;