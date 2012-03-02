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


View.User = Backbone.View.extend({
  template: jade.compile($('#user-show-template').text()),
    
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
    this.$el.html(this.template(locals))
    return this
  }
    
})

View.UserEdit = Backbone.View.extend(_.extend({
  template: jade.compile($('#user-edit-template').text()),
    
  events: {
    'click a.btn-primary' : 'submit',
    'keypress input'      : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'submit', 'keyDown', 'submitSuccess', 'submitError')
  },
    
  // TODO refactor
  render: function() {
    var locals = {
      user: this.model.toJSON(),
      currentUser: Session.userJSON()
    }

    if (locals.user && locals.currentUser && locals.user.id == locals.currentUser.id) {
      this.$el.html(this.template(locals))
    } else {
      _.defer(function() {
        // TODO render 401???
        //MainView.render('401')
      })
    }

    return this
  },
    
  keyDown: function(event) {
    if (event.keyCode == 13) {
      this.submit()
      $(event.target).blur()
    }
  },
    
  submitSuccess: function(model, response) {
    alert('success!')
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
    this.model = new Model.User
    this.render()
  },
    
  newSession: function() {
    new View.SessionCreate({ model: Session })
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
  }
  
}, Mixins.ViewFormErrors))
