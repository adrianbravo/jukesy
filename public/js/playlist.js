Model.Playlist = Backbone.Model.extend({
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    this.nowPlayingView = new View.NowPlaying({ model: this })
    this.tracks = []
    
    //
    // defaults for testing
    this.add(new Model.Track({ artist: 'Battles', name: 'Race : Out' }))
    this.add(new Model.Track({ artist: 'Beatles', name: 'Mother Nature\'s Son' }))
    this.add(new Model.Track({ artist: 'Cake', name: 'Short Skirt/Long Jacket' }))
    this.add(new Model.Track({ artist: 'Sly & the Family Stone', name: 'Spaced Cowboy' }))
    this.add(new Model.Track({ artist: 'Beastie Boys', name: 'Sabotage' }))
    this.add(new Model.Track({ artist: 'Röyksopp', name: 'Happy Up Here' }))
    this.add(new Model.Track({ artist: 'qowirqorwg', name: 'osjfdaosjdfoasjf ojsdfoa ojsfoaf sofnska sdfask' }))
    this.add(new Model.Track({ artist: 'Wugazi', name: 'Shame On Blue' }))
    this.add(new Model.Track({ artist: 'Kid Koala', name: 'Fender Bender' }))
    this.add(new Model.Track({ artist: 'Beck', name: 'Where It\'s At' }))
    this.add(new Model.Track({ artist: 'The Unicorns', name : 'Jellybones' }))
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
    })
    return this
  }
})
