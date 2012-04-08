Model.Track = Backbone.Model.extend({

  initialize: function () {
    _.bindAll(this, 'setVideoIds')
    this.view = new View.Track({ model: this })
    this.viewTrackInfo = new View.TrackInfo({ model: this })
  },
      
  play: function() {
    var self = this
    
    // this.playing poses an issue
    if (!Video.player || Video.loading || this.playing) {
      return false
    }
    
    if (NowPlaying != this.playlist) {
      this.playlist.nowPlaying()
    }
    
    if (Video.track) {
      Video.track.unsetPlaying()
    }
    Video.track = this

    if (_.isUndefined(this.videos)) {
      this.getVideoIds()
    } else if (_.isEmpty(this.videos)) {
      this.noVideos()
    } else {
      this.setPlaying()
      
      Video.skipToPrev = false
      this.setVideo()
      
      Meow.render('Now playing ' + this.get('name') + ' by ' + this.get('artist') + '.')
      Video.load(this.video)
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
    this.error = true
    this.view.render().$el.addClass('error')
    Video.next()
  },
  
  getVideoIds: function() {
    if (Video.search(this.toJSON())) {
      window.setTrackVideoIds = this.setVideoIds
    }
  },
  
  setVideoIds: function(data) {
    if (!data.feed.entry) {
      this.videos = []
    } else {
      this.videos = _.map(data.feed.entry, function(entry) {
        return {
          id: _.last(entry.id.$t.split('/'))
        }
      })
    }
    
    window.setTrackVideoIds = null
    Video.loading = false
    this.play()
  },
  
  setVideo: function() {
    if (!this.video) {
      //this.video = this.bestVideo()
      this.video = this.videos[0].id
    }
  },

  unsetPlaying: function() {
    this.playing = false
    this.view.$el.removeClass('playing').find('.icon-music').addClass('icon-play').removeClass('icon-music')
    this.viewTrackInfo.render()
  },
  
  setPlaying: function() {
    this.playing = true
    this.view.$el.addClass('playing').find('.icon-play').addClass('icon-music').removeClass('icon-play')
    this.viewTrackInfo.render()
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
    'click .play-now' : 'playNow',
    'click .remove'   : 'removeTrack',
    'click .dropdown' : 'dropdown'
  },
  
  initialize: function() {
    _.bindAll(this, 'playNow', 'queueNext', 'queueLast')
    this.render()
  },
  
  render: function() {
    this.$el.html(this.template({ track: this.model }))
    this.$el.find('.icon-exclamation-sign').popover()
    this.delegateEvents()
    return this
  },
  
  playNow: function() {
    this.model.play()
    this.$el.find('.dropdown').removeClass('open')
    return false
  }
  
}))
