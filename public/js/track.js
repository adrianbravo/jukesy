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

    events: {
      'click'           : 'toggleSelect',
      'dblclick'        : 'play'
    },

    initialize: function() {
      _.bindAll(this, 'setPlaying');
    },

    render: function() {
      this.delegateEvents(this.events);
      $(this.el).html(this.template(this.model.toJSON()));
      if (this.model === window.nowPlayingTrack)
        _.defer(this.setPlaying);
      return this;
    },

    play: function() {
      this.model.play();
      $(this.el).siblings().removeClass('selected');
    },

    setPlaying: function() {
      $(this.el).addClass('playing').siblings().removeClass('playing');
    },

    toggleSelect: function(e, ui) {
      if (!(e.altKey || e.metaKey))
        $(this.el).removeClass('selected').siblings().removeClass('selected');
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
      nowPlaying.add(_(Search.track.models).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) return null;
          $(track.view.el).removeClass('selected');
          return (new Model.Track(track.toJSON()));
        }).compact().value(), { method: method });
    },

    toggleSelect: function(e, ui) {
      if (e.shiftKey) {
        this.fillSelected($(this.el), $(Search.lastClicked));
      } else if (!(e.altKey || e.metaKey)) {
        $(this.el).removeClass('selected').siblings().removeClass('selected');
        $(this.el).toggleClass('selected');
      } else {
        $(this.el).toggleClass('selected');
      }
      Search.lastClicked = this.el;
    },

    fillSelected: function($track1, $track2) {
      if (!$track1 || !$track2) {
        return;
      }
      if ($track1 == $track2) {
        $track1.addClass('selected');
      } else if ($track1.index() > $track2.index()) {
        $track1.prevUntil($track2).addClass('selected');
      } else if ($track2.index() > $track1.index()) {
        $track2.prevUntil($track1).addClass('selected');
      }
      $track1.addClass('selected');
      $track2.addClass('selected');
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
