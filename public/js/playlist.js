Model.Playlist = Backbone.Model.extend({
  defaults: {
    name: 'Untitled Playlist'
  },
  
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    this.nowPlayingView = new View.NowPlaying({ model: this })
    this.tracks = []
  },
  
  addTracks: function(tracks, position) {
    var self = this
      , message = 'Added ' + tracks.length + ' ' + _.plural(tracks.length, 'track', 'tracks') + ' to ' + this.get('name') + '.'
      
    if (_.isUndefined(position)) {
      position = this.tracks.length
    }
    _.each(tracks, function(track) {
      self.tracks.splice(position++, 0, track)
      track.playlist = self
    })
    Meow.render(message)
  },
  
  removeTracks: function(tracks) {
    var self = this
      , message = 'Removed ' + tracks.length + ' ' + _.plural(tracks.length, 'track', 'tracks') + ' from ' + this.get('name') + '.'
    
    _.each(tracks, function(track) {
      self.tracks.splice(_.indexOf(self.tracks, track), 1)
    })
    Meow.render(message)
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
