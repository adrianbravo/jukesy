View.Modal = Backbone.View.extend({
  el: '#modal',

  initialize: function() {
    _.bindAll(this, 'hide', 'focusFirstInput')
    this.$el = $(this.el)
  },

  render: function(el) {
    this.$el.html(el).modal('show')
    _.delay(this.focusFirstInput, 500)
  },
    
  focusFirstInput: function() {
    this.$el.find('input:first').focus()
  },

  hide: function() {
    this.$el.modal('hide')
  }
})