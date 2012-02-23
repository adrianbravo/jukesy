Model.User = Backbone.Model.extend({
  urlRoot: '/user',
  url: function() {
    var url = this.urlRoot
    if (!this.isNew()) {
      url += '/' + this.get('username')
    }
    return url
  }
})


View.User = Backbone.View.extend(_.extend({
  template: jade.compile($('#user-show-template').text()),
  editTemplate: jade.compile($('#user-edit-template').text()),
    
  events: {
    'click a.btn.edit'    : 'toggleEdit',
    'click a.btn-primary' : 'submit',
    'keypress input'      : 'keyDown'

  },
    
  initialize: function() {
    _.bindAll(this, 'toggleEdit', 'submit', 'keyDown', 'submitSuccess', 'submitError')
  },
    
  // TODO refactor
  render: function() {
    var locals = {
      user: this.model.toJSON(),
      currentUser: Session.userJSON()
    }
      
    if (locals.user && locals.currentUser && locals.user.id == locals.currentUser.id) {
      // TODO
      //locals.user = locals.currentUser
      // How do we re-render when a user logs in? (may require extra logic in login process)
    }
      
    if (this.edit) {
      this.$el.html(this.editTemplate(locals))
    } else {
      this.$el.html(this.template(locals))
    }
      
    return this
  },
    
  toggleEdit: function() {
    if (this.model.id == Session.user.id && !this.edit) {
      // rerender as edit
      this.edit = true
      MainView.render()
    } else {
      this.edit = false
      MainView.render()
    }
  },
    
  keyDown: function(event) {
    if (event.keyCode == 13) {
      this.submit()
      $(event.target).blur()
    }
  },
    
  submitSuccess: function(model, response) {
    this.toggleEdit()
    // TODO alert success
  },

  submit: function() {
    this.model.save({
      fullname: this.$el.find('#user-edit-fullname').val(),
      bio: this.$el.find('#user-edit-bio').val(),
      location: this.$el.find('#user-edit-location').val(),
      website: this.$el.find('#user-edit-website').val(),
      email: this.$el.find('#user-edit-email').val()
    }, {
      success: this.submitSuccess,
      error: this.submitError
    })
    return false
  }
    
}, Mixins.ViewFormErrors))

View.UserCreate = Backbone.View.extend(_.extend({
  template: jade.compile($('#user-new-template').text()),
  
  elAlert: '.modal-body',

  events: {
    'click a.btn-primary' : 'submit',
    'keypress input'      : 'keyDown',
    'click a.sign-in'     : 'newSession'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitSuccess', 'submitError', 'newSession')
    this.$el = $(this.el)
    this.render()
  },
    
  newSession: function() {
    new View.SessionCreate({ model: this.model })
  },
    
  render: function() {
    this.$el.html(this.template())
    ModalView.render(this.$el)
  },

  keyDown: function(event) {
    if (event.keyCode == 13) {
      this.submit()
      $(event.target).blur()
    }
  },
  
  submitSuccess: function(model, response) {
    Session.login()
    ModalView.hide()
  },
  
  submit: function() {
    var user = new Model.User({
          username: this.$el.find('#user-new-username').val(),
          password: this.$el.find('#user-new-password').val(),
          email: this.$el.find('#user-new-email').val()
        })

    user.save({}, {
      success: this.submitSuccess,
      error: this.submitError
    })
    return false
  }
}, Mixins.ViewFormErrors))
