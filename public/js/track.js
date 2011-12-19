$(function() {


  //
  // Basic track model.
  //
  Model.Track = Backbone.Model.extend({
    play: function() {
      var self = this;
      if (Video.loading) {
        return false;
      }

      window.nowPlayingTrack = this;

      if (_.isUndefined(this.videos)) {
        this.getVideos();
      } else if (_.isEmpty(this.videos)) {
        Video.error();
      } else {
        _.defer(function() {
          Controls.$songInfo.html(window.Controls.songInfoTemplate(self.toJSON()));
        });

        if ($(this.view.el).is(':visible')) {
          this.view.setPlaying();
        }

        Video.skipToPrev = false;
        Video.load(this.videos[0]);
      }
    },

    getVideos: function() {
      window.Video.searchByArtistAndTrack(this.get('artist'), this.get('name'), 'Video.setTrackVideoIds');
    }
  });


  //
  // Track view, which should be extended for several uses (playlist, now playing, search results).
  //
  View.Track = Backbone.View.extend(_.extend({
    tagName: 'tr',

    template: _.template($('#track-template').html()),

    events: {
      'click'    : 'toggleSelect',
      'dblclick' : 'play'
    },

    initialize: function() {
      _.bindAll(this, 'setPlaying');
    },

    render: function() {
      this.delegateEvents(this.events);
      $(this.el).html(this.template(this.model.toJSON()));
      if (this.model === window.nowPlayingTrack) {
        _.defer(this.setPlaying);
      }
      return this;
    },

    play: function() {
      this.model.play();
      $(this.el).siblings().removeClass('selected');
    },

    setPlaying: function() {
      $(this.el).addClass('playing').siblings().removeClass('playing');
    }
  }, Mixins.TrackSelection));


  //
  // Basic tracks collection.
  //
  Collection.Tracks = Backbone.Collection.extend({
    model: Model.Track
  });


});
