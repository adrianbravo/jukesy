
$(function() {

  Model.Artist = Backbone.Model.extend({});
  Model.Album = Backbone.Model.extend({});
  Model.Tag = Backbone.Model.extend({});

  Model.Track = Backbone.Model.extend({
    play: function() {
      var self = this;

      if (window.Video.loading) return false;
      window.currentlyPlayingTrackModel = this;
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
    },
  });

  AppRouter = Backbone.Router.extend({
    initialize: function() {
      this.bind('appview', Video.fullscreenOff);
      this.bind('appview', this.hideViews);
    },

    routes: {
      '/'                  : 'home',
      '/playlists'         : 'playlists_index',
      '/playlist/:id'      : 'playlist_view',
      '/playlist/play/:id' : 'playlist_play',
      '/lastfm/:type/:method/:query': 'search',
    },

    hideViews: function() {
      $('#playlist_wrapper, #main').hide();
    },

    home: function() {
      this.trigger('appview');
      $('#playlist_wrapper').show();
      new View.Home();
    },

    playlists_index: function(id) {
      this.trigger('appview');
      $('#main').show();
      new View.Playlists();
    },

    playlist_play: function(id) {
      // Unbind events for when view is re-created
      if (!_.isUndefined(window.Playlist)) window.Playlist.view.delegateEvents([]);
      this.trigger('appview');
      $('#playlist_wrapper').show();
      window.Playlist = new Model.Playlist(Playlists.get(id).toJSON());
    },

    search: function(type, method, query) {
      // Unbind events for when view is re-created
      if (!_.isUndefined(window.Search)) window.Search.view.delegateEvents([]);
      this.trigger('appview');
      $('#main').show();
      var query = decodeURIComponent(query);

      window.Search = new Model.Search({ type: type, query: query, method: 'search' });
    },
  });

  View.App = Backbone.View.extend({
    el: $(document),

    events: {
        'keypress #query_clone': 'searchOnEnter'
      , 'keypress #query'      : 'searchOnEnter'
      , 'keydown'              : 'keyMapper'
      , 'keyup'                : 'setMaxVolume'
      , 'click a'              : 'hijackAnchor'
      //, 'hover [title]'        : 'tooltip'
    },

    hijackAnchor: function(e) {
      e.preventDefault();
      Router.navigate($(e.target).attr('href'), true);
    },

    tooltip: function(e) {
      var $tgt = $(e.currentTarget);
      if (e.type == 'mouseenter') {
        var $tooltip = $('<div class="tooltip">' + $tgt.attr('title') + '</div>');
        $tgt.append($tooltip);
        $tgt.attr('title','');
        $tooltip.css('top', $tgt.outerHeight() + 15)
                .css('margin-left', ($tgt.outerWidth()/2) - ($tooltip.outerWidth()/2));
      } else if (e.type == 'mouseleave') {
        var $tooltip = $tgt.find('.tooltip');
        $tgt.attr('title', $tooltip.html());
        $tooltip.remove();
      }
    },

    searchOnEnter: function(e) {
      if (e.keyCode == 13) {
        Router.navigate('/lastfm/track/search/' + encodeURIComponent($('#query').val()), true);
        $('#query').val('').blur();
      }
    },

    // The event lacks keyboard modifiers (ctrl, alt, shift, meta)
    keypressHasModifier: function(e) {
      return (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) ? true : false;
    },

    setMaxVolume: function(e) {
      if ($(e.target).is('input, textarea')) return;
      if (e.keyCode == 38 || e.keyCode == 40) {
        var value = Controls.$volume.slider('value');
        if (value) {
          Controls.lastMaxVolume = value;
        } else {
          //Video.mute();
        }
      }
    },

    keyMapper: function(e) {
      if ($(e.target).is('input, textarea')) return;

      switch (e.keyCode) {
        case 65: // CTRL-A, META-A
          if (e.metaKey || e.ctrlKey) {
            if (Search.view.el.find('.selected').length < Search.view.el.find('li').length) {
              Search.view.el.find('li').addClass('selected');
            } else {
              Search.view.el.find('li').removeClass('selected');
            }
            return false;
          }
          return;
        case 77: // M
          if (this.keypressHasModifier(e)) return;
          Controls.toggleMute(e);
          return false;
        case 32: // SPACEBAR
          ($('#play').hasClass('pause')) ? window.Controls.pause() : window.Controls.play();
          return false;
        case 37: // LEFT
          if (this.keypressHasModifier(e)) return;
          window.Controls.prev();
          return false;
        case 39: // RIGHT
          if (this.keypressHasModifier(e)) return;
          window.Controls.next();
          return false;
        case 38: // UP
          if (this.keypressHasModifier(e)) return;
          Controls.$volume.slider('value', Controls.$volume.slider('value') + 2);
          return false;
        case 40: // DOWN
          if (this.keypressHasModifier(e)) return;
          Controls.$volume.slider('value', Controls.$volume.slider('value') - 2);
          return false;
        case 70: // F
          if (this.keypressHasModifier(e)) return;
          Video.toggleFullscreen();
          return false;
        case 191: // /
          if (this.keypressHasModifier(e)) return;
          Video.fullscreenOff();
          $('#query').focus();
          return false;
      }
    },
  });

  View.Playlists = Backbone.View.extend({
    el: $('#main'),

    template: _.template($('#playlists-template').html()),

    initialize: function() {
      this.render();
    },

    render: function() {
      var self = this;

      this.el.html(this.template({ empty: _.isEmpty(Playlists.models) }));
      _.each(Playlists.models, function(playlist) {
        var view = new View.PlaylistShort({ model: playlist });
        self.el.find('#playlists ul').append(view.render().el);
      });
    },
  });

  View.Home = Backbone.View.extend({
    el: $('#main'),

    template: _.template($('#home-template').html()),

    initialize: function() {
      this.render();
      this.delegateEvents();
    },

    render: function() {
      this.el.html(this.template);
    },
  });
});

$(function() {
  window.AppView   = new View.App();
  window.Video     = new Model.Video();
  window.Controls  = new View.Controls();
  window.Playlists = new Collection.Playlists();
  window.Playlist  = new Model.Playlist();

  Playlists.fetch();
});

