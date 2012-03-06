Model.Track = Backbone.Model.extend({
/*
  initialize: function () {
    _.bindAll(this, 'setVideoIds')
  },
  
  play: function() {
    var self = this

    // Do not attempt to play if an attempt to play a video is in progress
    if (Video.loading) {
      return false
    }

    if (NowPlaying != this.playlist) {
      this.playlist.nowPlaying()
    }
    NowPlayingTrack = this

    if (_.isUndefined(this.videos)) {
      this.getVideoIds()
    } else if (_.isEmpty(this.videos)) {
      Video.error() // ???
    } else {
      _.defer(function() {
        //Controls.updateTrackInfo()
      })

      //if ($(this.view.el).is(':visible')) {
      //  this.view.setPlaying()
      //}

      //Video.skipToPrev = false
      if (!this.video) {
        //this.video = this.bestVideo()
        this.video = this.videos[0].id
      }
      console.log('Track.play', this.video)
      Video.load(this.video)
    }
  },
  
  getVideoIds: function() {
    if (Video.search(this.toJSON())) {
      console.log('Setting setTrackVideoIds', this.setVideoIds, this.sodjafs, this)
      window.setTrackVideoIds = this.setVideoIds
    }
  },
  
  setVideoIds: function(data) {
    console.log('Track.setVideoIds', data)
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
*/
})




























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