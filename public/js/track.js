$(function() {

  Model.Track = Backbone.Model.extend({

    play: function() {
      var self = this;

      if (window.Video.loading) return false;
      window.nowPlayingTrack = this;
      window.Video.hideBadge();

      if (_.isUndefined(this.videos)) {
        this.getVideos();
      } else if (_.isEmpty(this.videos)) {
        window.Video.error();
      } else {
        _.defer(function() {
          Controls.$songInfo.html(window.Controls.songInfoTemplate(self.toJSON()));
          Controls.$songBadge.html(window.Controls.songBadgeTemplate(self.toJSON()));
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

  View.PlaylistTrack = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#track-template').html()),

    events: {
      'click .remove': 'removeTrack',
      'dblclick :not(.remove)': 'play',
    },

    removeTrack: function() {
      nowPlaying.remove(this.model);
      return false;
    },

    play: function() {
      if (nowPlaying.view.cancelClick) {
        nowPlaying.view.cancelClick = false;
        return false;
      }
      if (this.model === nowPlayingTrack) return false;

      this.model.play();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  View.SearchTrack = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($('#track-template').html()),
    actions_template: _.template($('#track-actions-template').html()),

    events: {
        'click .play'     : 'play'
      , 'click .next'     : 'next'
      , 'click .last'     : 'last'
      , 'click'           : 'toggleSelect'
      , 'dblclick'        : 'play'
      //, 'mouseenter'      : 'showActions'
      //, 'mouseleave'      : 'hideActions'
    },

    refreshActions: function() {
      //this.hideActions();
      //this.showActions();
    },

    toggleSelect: function() {
      $(this.el).toggleClass('selected');
      this.refreshActions();
    },

    play: function(e) {
      this.queueTrack(e, 'play');
    },

    next: function(e) {
      this.queueTrack(e, 'next');
    },

    last: function(e) {
      this.queueTrack(e, 'last');
    },

    queueTrack: function(e, method) {
      $(this.el).addClass('selected');
      nowPlaying.add(_(Search.results).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) return null;
          $(track.view.el).removeClass('selected');
          return (new Model.Track(track.toJSON()));
        }).compact().value(), { method: method });
      this.refreshActions();
    },

    showActions: function(e) {
      $(this.el).siblings().find('.actions').remove();
      $(this.el).append(this.actions_template({ selected: $(this.el).parent().find(this.tagName + '.selected').length }));
    },

    hideActions: function(e) {
      $(this.el).find('.actions').remove();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
  });

  Collection.Tracks = Backbone.Collection.extend({
    model: Model.Track,
  });

});
