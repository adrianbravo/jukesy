Model.Shuffle = Backbone.Model.extend({
  
  initialize: function() {
    this.active = false
    this.history = new Collection.Tracks()
    _.bindAll(this, 'trimHistory')
  },
  
  disable: function() {
    this.active = false
  },
  
  enable: function() {
    this.history.reset(Video.track ? [ Video.track ] : [])
    this.active = true
  },
  
  next: function() {
    this.trimHistory()
    var index = this.history.indexOf(Video.track)
    if (index + 1 == this.history.length) {
      var track = NowPlaying.tracks.randomWithout(this.history.models)
      track.play()
    } else {
      this.history.at(index + 1).play()
    }
  },
  
  prev: function() {
    var index = this.history.indexOf(Video.track)
    if (index > 0) {
      this.history.at(index - 1).play()
    }
    _.defer(this.trimHistory)
  },
  
  trimHistory: function() {
    this.history.reset(this.history.last(_.min([Math.floor(NowPlaying.tracks.length / 2), 50])))
  }
  
})


;
