
$(function() {

  AppRouter = Backbone.Router.extend({
    initialize: function() {
      this.bind('appview', Video.fullscreenOff);
      this.bind('appview', this.hideViews);
    },

    routes: {
      '/'                  : 'home',
      //'/playlists'         : 'playlists_index',
      //'/playlist/:id'      : 'playlist_view',
      //'/playlist/play/:id' : 'playlist_play',
      '/search/:query': 'searchAll'

      //'/artist/:query': 'searchArtist',
      //'/album/:query': 'searchAlbum',
      //'/track/:query': 'searchTrack',
    },

    hideViews: function() {
      $('#now-playing, #main').hide();
    },

    home: function() {
      this.trigger('appview');
      $('#now-playing').show();
      new View.Home();
    },

    playlist_play: function(id) {
      // Unbind events for when view is re-created
      nowPlaying.view.delegateEvents({});
      this.trigger('appview');
      $('#now-playing').show();
      nowPlaying.setPlaylist(Playlists.get(id));
    },

    // lastfm/track/search
    searchAll: function(query) {
      /*
      if (!_.isUndefined(window.Search)) {
        window.Search.view.delegateEvents({});
      }
      */

      query = decodeURIComponent(query);
      this.trigger('appview');
      $('#main').show();
      window.Search = new Model.Search({ query: query });


      //window.Search = new Model.Search({ type: type, query: query, method: 'search' });
    }

  });

  View.App = Backbone.View.extend({
    el: $(document),

    events: {
      'keypress #query'      : 'searchAll',
      'keydown'              : 'keyMapper',
      'keyup'                : 'setMaxVolume',
      'click #login'         : 'login'
      //, 'hover [title]'        : 'tooltip'
    },

    login: function(e) {
      new Model.Modal({ type: 'login' });
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

    searchAll: function(e) {
      if (e.keyCode == 13) {
        Router.navigate('/search/' + encodeURIComponent($('#query').val()), true);
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
    }

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
    }

  });

});

$(function() {
  window.AppView    = new View.App();
  window.Video      = new Model.Video();
  window.Controls   = new View.Controls();
  window.Playlists  = new Collection.Playlists();

  //window.nowPlaying = new Model.NowPlaying();

  Playlists.fetch();
  PlaylistsView = new View.Playlists({ quickbar: true });
});

