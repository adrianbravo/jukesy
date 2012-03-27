Model.Track = Backbone.Model.extend({

  initialize: function () {
    _.bindAll(this, 'setVideoIds')
    this.view = new View.Track({ model: this })
  },
      
  play: function() {
    var self = this
    
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
      Video.error()
    } else {
      //_.defer(function() {
      //  Controls.updateTrackInfo()
      //})
      
      this.setPlaying()
      
      Video.skipToPrev = false
      if (!this.video) {
        //this.video = this.bestVideo()
        this.video = this.videos[0].id
      }
      
      Meow.render('Now playing ' + this.get('name') + ' by ' + this.get('artist') + '.')
      Video.load(this.video)
    }
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
    //$('#controls #play').removeClass('loading')
    this.play()
  },
  
  unsetPlaying: function() {
    this.playing = false
    this.view.$el.removeClass('playing').find('.icon-music').addClass('icon-play').removeClass('icon-music')
  },
  
  setPlaying: function() {
    this.playing = true
    this.view.$el.addClass('playing').find('.icon-play').addClass('icon-music').removeClass('icon-play')
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
    this.delegateEvents()
    return this
  },
  
  playNow: function() {
    this.model.play()
    this.$el.find('.dropdown').removeClass('open')
    return false
  }
  
}))