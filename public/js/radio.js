Model.Radio = Backbone.Model.extend({
  defaults: {
    active: false
  },
  
  disable: function() {
    this.set({ active: false })
    clearInterval(this.interval)
  },
  
  enable: function() {
    this.set({ active: true })
    this.interval = setInterval(this.discover, 2000)
    Video.repeat = false
    Video.shuffle = false
  },
  
  discover: function() {
    var track
    if (!window.NowPlaying || !NowPlaying.tracks.length) {
      return
    }
    
    // check if less than 3 tracks are ahead of Video.track, if so, continue
    track = NowPlaying.tracks.at(Math.floor(Math.random() * NowPlaying.tracks.length))
    // query for 50 similar tracks if !similarTracks
    // callback (or if similarTracks already exists)
      // select random index from similarTracks, attempt to add it (w/ "parent" track reference)
        // unless it already exists in the playlist (may want to code restriction at playlist level)
  }
  
})