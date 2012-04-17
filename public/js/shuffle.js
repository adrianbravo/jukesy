Model.Shuffle = Backbone.Model.extend({
  defaults: {
    active: false
  },
  
  initialize: function() {
    this.history = new Collection.Tracks()
  },
  
  disable: function() {
    this.set({ active: false })
  },
  
  enable: function() {
    this.history.reset()
    this.historyIndex = null
    this.set({ active: true })
  },
  
  shuffle: function() {
    return NowPlaying.random({ without: this.history.models })
  },
  
  next: function() {
    if (!this.historyIndex) {
      var track = this.shuffle()
      this.historyIndex = 0
      track.play()
      this.history.unshift(track)
      this.trimHistory()
    } else {
      if (this.historyIndex > this.history.length - 1) {
        this.historyIndex = this.history.length - 1
      }
      this.historyIndex--
      this.history.at(this.historyIndex).play()
    }
  },
  
  prev: function() {
    this.historyIndex++
    if (this.historyIndex > this.history.length - 1) {
      this.historyIndex = this.history.length - 1
      return
    } else {
      this.history.at(this.historyIndex).play()
    }
  },
  
  trimHistory: function() {
    if (this.history.length > NowPlaying.tracks.length / 2) {
      this.history.pop()
      this.trimHistory()
    }
  }
  
})
