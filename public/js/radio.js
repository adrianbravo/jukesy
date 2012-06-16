Model.Radio = Backbone.Model.extend({
  initialize: function() {
    this.disable()
    _.bindAll(this, 'discover', 'disable', 'enable')
  },
  
  disable: function() {
    this.active = false
    clearInterval(this.interval)
  },
  
  enable: function() {
    this.active = true
    this.interval = setInterval(this.discover, 2000)
    Video.repeat = false
    Shuffle.disable()
  },
  
  discover: function() {
    var track
    
    if (!window.NowPlaying || !NowPlaying.tracks.length || this.tracks) {
      return
    }
    if (Video.stopped || Video.track && NowPlaying.tracks.indexOf(Video.track) + 3 < NowPlaying.tracks.length) {
      return
    }
    
    track = NowPlaying.tracks.randomWithout([])
    
    if (track.similarTracks) {
      track.addSimilarTrack()
    } else {
      this.tracks = new Model.LastFM({ artist: track.get('artist'), track: track.get('name'), method: 'track.getSimilar', limit: 50, hide: true })
      this.tracks.on('queryCallback', function() {
        track.similarTracks = new Collection.Tracks(_.map(this.results, function(result) { return result.toJSON() }))
        track.addSimilarTrack()
        Radio.tracks = null
      }, this.tracks)
    }
  }
  
})


;
