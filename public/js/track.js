$(function() {


  //
  // Basic track model.
  //
  Model.Track = Backbone.Model.extend({
    play: function() {
      var self = this

      if (Video.loading) {
        return false
      }

      if (NowPlaying != this.playlist) {
        this.playlist.nowPlaying()
      }
      NowPlayingTrack = this

      if (_.isUndefined(this.videos)) {
        this.getVideos()
      } else if (_.isEmpty(this.videos)) {
        Video.error()
      } else {
        _.defer(function() {
          Controls.updateSongInfo()
        })

        if ($(this.view.el).is(':visible')) {
          this.view.setPlaying()
        }

        Video.skipToPrev = false
        Video.load(this.videos[0])
      }
    },

    getVideos: function() {
      window.Video.searchByArtistAndTrack(this.get('artist'), this.get('name'), 'Video.setTrackVideoIds')
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
