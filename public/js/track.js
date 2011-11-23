$(function() {
  
  Model.Track = Backbone.Model.extend({

    play: function() {
      var self = this;

      if (window.Video.loading) return false;
      window.nowPlayingTrack = this;

      if (_.isUndefined(this.videos)) {
        this.getVideos();
      } else if (_.isEmpty(this.videos)) {
        window.Video.error();
      } else {
        _.defer(function() {
          Controls.$songInfo.html(window.Controls.songInfoTemplate(self.toJSON()));
        });

        if ($(this.view.el).is(':visible'))
          this.view.setPlaying();

        window.Video.skipToPrev = false;
        window.Video.load(this.videos[0]);
      }
    },

    getVideos: function() {
      window.Video.searchByArtistAndTrack(this.get('artist'), this.get('name'), 'Video.setTrackVideoIds');
    }

  });

  View.Track = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($('#track-template').html()),

    /*
    play: function() {
      nowPlaying.setPlaylist(this.model.collection);

      if (nowPlaying.view.cancelClick) {
        nowPlaying.view.cancelClick = false;
        return false;
      }
      if (this.model === nowPlayingTrack) return false;

      this.model.play();
    },
    */

    initialize: function() {
      _.bindAll(this, 'setPlaying');
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      if (this.model === window.nowPlayingTrack)
        _.defer(this.setPlaying);
      return this;
    },

    setPlaying: function() {
      $(this.el).addClass('playing').siblings().removeClass('playing');
    },

    events: {
      'click'           : 'toggleSelect',
      'dblclick'        : 'play'
    },

    play: function() {
      this.model.play();
    },

    toggleSelect: function() {
      $(this.el).toggleClass('selected');
    }

  });

  View.SearchTrack = View.SearchResult.extend({
    template: _.template($('#search-track-template').html()),

    tagName: 'tr',
    className: 'track',

    events: {
      'click'           : 'toggleSelect',
      'dblclick'        : 'play'
    },

    play: function() {
      this.queueTrack('play');
      // should load the track list as well
    },

    queueTrack: function(method) {
      $(this.el).addClass('selected');
      nowPlaying.add(_(Search.get('track').models).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) return null;
          $(track.view.el).removeClass('selected');
          return (new Model.Track(track.toJSON()));
        }).compact().value(), { method: method });
    },

    toggleSelect: function() {
      $(this.el).toggleClass('selected');
    }

  });

  View.SearchTracks = View.SearchResults.extend({
    el: '#search .tracks',

    viewObject: View.SearchTrack,
    viewInner: 'table tbody',

    template: _.template($('#search-tracks-template').html()),
  });

  Collection.Tracks = Backbone.Collection.extend({
    model: Model.Track
  });

});
