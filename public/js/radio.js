Model.Radio = Backbone.Model.extend({
  defaults: {
    active: false
  },
  
  initialize: function() {
    _.bindAll(this, 'discover')
  },
  
  disable: function() {
    this.set({ active: false })
    clearInterval(this.interval)
  },
  
  enable: function() {
    this.set({ active: true })
    this.interval = setInterval(this.discover, 2000)
    Video.repeat = false
    Shuffle.disable()
  },
  
  discover: function() {
    var track
    if (!window.NowPlaying || !NowPlaying.tracks.length || this.tracks) {
      return
    }
    
    // radio only pre-fills up to three tracks
    if (Video.track && _.indexOf(NowPlaying.tracks.models, Video.track) + 3 < NowPlaying.tracks.length) {
      return
    }
    
    track = NowPlaying.tracks.at(Math.floor(Math.random() * NowPlaying.tracks.length))
    
    if (track.similarTracks) {
      track.addSimilarTrack()
    } else {
      this.tracks = new Model.LastFM({ artist: track.get('artist'), track: track.get('name'), method: 'track.getSimilar', limit: 50, hide: true })
      this.tracks.on('queryCallback', function() {
        track.similarTracks = _.chain(this.results)
                                .rest()
                                .map(function(track) {
                                  return new Model.Track(track.toJSON())
                                })
                                .value()
        track.addSimilarTrack()
        Radio.tracks = null
      }, this.tracks)
    }
  }
  
})


;
