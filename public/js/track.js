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
        $(this.view.el).addClass('playing').siblings().removeClass('playing');
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
      'click'    : 'toggleSelect',
      'dblclick' : 'play'
    },

    // TODO app-level response to del keypress (uses select)
    //removeTrack: function() {
    //  nowPlaying.remove(this.model);
    //  return false;
    //},

    play: function() {
      console.log(this.model);
      nowPlaying.setPlaylist(this.model.collection);

      if (nowPlaying.view.cancelClick) {
        nowPlaying.view.cancelClick = false;
        return false;
      }
      if (this.model === nowPlayingTrack) return false;

      this.model.play();
    },

    queueTrack: function(e, method) {
      $(this.el).addClass('selected');
      nowPlaying.add(_(Search.results).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) return null;
          $(track.view.el).removeClass('selected');
          return (new Model.Track(track.toJSON()));
        }).compact().value(), { method: method });
    },

    toggleSelect: function() {
      $(this.el).toggleClass('selected');
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.delegateEvents();
      return this;
    }
  });

  /*
  View.SearchTrack = Backbone.View.extend({

    events: {
      'click'           : 'toggleSelect',
      'dblclick'        : 'play'
    },

    toggleSelect: function() {
      $(this.el).toggleClass('selected');
    },

    play: function(e) {
      this.queueTrack(e, 'play');
      // should load the track list as well
    },

    last: function(e) {
      this.queueTrack(e, 'last');
      // should only add the tracks
    },

    queueTrack: function(e, method) {
      $(this.el).addClass('selected');
      nowPlaying.add(_(Search.results).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) return null;
          $(track.view.el).removeClass('selected');
          return (new Model.Track(track.toJSON()));
        }).compact().value(), { method: method });
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });
  */

  View.SearchTrack = View.SearchResult.extend({
    template: _.template($('#search-track-template').html()),

    tagName: 'tr'
  });

  View.SearchTracks = View.SearchResults.extend({
    el: '#search .tracks',

    template: _.template($('#search-tracks-template').html()),

    addModel: function(model) {
      var view = new View.SearchTrack({ model : model });
      $(this.view.el).append(view.el);
    }
  });

  Collection.Tracks = Backbone.Collection.extend({
    model: Model.Track
  });

});
