View.Meow = Backbone.View.extend({
  el: $('#meow'),
    
  render: function(options) {
    var self = this
    if (_.isString(options)) {
      options = {
        message: options,
        className: 'alert alert-info'
      }
    }
    this.$el.html(new View.Alert(options).render()).addClass('on')
    
    if (this.fade) {
      clearTimeout(this.fade)
    }
    this.fade = setTimeout(function() {
      self.$el.removeClass('on').remove()
    }, 2400)
  }
})