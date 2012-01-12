$(function() {


  //
  // Local routes (single-page app style, motherfucker)
  //
  AppRouter = Backbone.Router.extend({
    routes: {
      '/'              : 'home',
      '/search/:query' : 'searchAll',
      //'/artist/:query': 'searchArtist',
      //'/album/:query': 'searchAlbum',
      //'/track/:query': 'searchTrack',
      '/settings'      : 'settings',
      '/favorites'     : 'favorites',
      '/tag-radio'     : 'tagRadio',
      '/broadcasts'    : 'broadcasts',

      '/local/playlists/:id'  : 'playlistView'
      //'/local/playlists'      : 'playlistsIndex',
    },

    before: function() {
      visiblePlaylist = null
      lastSelected = null
      Video.fullscreenDisable()
      $('#main').hide()
      $('#quickbar a').removeClass('active')
      $('#quickbar').data('jsp').reinitialise()
    },

    home: function() {
      MainView.render(NowPlaying)
    },

    settings: function() {
      MainView.render('settings')
    },

    favorites: function() {
      MainView.render('favorites')
    },

    tagRadio: function() {
      MainView.render('tagRadio')
    },

    broadcasts: function() {
      MainView.render('broadcasts')
    },

    playlistView: function(id) {
      MainView.render(Playlists.get(id))
    },

    searchAll: function(query) {
      query = decodeURIComponent(query)
      window.Search = new Model.Search({ query: query })
      MainView.render(Search)
    }
  })


  //
  // Used primarily app-wide key bindings.
  //
  View.App = Backbone.View.extend({
    el: $(document),

    events: {
      'keypress #query' : 'searchAll',
      'keydown'         : 'keyMapper',
      'keyup'           : 'setMaxVolume'
      //'click #login'         : 'login'
    },

    /*
    login: function(e) {
      new Model.Modal({ type: 'login' })
    },
    */

    searchAll: function(e) {
      if (e.keyCode == 13) {
        Router.navigate('/search/' + encodeURIComponent($('#query').val()), true)
        $('#query').val('').blur()
      }
    },

    setMaxVolume: function(e) {
      if ($(e.target).is('input, textarea')) {
        return
      }
      if (e.keyCode == 38 || e.keyCode == 40) {
        var value = Controls.$volume.slider('value')
        if (value) {
          Controls.lastMaxVolume = value
        } else {
          //Video.mute()
        }
      }
    },

    keyMapper: function(e) {
      if ($(e.target).is('input, textarea')) {
        return
      }
      
      var fn = KeyMapper['k' + e.keyCode]
      if (fn) {
        return fn(e)
      }

      /*
      switch (e.keyCode) {
        case 192: //ESCAPE
          Video.fullscreenDisable()
          return false
        case 8: // DELETE
          if (window.visiblePlaylist == window.lastSelected) {
            // TODO Replace confirm with modal dialog.
            if (confirm('Delete the playlist: ' + visiblePlaylist.get('name') + '?')) {
              visiblePlaylist.destroy({
                success: function(model, response) {
                  model.view.remove()
                  model.shortView.remove()
                  Router.navigate('/', true)
                }
              })
            } else {
              // Did not delete.
            }
          } else if (window.visiblePlaylist) {
            // TODO what if removed track is now playing
            var tracksToRemove = _.filter(visiblePlaylist.tracks(), function(track) {
              return $(track.view.el).hasClass('selected')
            })

            // Select next track to play
            var nextTrack = false,
                pauseNext = false
            if (window.NowPlayingTrack && $(NowPlayingTrack.view.el).hasClass('selected')) {
              if (Video.isNotPlaying) {
                pauseNext = true
              }
              nextTrack = NowPlayingTrack.nextUnselected()
              if (nextTrack == null) {
                Video.stop()
              }
            }

            if (tracksToRemove.length) {
              visiblePlaylist.remove(tracksToRemove)
            }

            if (nextTrack) {
              if (pauseNext) {
                Video.pauseNext()
              }
              nextTrack.play()
            }
          }
          return false
        case 65: // CTRL-A, META-A
          if (e.metaKey || e.ctrlKey) {
            // Rewrite to check Search vs. visiblePlaylist
            // This should use the mixin if possible
            var $el = $(Search.track.view.el),
                trackView = Search.track.view.collection.models[0].view,
                selector = trackView.tagName + '.' + trackView.className

            if ($el.find(selector + '.selected').length < $el.find(selector).length) {
              $el.find(selector).addClass('selected')
            } else {
              $el.find(selector).removeClass('selected')
            }
            return false
          }
          return
        case 77: // M
          if (this.keypressHasModifier(e)) return
          Controls.toggleMute(e)
          return false
        case 32: // SPACEBAR
          ($('#play').hasClass('pause')) ? window.Controls.pause() : window.Controls.play()
          return false
        case 37: // LEFT
          if (this.keypressHasModifier(e)) return
          window.Controls.prev()
          return false
        case 39: // RIGHT
          if (this.keypressHasModifier(e)) return
          window.Controls.next()
          return false
        case 38: // UP
          if (this.keypressHasModifier(e)) return
          Controls.$volume.slider('value', Controls.$volume.slider('value') + 5)
          return false
        case 40: // DOWN
          if (this.keypressHasModifier(e)) return
          Controls.$volume.slider('value', Controls.$volume.slider('value') - 5)
          return false
        case 70: // F
          if (this.keypressHasModifier(e)) return
          Video.toggleFullscreen()
          return false
        case 191: // /
          if (this.keypressHasModifier(e)) return
          Video.fullscreenOff()
          $('#query').focus()
          return false
      }
      */
    }
  })


  //
  // Main viewport -- this is where search results, playlists, now playing, and mostly everything else will display.
  //
  View.Main = Backbone.View.extend({
    el: '#main',

    template: {
      home          : _.template($('#home-template').html()),
      settings      : _.template($('#settings-template').html()),
      favorites     : _.template($('#favorites-template').html()),
      tagRadio      : _.template($('#tag-radio-template').html()),
      broadcasts    : _.template($('#broadcasts-template').html())
    },

    initialize: function() {
      // Auto-load more search results on scroll.
      $('#main-wrapper').bind('scroll', this.loadMore())
      this.render()
      this.delegateEvents()
    },

    loadMore: function() {
      return _.throttle(function() {
        if (Backbone.history.fragment.match(/^\/search\//) && ($('#main-wrapper').height() * 2) + $('#main-wrapper').scrollTop() > $('#main').height()) {
          Search.loadMore('track')
        }
      }, 300)
    },

    // target can be a model object or a string for a basic template
    render: function(target) {
      $(this.el).html('')

      if (typeof target == 'object') {
        visiblePlaylist = target
        $(this.el).html(target.view.render().el)
      } else {
        target = target || 'home'
        $(this.el).html(this.template[target])
      }

      Backbone && Backbone.history && $('#quickbar a[data-href="#' + Backbone.history.fragment + '"]').addClass('active')
      $('#main').show()
    }
  }),

  //
  // Quickbar viewport -- this is where now playing, settings, playlists, etc. are linked
  //
  View.Quickbar = Backbone.View.extend({
    el: '#quickbar',

    events: {
      'click #new-playlist': 'playlistCreate'
    },

    template: _.template($('#quickbar-template').html()),

    initialize: function() {
      _.bindAll(this, 'playlistCreate')
      this.render()
    },

    playlistCreate: function() {
      var playlist = new Model.Playlist()
      playlist.autosave = true

      playlist.save()
      Playlists.models.push(playlist)
      Playlists.reset(Playlists.models)
      Playlists.view.render()

      playlist.shortView.editEnable()
      Backbone.history.navigate('/local/playlists/' + playlist.get('id'), true)
    },

    render: function() {
      $(this.el).html(this.template())
      $('#quickbar').jScrollPane({ verticalGutter: -8, enableKeyboardNavigation: false })
      if (Playlists && Playlists.view) {
        Playlists.view.render()
      }
    }
  })

})

$(function() {
  // Bind resize and call it once.
  $(window).resize(_.debounce(windowResized))
  windowResized()

  // Global stuff.
  window.AppView    = new View.App()
  window.Video      = new Model.Video()
  window.Controls   = new View.Controls()
  window.Playlists  = new Collection.Playlists()

  // Set window.NowPlaying
  var playlist = new Model.Playlist()
  playlist.nowPlaying()

  window.MainView = new View.Main()
  window.QuickbarView = new View.Quickbar()
})