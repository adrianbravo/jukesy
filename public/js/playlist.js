Model.Playlist = Backbone.Model.extend({
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    this.nowPlayingView = new View.NowPlaying({ model: this })
    this.tracks = []
  },
  
  addTracks: function(tracks, position) {
    var self = this
    if (_.isUndefined(position)) {
      position = this.tracks.length
    }
    _.each(tracks, function(track) {
      self.tracks.splice(position++, 0, track)
      track.playlist = self
    })
  },
  
  removeTracks: function(tracks) {
    var self = this
    _.each(tracks, function(track) {
      self.tracks.splice(_.indexOf(self.tracks, track), 1)
    })
    
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
