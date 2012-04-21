View.Alert = Backbone.View.extend({
  className: 'alert fade',

  template: jade.compile($('#alert-template').text()),

  initialize: function() {
    this.render()
  },
  
  render: function() {
    this.$el.html(this.template({ message: this.options.message }))
    this.options.$prepend.children('.alert').remove()
    this.options.$prepend.prepend(this.$el)
    
    if (!this.$el.hasClass('in')) {
      this.show()
    }
    return this
  },
  
  show: function() {
    var self = this
    _.defer(function() {
      self.$el.addClass('in')
    })
  }
  
})


;