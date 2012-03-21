Model.Track = Backbone.Model.extend({

  initialize: function () {
    _.bindAll(this, 'setVideoIds')
    this.view = new View.Track({ model: this })
  },
      
  play: function() {
    var self = this

    if (!Video.player || Video.loading) {
      return false
    }
    
    if (NowPlaying != this.playlist) {
      this.playlist.nowPlaying()
    }
    
    if (Video.track) {
      Video.track.view.unsetPlaying()
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
      
      this.view.setPlaying()
      
      Video.skipToPrev = false
      if (!this.video) {
        //this.video = this.bestVideo()
        this.video = this.videos[0].id
      }
      
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
  }

})

View.Track = Backbone.View.extend(_.extend(Mixins.TrackSelection, Mixins.TrackViewEvents, {
  tagName: 'tr',
  template: jade.compile($('#track-template').text()),
    
  events: {
    'click .play-now' : 'playNow',
    'click .dropdown' : 'dropdown',
    'click'           : 'toggleSelect'
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
  },
  
  unsetPlaying: function() {
    this.$el.removeClass('playing')
    this.$el.find('.icon-music').addClass('icon-play').removeClass('icon-music')
  },
  
  setPlaying: function() {
    this.$el.addClass('playing')
    this.$el.find('.icon-play').addClass('icon-music').removeClass('icon-play')
  }
}))










/*
$(function() {


  //
  // Basic track model.
  //
  Model.Track = Backbone.Model.extend({

    bestVideo: function() {
      return _.min(this.videos, function(video) { return video.score }).id
    },
    
    nextUnselected: function() {
      var self = this,
          nextTrack = false
      _.each(this.playlist.tracks(), function(track) {
        var selected = $(track.view.el).hasClass('selected')
        if (nextTrack === true && !selected) {
          nextTrack = track
        } else if (track == self) {
          nextTrack = true
        }
      })
      
      if (!nextTrack || nextTrack === true) {
        var first = this.playlist.tracks()[0]
        return (first != this) ? first : null
      } else {
        return nextTrack
      }
    }
  })


  //
  // Track view, which should be extended for several uses (playlist, now playing, search results).
  //
  View.Track = Backbone.View.extend(_.extend({
    tagName: 'tr',

    className: 'track',

    template: Handlebars.compile($('#track-template').html()),

    events: {
      'click'       : 'toggleSelect',
      'dblclick'    : 'play',
      'contextmenu' : 'showContextmenu'
    },

    initialize: function() {
      _.bindAll(this, 'setPlaying', 'showContextmenu', 'play')
    },

    render: function() {
      this.delegateEvents(this.events)
      $(this.el).html(this.template(this.model.toJSON()))
      if (this.model === window.NowPlayingTrack) {
        _.defer(this.setPlaying)
      }
      return this
    },

    showContextmenu: function(e) {
      if (!$(this.el).hasClass('select')) {
        this.toggleSelect(e)
      }
      
      new Model.Contextmenu({
        event: e,
        actions: [
          { action: 'Play', extra: 'dblclick', callback: this.play }
        ]
      })
      return false
    },

    play: function() {
      this.model.play()
      this.setPlaying()
      $(this.el).siblings().removeClass('selected')
    },

    setPlaying: function() {
      $(this.el).addClass('playing').siblings().removeClass('playing')
    }
  }, Mixins.TrackSelection))


  //
  // Basic tracks collection.
  //
  Collection.Tracks = Backbone.Collection.extend({
    model: Model.Track
  });


});

*/
