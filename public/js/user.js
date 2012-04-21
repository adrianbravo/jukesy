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
    new View.Alert({
      className: 'alert-success alert fade',
      message: 'Your changes have been saved.',
      $prepend: this.$el.find('form')
    })
  }
})

View.UserReset = View.Form.extend({
  className: 'reset modal',
  template: jade.compile($('#user-reset-template').text()),
  
  elAlert: 'form',
  elFocus: '#reset-password',
  
  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'           : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'checkError', 'submitError', 'submitSuccess')
  },
  
  render: function() {
    var self = this
    this.$el.modal({
      backdrop: 'static',
      keyboard: false
    })
    this.$el.html(this.template())
    this.delegateEvents()
    _.delay(function() {
      self.focusInput()
    }, 500)
    return this
  },
  
  validate: function() {
    if (this.$el.find('input[name="password"]').val() != this.$el.find('input[name="password-confirm"]').val()) {
      this.removeErrors()
      new View.Alert({
        className: 'alert-danger alert fade',
        message: parseError(null, 'reset_password_unconfirmed'),
        $prepend: this.$el.find('form')
      })
      this.focusInput()
      return false
    }
    return true
  },
  
  submit: function() {
    var self = this
    if (!this.validate()) {
      return false
    }
    $.ajax({
      type: 'POST',
      url: '/user/' + this.model.get('username') + '/reset',
      data: { token: this.model.get('token'), password: this.$el.find('input[name="password"]').val() },
      success: this.submitSuccess,
      error: function(error, model) { self.submitError(model, error) }
    })
    return false
  },
  
  submitSuccess: function(model, response) {
    this.removeErrors()
    this.$el.modal('hide')
    new View.Alert({
      className: 'alert-success alert fade',
      message: 'Your password has been reset!',
      $prepend: $('#container .span10')
    })
  },
  
  check: function() {
    $.ajax({
      type: 'GET',
      url: '/user/' + this.model.get('username') + '/reset?token=' + this.model.get('token'),
      error: this.checkError
    })
  },
  
  checkError: function(model, error) {
    var errorJSON = {}
      , $alert
      
    try {
      errorJSON = JSON.parse(model.responseText)
    } catch(e) {}

    this.$el.modal('hide')
    new View.Alert({
      className: 'alert-danger alert fade',
      message: parseError(null, (errorJSON.errors && errorJSON.errors.$) || 'no_connection'),
      $prepend: $('#container .span10')
    })
  }
})

View.UserForgot = View.Form.extend({
  template: jade.compile($('#user-forgot-template').text()),
  
  elAlert: 'form',
  elFocus: '#forgot-login',
  
  events: {
    'click button.btn-primary' : 'submit',
    'keypress input'           : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitError', 'submitSuccess')
  },
  
  render: function() {
    this.$el.html(this.template())
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
    
  submit: function() {
    var self = this
    $.ajax({
      type: 'POST',
      url: '/user/forgot',
      data: { login: this.$el.find('input[name="login"]').val() },
      success: this.submitSuccess,
      error: function(error, model) { self.submitError(model, error) }
    })
    return false
  },
  
  submitSuccess: function(model, response) {
    this.removeErrors()
    ModalView.hide()
    new View.Alert({
      className: 'alert-success alert fade',
      message: 'You should receive an email with a link to log in and reset your password shortly.',
      $prepend: $('#container .span10')
    })
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