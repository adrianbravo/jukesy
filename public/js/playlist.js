Model.Playlist = Backbone.Model.extend({
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    this.nowPlayingView = new View.NowPlaying({ model: this })
    
    //
    // defaults for testing
    this.tracks = []
    var track
    track = new Model.Track({ artist: 'Cake', name: 'Short Skirt Long Jacket' })
    track.playlist = this
    this.tracks.push(track)
    track = new Model.Track({ artist: 'Battles', name: 'Sweetie & Shag' })
    track.playlist = this
    this.tracks.push(track)
    track = new Model.Track({ artist: 'qowirqorwg', name: 'osjfdaosjdfoasjf ojsdfoa ojsfoaf sofnska sdfask' })
    track.playlist = this
    this.tracks.push(track)
    track = new Model.Track({ artist: 'Wugazi', name: 'Shame On Blue' })
    track.playlist = this
    this.tracks.push(track)
    track = new Model.Track({ artist: 'Kid Koala', name: 'Fender Bender' })
    track.playlist = this
    this.tracks.push(track)
    track = new Model.Track({ artist: 'Beck', name: 'Where It\'s At' })
    track.playlist = this
    this.tracks.push(track)
    track = new Model.Track({ artist: 'The Unicorns', name : 'Jellybones' })
    track.playlist = this
    this.tracks.push(track)
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
