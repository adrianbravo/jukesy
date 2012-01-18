$(function() {
  Model.Contextmenu = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this, 'hide')
      this.view = new View.Contextmenu({ model: this })
      // turn off scrolling for quickbar, main-wrapper
      $('#quickbar').data('jsp').destroy()
      $('#main-wrapper').css('overflow-y', 'hidden')
      windowResized()
    },
    
    hide: function() {
      $(document).unbind('click.contextclose')
      this.view.remove()
      this.destroy()
      window.Contextmenu = null
      // turn on scrolling for quickbar, main-wrapper
      QuickbarView.render()
      $('#main-wrapper').css('overflow-y', 'scroll')
      windowResized()
      return false
    }
  })
  
  View.Contextmenu = Backbone.View.extend(_.extend({
    className: 'contextmenu',
    
    template: Handlebars.compile($('#contextmenu-template').html()),
    
    events: {
      'contextmenu' : 'cancelRightClick'
    },
    
    initialize: function() {
      this.render()
    },
    
    render: function() {
      $el = $(this.el)
      $el.hide().html(this.template(this.model.toJSON()))
      $('#app').append(this.el)
      
      var e = this.model.get('event')
      this.reposition($el, e.clientX, e.clientY)
      $el.show()
      
      return this
    },
    
    cancelRightClick: _.f
  }, Mixins.Reposition))
})