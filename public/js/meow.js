View.Meow = Backbone.View.extend({
  el: $('#meow'),
  
  render: function(options) {
    var self = this
      , alert
      
    options.className = 'fade in alert alert-' + options.type
    options.$prepend = this.$el
    
    alert = new View.Alert(options)

    _.delay(function() {
      alert.$el.removeClass('in')
      _.delay(function() {
        alert.$el.remove()
      }, 500)
    }, 3700)
  }
  
})


;