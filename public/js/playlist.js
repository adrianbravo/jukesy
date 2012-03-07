Model.Playlist = Backbone.Model.extend({
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    //
    // defaults for testing
    this.tracks = []
    var track
    track = new Model.Track({ artist: 'Battles', name: 'Ice Cream' })
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
    console.log('Playlist.nowPlaying', this.tracks)
    window.NowPlaying = this
    if (Video.player) {
      Video.stop()
    }
  }
  
})
