View.Alert = Backbone.View.extend({
  className: 'alert fade',

  template: jade.compile($('#alert-template').text()),

  render: function() {
    this.$el.html(this.template({ message: this.options.message }))
    return this.$el
  },
  
  show: function() {
    var self = this
    _.defer(function() {
      self.$el.addClass('in')
    })
  }
})
