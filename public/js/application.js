$(function() {


  //
  // Local routes (single-page app style, motherfucker)
  //
  AppRouter = Backbone.Router.extend({
    initialize: function() {
      this.bind('appview', Video.fullscreenOff)
      this.bind('appview', this.hideViews)
    },

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

    hideViews: function() {
      $('#main').hide()
    },

    home: function() {
      this.trigger('appview')
      MainView.render(NowPlaying)
      $('#main').show()
    },

    settings: function() {
      this.trigger('appview')
      MainView.render('settings')
      $('#main').show()
    },

    favorites: function() {
      this.trigger('appview')
      MainView.render('favorites')
      $('#main').show()
    },

    tagRadio: function() {
      this.trigger('appview')
      MainView.render('tagRadio')
      $('#main').show()
    },

    broadcasts: function() {
      this.trigger('appview')
      MainView.render('broadcasts')
      $('#main').show()
    },

    playlistView: function(id) {
      this.trigger('appview')
      MainView.render(Playlists.get(id))
      $('#main').show()
    },

    searchAll: function(query) {
      console.log('search query', query)
      query = decodeURIComponent(query)
      window.Search = new Model.Search({ query: query })

      this.trigger('appview')
      MainView.render(Search)
      $('#main').show()
    }
  })


  //
  // Used primarily app-wide key bindings.
  //
  View.App = Backbone.View.extend({
    el: $(document),

    events: {
      'keypress #query'      : 'searchAll',
      'keydown'              : 'keyMapper',
      'keyup'                : 'setMaxVolume'
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

    // The event lacks keyboard modifiers (ctrl, alt, shift, meta)
    keypressHasModifier: function(e) {
      return (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) ? true : false
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
      switch (e.keyCode) {
        case 65: // CTRL-A, META-A
          if (e.metaKey || e.ctrlKey) {
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
      if (target && target.view)
        console.log('render target', target, target.view, target.view.render())
      window.lastSelected = null
      if (typeof target == 'object') {
        $(this.el).html(target.view.render())
      } else {
        target = target || 'home'
        $(this.el).html(this.template[target])
      }

      if (Backbone && Backbone.history) {
        $('#quickbar a').removeClass('active')
        $('#quickbar a[data-href="#' + Backbone.history.fragment + '"]').addClass('active')
      }
    }
  })


})

$(function() {
  // Set up jscrollpane in the quickbar
  $('#quickbar').jScrollPane({ verticalGutter: -8, enableKeyboardNavigation: false })

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
  playlist.play()
  //window.NowPlaying = new Model.NowPlaying()

  Playlists.fetch()
  PlaylistsView = new View.Playlists({ quickbar: true })

  window.MainView = new View.Main()
})

