$(function() {
  Model.Contextmenu = Backbone.Model.extend({
    initialize: function(e) {      
      _.bindAll(this, 'hide')
      
      this.event = e
      this.view = new View.Contextmenu({ model: this })
    },
    
    hide: function() {
      $(document).unbind('click.contextclose')
      this.view.remove()
      this.destroy()
      window.Contextmenu = null
      return false
    }
  })
  
  View.Contextmenu = Backbone.View.extend(_.extend({
    className: 'contextmenu',
    
    template: _.template($('#contextmenu-template').html()),
    
    initialize: function() {
      this.render()
    },
    
    render: function() {
      $el = $(this.el)
      $el.hide().html(this.template(this.model.toJSON()))
      $('#app').append(this.el)
      
      this.reposition($el, this.model.event.clientX, this.model.event.clientY)
      $el.show()
      
      return this
    }
  }, Mixins.Reposition))
})