View.Share = Backbone.View.extend({
  template: jade.compile($('#share-template').text()),
  
  render: function(options) {
    if (options) {
      this.url = options.url
      this.text = options.text
    }
    this.$el.html(this.template({
      url         : this.url,
      twitterSrc  : this.tweetIframeLink(),
      facebookSrc : this.facebookIframeLink()
    }))
    ModalView.render(this.$el)
    this.delegateEvents()
    return this
  },
  
  tweetIframeLink: function() {
    return 'http://platform.twitter.com/widgets/tweet_button.html' +
            '?url=lol' + // hack is intentional
            '&text=' + encodeURIComponent(this.text + ' ' + this.url) +
            '&related=jukesyapp,adrianbravo' +
            '&count=none' +
            '&lang=en' +
            '&counturl=' + encodeURIComponent(this.url) +
            '&hashtags=music,jukesy'
  },
  
  facebookIframeLink: function() {
    return 'http://www.facebook.com/plugins/like.php' +
            '?href=' + encodeURIComponent(this.url) +
            '&send=false' +
            '&layout=standard' +
            '&width=300' +
            '&show_faces=true' +
            '&action=like' +
            '&colorscheme=dark' +
            '&font=trebuchet+ms' +
            '&height=80' +
            //'&appId=150725614969142' // facebook app id
            '&appId=298809030130809'
  }
})


;
