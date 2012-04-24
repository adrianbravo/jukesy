View.Share = Backbone.View.extend({
  template: jade.compile($('#share-template').text()),
  
  events: {
    'click .share-twitter': 'twitterPopup',
    'click .share-facebook': 'facebookPopup'
  },
  
  render: function(options) {
    if (options) {
      this.url = options.url
      this.text = options.text
    }
    this.$el.html(this.template({
      url: this.url
    }))
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
  
  twitterPopup: function() {
    window.open('https://twitter.com/share?url=hack&text=' + encodeURIComponent(this.text + ' ' + this.url + ' #jukesy #music'), 'sharer', 'width=626,height=436')
  },
  
  facebookPopup: function() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.url), 'sharer', 'width=626,height=436')
  }
})


;
