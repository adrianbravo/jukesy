View.Meow = Backbone.View.extend({
  el: $('#meow'),
    
  render: function(options) {
    var self = this
      , $alert
      
    options.className = 'fade in alert alert-' + options.type
    
    $alert = new View.Alert(options)
    this.$el.prepend($alert.render())
    
    _.delay(function() {
      $alert.$el.removeClass('in')
      _.delay(function() {
        $alert.$el.remove()
      }, 500)
    }, 2700)
    
  }
})