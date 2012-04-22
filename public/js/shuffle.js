Model.Shuffle = Backbone.Model.extend({
  defaults: {
    active: false
  },
  
  initialize: function() {
    this.history = new Collection.Tracks()
    _.bindAll(this, 'trimHistory')
  },
  
  disable: function() {
    this.set({ active: false })
  },
  
  enable: function() {
    this.history.reset()
    this.set({ active: true })
  },
  
  next: function() {
    var index = this.history.indexOf(Video.track)
    if (index + 1 == this.history.length) {
      var track = NowPlaying.tracks.randomWithout(this.history.models)
      track.play()
    } else {
      this.history.at(index + 1).play()
    }
    _.defer(this.trimHistory)
  },
  
  prev: function() {
    var index = this.history.indexOf(Video.track)
    if (index > 0) {
      this.history.at(index - 1).play()
    }
    _.defer(this.trimHistory)
  },
  
  trimHistory: function() {
    this.history.reset(this.history.last(50))
  }
  
})


;
