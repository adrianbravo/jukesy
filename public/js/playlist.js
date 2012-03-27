Model.Playlist = Backbone.Model.extend({
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    this.nowPlayingView = new View.NowPlaying({ model: this })
    this.tracks = []
  },
  
  add: function(track, position) {
    if (_.isUndefined(position)) {
      position = this.tracks.length
    }
    this.tracks.splice(position, 0, track)
    track.playlist = this
  },
  
  nowPlaying: function() {
    window.NowPlaying = this
    if (Video.player) {
      Video.stop()
    }
  }
  
})

View.NowPlaying = Backbone.View.extend({
  template: jade.compile($('#now-playing-template').text()),
  
  render: function() {
    var self = this
    
    this.$el.html(this.template({ tracks: this.model.tracks }))
    _.each(this.model.tracks, function(track) {
      self.$el.find('tbody').append(track.view.$el)
      track.view.delegateEvents()
    })
    return this
  }
})
