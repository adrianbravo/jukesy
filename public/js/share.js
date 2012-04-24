View.Share = Backbone.View.extend({
  template: jade.compile($('#share-template').text()),
  
  events: {
    'click .autoplay': 'toggleAutoplay'
  },
  
  render: function(options) {
    if (options) {
      this.url = options.url
      this.autoplay = false
    }
    this.$el.html(this.template({
      url: this.url,
      autoplay: this.autoplay
    }))
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
  
  toggleAutoplay: function() {
    this.autoplay = !this.autoplay
    this.render()
  }
})


;