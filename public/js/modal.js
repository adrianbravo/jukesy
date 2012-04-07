View.Modal = Backbone.View.extend({
  el: '#modal',

  initialize: function() {
    _.bindAll(this, 'hide', 'focusFirstInput', 'hidden')
    this.$el.on('hidden', this.hidden)
  },

  render: function(el) {
    this.$el.html(el).modal('show')
    _.delay(this.focusFirstInput, 500)
  },
    
  focusFirstInput: function() {
    this.$el.find('input:first').focus()
  },

  hide: function() {
    if (this.callback) {
      this.callback()
    }
    this.$el.modal('hide')
  },
  
  hidden: function() {
    this.unsetCallback()
  },

  setCallback: function(callback) {
    this.callback = callback
  },

  unsetCallback: function() {
    this.callback = null
  }
})
