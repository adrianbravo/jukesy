View.Meow = Backbone.View.extend({
  el: $('#meow'),
    
  render: function(message) {
    var self = this
    this.$el.html(new View.Alert({ message: message, className: 'alert alert-info' }).render()).addClass('on')
    
    if (this.fade) {
      clearTimeout(this.fade)
    }
    this.fade = setTimeout(function() {
      self.$el.removeClass('on')
    }, 2400)
  }
})