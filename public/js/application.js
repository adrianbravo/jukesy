AppRouter = Backbone.Router.extend({
  routes: {
    ''                     : 'welcome',
    'about'                : 'about',
    'terms-of-service'     : 'termsOfService',
    'privacy-policy'       : 'privacyPolicy',
    'user/:username'              : 'userView',
    'user/:username/edit'         : 'userEdit',
    'user/:username/playlist'     : 'playlists',
    'user/:username/playlist/:id' : 'playlist',
    'user/:username/reset/:token' : 'userReset',
    'artist/:artist/album/:album' : 'searchAlbum',
    'artist/:artist/track/:track' : 'searchTrack',
    'artist/:artist/top-tracks*q'   : 'searchArtistTopTracks',
    'artist/:artist/top-albums'     : 'searchArtistTopAlbums',
    'artist/:artist/similar'        : 'searchArtistSimilar',
    'artist/:artist'                : 'searchArtist',
    'search/:query/track*q' : 'searchQueryTrack',
    'search/:query/album'   : 'searchQueryAlbum',
    'search/:query/artist'  : 'searchQueryArtist',
    'search/:query'         : 'searchQuery',
    '*derp'         : '404'
  },

  initialize: function() {
    _.bindAll(this, 'error')
    this.first = true
    this.bind('all', this._trackPageview)
    Backbone.history.refresh = function() {
      var fragment = this.fragment
      this.navigate('', { trigger: false, replace: true })
      this.navigate(fragment, { trigger: true, replace: true })
    }
  },

  _trackPageview: function() {
    if (_gaq && !this.first) {
      _gaq.push(['_trackPageview', "/" + Backbone.history.getFragment() ])
    } else {
      delete this.first
    }
  },
  
  welcome: function() {
    MainView.render(WelcomeView)
  },

  about: function() {
    MainView.render('about')
  },
  
  privacyPolicy: function() {
    MainView.render('privacyPolicy')
  },
  
  termsOfService: function() {
    MainView.render('termsOfService')
  },
  
  playlists: function(username) {
    if (username == 'anonymous' || (Session.user && Session.user.get('username') == username)) {
      MainView.render(Playlists.view)
    } else {
      var playlists = new Collection.Playlists()
      playlists.user = username
      playlists.fetch({
        success: function(collection, response) {
          MainView.render(playlists.view)
        },
        error: this.error
      })
    }
  },
  
  // TODO clean this up good god
  playlist: function(username, id) {
    var playlist = (username == 'anonymous') ? Playlists.getByCid(id) : Playlists.get(id)
      , autoplay = Backbone.history.fragment.match(/\?autoplay/)
    
    if (!playlist) {
      if (username == 'anonymous') {
        Router.navigate('/', { trigger: true, replace: true })
        return
      }
      playlist = new Model.Playlist({ user: username, _id: id })
      if (Session.user && Session.user.get('username') == username) {
        Playlists.add(playlist)
      }
    }

    //console.log('playlist models, if length is 0 do fetch', playlist.tracks.models)
    if (!playlist.isNew() && !playlist.tracks.models.length && !playlist.get('changed')) {
      playlist.fetch({
        success: function(model, response) {
          playlist.tracks.reset(response.tracks)
          playlist.set({ changed: false }, { silent: true })
          MainView.render(playlist.view)
          if (autoplay) {
            playlist.setNowPlaying()
            window.autoplay = playlist
            playlist.tracks.play()
          }
        },
        error: this.error
      })
    } else {
      MainView.render(playlist.view)
    }
  },
    
  userReset: function(username, token) {
    var user = new Model.User({ username: username, token: token })
    user.viewReset = new View.UserReset({ model: user })
    user.viewReset.render()
    Router.navigate('/', { trigger: true, replace: true })
    user.viewReset.check()
  },
  
  userView: function(username) {
    var user
    if (Session.user && Session.user.get('username') == username) {
      user = Session.user
    } else {
      // TODO fix usage of id, this is a hack to force isNew() to return false
      user = new Model.User({ username: username, _id: 1 })
    }
    
    user.fetch({
      success: function(model, response) {
        MainView.render(user.view)
      },
      error: this.error
    })
  },
  
  userEdit: function(username) {
    if (!Session.user || Session.user.get('username') != username) {
      MainView.render('404')
      return
    }
    
    Session.user.fetch({
      success: function(model, response) {
        MainView.render(model.viewEdit)
      },
      error: this.error
    })
  },
  
  searchArtist: function(artist) {
    MainView.render(new View.SearchArtist({ artist: decodeURIComponent(artist) }))
  },
  
  searchArtistTopTracks: function(artist) {
    MainView.render(new View.SearchArtistTopTracks({ artist: decodeURIComponent(artist) }))
  },
  
  searchArtistTopAlbums: function(artist) {
    MainView.render(new View.SearchArtistTopAlbums({ artist: decodeURIComponent(artist) }))
  },
  
  searchArtistSimilar: function(artist) {
    MainView.render(new View.SearchArtistSimilar({ artist: decodeURIComponent(artist) }))
  },
  
  searchAlbum: function(artist, album) {
    album = _.trimQuery(album)
    MainView.render(new View.SearchAlbum({ artist: decodeURIComponent(artist), album: decodeURIComponent(album) }))
  },
  
  searchTrack: function(artist, track) {
    track = _.trimQuery(track)
    MainView.render(new View.SearchTrack({ artist: decodeURIComponent(artist), track: decodeURIComponent(track) }))
  },
  
  searchQuery: function(query) {
    MainView.render(new View.SearchQuery({ query: decodeURIComponent(query) }))
  },
  
  searchQueryTrack: function(query) {
    MainView.render(new View.SearchQueryTrack({ query: decodeURIComponent(query) }))
  },
  
  searchQueryAlbum: function(query) {
    MainView.render(new View.SearchQueryAlbum({ query: decodeURIComponent(query) }))
  },
  
  searchQueryArtist: function(query) {
    MainView.render(new View.SearchQueryArtist({ query: decodeURIComponent(query) }))
  },

  error: function(model, response) {
    MainView.render((response && response.status == 404) ? '404' : '500')
  },
  
  404: function() {
    MainView.render('404')
  }
})

View.Main = Backbone.View.extend({
  el: $('#main'),

  templates: {
    about          : jade.compile($('#about-template').text()),
    termsOfService : jade.compile($('#terms-of-service-template').text()),
    privacyPolicy  : jade.compile($('#privacy-policy-template').text()),
    401   : jade.compile($('#401-template').text()),
    404   : jade.compile($('#404-template').text()),
    500   : jade.compile($('#500-template').text())
  },

  initialize: function() {
    _.bindAll(this, 'render')
  },

  render: function(template) {
    Controls.fullscreenDisable()
    if (_.isString(template)) {
      this.$el.html(this.templates[template]({ currentUser: Session.userJSON() }))
    } else if (_.isObject(template)) {
      this.$el.html(template.render().$el)
      template.delegateEvents()
    }
    if (template != WelcomeView) {
      _.defer(function() {
        $body.scrollTop(MainView.$el.position().top - 15)
      })
    }
    SidebarView.render()
  }
})

View.Sidebar = Backbone.View.extend({
  el: $('#sidebar'),
  
  template: jade.compile($('#sidebar-template').text()),
  
  events: {
    'click .create-new-playlist': 'createPlaylist'
  },
  
  initialize: function() {
    Playlists.on('add', this.render, this)
    Playlists.on('remove', this.render, this)
  },
  
  createPlaylist: function() {
    var playlist = new Model.Playlist()
    Playlists.add([ playlist ])
    playlist.navigateTo()
    return false
  },
  
  render: function() {
    this.$el.html(this.template({
      nowPlayingUrl: (window.NowPlaying && NowPlaying.localUrl()) || '',
      currentUser: Session.userJSON(),
      unsavedPlaylist: window.NowPlaying && NowPlaying.isNew() && NowPlaying.get('sidebar') ? NowPlaying.toJSON() : undefined,
      playlists: _.chain(Playlists.models)
                    .filter(function(playlist) { return playlist.get('sidebar') })
                    .sortBy(function(playlist) {
                      return [
                        playlist.isNew(),
                        playlist.get('name').toLowerCase(),
                        playlist.get('time') && playlist.get('time').created
                      ]
                    })
                    .map(function(playlist) { return playlist.toJSON() })
                    .value()
    }))
  }
})

$(function() {
  // Bind resize and call it once.
  $(window).resize(_.debounce(windowResized))
  windowResized()
  
  window.$body = $('body')
  window.Playlists = new Collection.Playlists
  window.CurrentSearch = {}
  
  window.KeyboardShortcutsView = new View.KeyboardShortcuts
  window.MainView = new View.Main
  window.Session = new Model.Session
  window.ModalView = new View.Modal
  window.SidebarView = new View.Sidebar
  window.WelcomeView = new View.Welcome
  window.Video = new Model.Video
  window.Meow = new View.Meow

  newNowPlaying()
  window.Radio = new Model.Radio
  window.Shuffle = new Model.Shuffle
  window.loginModal = new View.SessionCreate({ model: Session })
  window.signupModal = new View.UserCreate()
  window.forgotModal = new View.UserForgot()

  // hijack links
  // https://github.com/documentcloud/backbone/issues/456#issuecomment-2557835
  window.document.addEventListener('click', function(e) {
    e = e || window.event
    var $target = $(e.target || e.srcElement)
    
    if (!$target.is('a')) {
      $target = $target.parents('a')
    }
    
    if ($target.is('a') && !$target.hasClass('ll')) { // literal link
      var uri = $target.attr('href')
      if (uri) {
        e.preventDefault()
        Router.navigate(uri.substr(1), true)
      }
    }
  })
  /*
  window.addEventListener('popstate', function(e) {
    Router.navigate(location.pathname.substr(1), true)
  })
  */

  $body.addClass('in') // fade in

  window.Router = new AppRouter
})


;
