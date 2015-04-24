Model.Track = Backbone.Model.extend({

  initialize: function () {
    _.bindAll(this, 'setVideoIds')
    this.view = new View.Track({ model: this })
    this.viewTrackInfo = new View.TrackInfo({ model: this })
  },

  play: function(force) {
    var self = this

    if (!Video.player || Video.loading || this.playing) {
      Video.seek(0)
      return false
    }

    if (NowPlaying != this.collection.playlist) {
      this.collection.playlist.setNowPlaying()
    }

    if (_.isUndefined(this.videos)) {
      this.getVideoIds()
    } else if (_.isEmpty(this.videos)) {
      this.noVideos()
    } else {
      this.setPlaying()

      Video.skipDirection = 'next'
      Meow.render({
        message: 'Now playing ' + this.get('name') + ' by ' + this.get('artist') + '.',
        type: 'info'
      })

      if (force) {
        this.removeFromHistory()
      }
      this.addToHistory()

      this.setVideo(0)
      Video.play()
    }
  },

  // TODO clean this up, this.playing is a hack
  youtubeError: function(error) {
    if (error == 150) {
      this.video = null
      this.videos = _.rest(this.videos)
      if (this.videos.length) {
        this.setVideo()
        this.playing = false
        this.play()
      } else {
        this.noVideos()
      }
    }
  },

  noVideos: function() {
    this.setPlaying()
    this.error = true
    this.view.render().$el.addClass('error')
    this.skip()
  },

  removeFromHistory: function() {
    Shuffle.history.remove(this)
  },

  addToHistory: function() {
    Shuffle.history.add(this)
  },

  skip: function() {
    this.addToHistory()
    if (Video.skipDirection == 'prev') {
      NowPlaying.tracks.prev()
    } else {
      NowPlaying.tracks.next()
    }
    this.removeFromHistory()
  },

  getVideoIds: function() {
    if (Video.search(this.toJSON())) {
      window.setTrackVideoIds = this.setVideoIds
    }
  },

  setVideoIds: function(data) {
    if (!data.items) {
      this.videos = [];
    } else {
      this.videos = _.map(data.items, function(item) {
        return {
          id: item.id
        };
      });
    }

    window.setTrackVideoIds = null
    Video.loading = false
    this.play()
  },

  setVideo: function(i) {
    if (this.videos && this.videos[i]) {
      this.video = this.videos[i].id
      Video.load(this.video)
    }
  },

  unsetPlaying: function() {
    this.playing = false
    this.view.$el.removeClass('playing').find('.icon-music').addClass('icon-play').removeClass('icon-music')
    this.viewTrackInfo.render()
  },

  setPlaying: function() {
    if (Video.track && Video.track != this) {
      Video.track.unsetPlaying()
    }
    Video.track = this
    this.playing = true
    this.view.$el.addClass('playing').find('.icon-play').addClass('icon-music').removeClass('icon-play')
    this.viewTrackInfo.render()
  },

  addSimilarTrack: function() {
    if (!this.similarTracks || !this.similarTracks.length || (this.collection && this.collection.playlist != window.NowPlaying)) {
      return
    }
    NowPlaying.tracks.add(this.similarTracks.randomWithout([]).clone())
  }

})

View.TrackInfo = Backbone.View.extend({
  template: jade.compile($('#track-info-template').text()),

  render: function() {
    $('#controls .track-info').html(!this.model.playing ? '' : this.template({ track: this.model }))
  }
})

View.Track = Backbone.View.extend(_.extend(Mixins.TrackViewEvents, {
  tagName: 'tr',
  template: jade.compile($('#track-template').text()),

  events: {
    'dblclick'        : 'playNow',
    'click .play-now' : 'playNow',
    'click .dropdown' : 'dropdown',
    'click .queue-next'      : 'queueNext',
    'click .queue-last'      : 'queueLast',
    'click .add-to-playlist' : 'addToPlaylist',
    'click .remove'          : 'removeTrack'
  },

  initialize: function() {
    _.bindAll(this, 'playNow', 'queueNext', 'queueLast', 'addToPlaylist')
    this.render()
  },

  render: function() {
    this.$el.html(this.template({ track: this.model.toJSON() }))
    return this
  },

  playNow: function() {
    this.model.play(true)
    this.$el.find('.dropdown').removeClass('open')
    return false
  }

}))

Collection.Tracks = Backbone.Collection.extend({
  model: Model.Track,

  play: function() {
    if (!this.length) {
      return
    }
    if (Shuffle.active) {
      this.randomWithout([]).play()
    } else {
      this.at(0).play()
    }
  },

  randomWithout: function(without) {
    var tracks = this.without.apply(this, without)
    return tracks[Math.floor(Math.random() * tracks.length)]
  },

  next: function() {
    var next = null

    if (Video.loading || Video.state == 3 || Video.tryRepeat()) {
      return
    }

    if (Shuffle.active) {
      return Shuffle.next()
    } else {
      next = (!Video.track || Video.track === this.last()) ? this.first() : this.at(this.indexOf(Video.track) + 1)
    }
    next.play()
  },

  prev: function() {
    var prev = null

    if (Video.loading || Video.state == 3 || Video.tryRepeat() || Video.trySeek()) {
      return
    }

    Video.skipDirection = 'prev'
    if (Shuffle.active) {
      return Shuffle.prev()
    } else {
      prev = (!Video.track || Video.track === this.first()) ? this.last() : this.at(this.indexOf(Video.track) - 1)
    }
    prev.play()
  }

})


;
