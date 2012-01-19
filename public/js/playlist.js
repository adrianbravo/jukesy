$(function() {


  //
  // Displays a list of playlists for the #quickbar
  //
  View.Playlists = Backbone.View.extend({
    el: $('#main'),

    template: Handlebars.compile($('#playlists-template').html()),

    initialize: function() {
      if (this.options.quickbar) {
        this.el = $('#my-playlists')
      }
      this.render()
    },

    render: function() {
      var self = this

      $('#quickbar a').removeClass('active')
      self.el.html(self.template({
        empty: _.isEmpty(Playlists.models),
        quick: self.options.quickbar
      }))

      _.each(Playlists.models, function(playlist) {
        self.el.find('.playlists ul').append(playlist.shortView.render().el)
      })

      if (self.options.quickbar) {
        windowResized()
      }
    }
  })


  //
  // Basic playlist model
  //
  Model.Playlist = Backbone.Model.extend({
    localStorage: new Store('Playlists'),

    defaults: {
      name: 'New Playlist'
    },

    initialize: function() {
      var self = this
      if (!self.isNew()) {
        self.autosave = true
      }
      _.bindAll(self, 'remove', 'sortByDOM', 'saveLocally')

      // Loads tracks collection or converts its json to a new collection, silently.
      self.set({ tracks: new Collection.Tracks(self.get('tracks') || []) }, { silent: true })
      self.bind('change', self.saveLocally)
      self.bind('change', self.renderIfVisible)

      self.oldToJSON = self.toJSON
      self.toJSON = function() {
        var json = self.oldToJSON()
        json.tracks = self.get('tracks').toJSON()
        return json
      }

      _.each(self.tracks(), function(track) {
        track.playlist = self
      })

      self.buildTrackViews(self.tracks())
      self.view = new View.Playlist({ model: self })
      self.shortView = new View.PlaylistShort({ model: self })
    },

    tracks: function() {
      return this.get('tracks').models
    },

    nowPlaying: function() {
      NowPlaying = this
      // TODO pseudostop
      if (Video.player) {
        Video.pause()
      }
    },

    buildTrackViews: function(tracks) {
      _.each(tracks, function(track) {
        track.view = new View.Track({ model: track })
      })
    },

    saveLocally: function() {
      if (this.localStorage && this.autosave) {
        this.save()
        this.shortView.render()
      }
      // TODO handle saving remotely
    },
    
    renderIfVisible: function() {
      if ($(this.view.el).is(':visible')) {
        this.view.render()
      }
    },

    add: function(tracks, options) {
      var self = this
      
      if (options.method == 'next') {
        var index = 0
        if (window.NowPlayingTrack) {
          index = _.indexOf(this.tracks(), NowPlayingTrack) + 1
        }
        this.get('tracks').add(tracks.reverse(), { at: index })
      } else {
        this.get('tracks').add(tracks)
      }
      
      this.buildTrackViews(tracks)
      
      if (options.method == 'play') {
        tracks[0].play()
      }

      _.defer(function() {
        if (self === window.NowPlaying && !window.NowPlayingTrack) {
          tracks[0].play()
        }
      })
      
      this.change();
    },

    // Remove a track from the model.
    remove: function(tracks) {
      this.get('tracks').remove(tracks)
      _.each(tracks, function(track) {
        track.view.remove()
      })
      this.change()
    },

    sortByDOM: function() {
      this.get('tracks').models = _.sortBy(this.tracks(), function(track) {
        return _.indexOf($(track.view.el).parent().children(track.view.tagName), track.view.el)
      })
      this.change()
    }
  })



  //
  // Regular playlist view, includes tracks
  //
  View.Playlist = Backbone.View.extend({
    template: {
      playlist        : Handlebars.compile($('#playlist-template').html()),
      playlistEmpty   : Handlebars.compile($('#playlist-empty-template').html()),
      nowPlayingEmpty : Handlebars.compile($('#now-playing-empty-template').html())
    },

    render: function() {
      var self = this
      if (self.model.tracks().length > 0) {
        $(self.el).html(self.template.playlist(self.model.toJSON()))
        _.each(self.model.tracks(), function(track) {
          var el = track.view.render().el
          $(el).removeClass('selected').removeClass('playing')
          $(self.el).find('tbody').append(el)
        })
      } else if (Backbone.history.fragment == '/') {
        $(self.el).html(self.template.nowPlayingEmpty(self.model.toJSON()))
      } else {
        $(self.el).html(self.template.playlistEmpty(self.model.toJSON()))
      }
      return self
    }
  })


  //View.PlaylistTrack = View.Track.extend({
  //})


  //
  // Short playlist view
  // TODO combine with regular playlist and separate template.
  //
  View.PlaylistShort = Backbone.View.extend({
    tagName: 'li',

    template: Handlebars.compile($('#playlist-short-template').html()),
    editTemplate: Handlebars.compile($('#playlist-short-edit-template').html()),

    events: {
      'dblclick'       : 'nowPlaying',
      'click'          : 'setLastSelected',
      'click .active'  : 'editEnable',
      'keypress input' : 'rename'
    },
    
    initialize: function() {
      _.bindAll(this, 'render', 'setLastSelected', 'editEnable', 'editDisable', 'nowPlaying')
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()))
      if (this.model == window.visiblePlaylist) {
        $(this.el).find('a').addClass('active')
      }
      this.delegateEvents()
      return this
    },

    setLastSelected: function() {
      var self = this
      _.defer(function() { lastSelected = self.model })
    },

    nowPlaying: function() {
      this.suppressEdit = true
      this.model.nowPlaying()
      var track = _.first(this.model.tracks())
      if (track) {
        track.play()
      }
    },

    editEnable: function() {
      var self = this
      _.defer(function() {
        if (self.suppressEdit) {
          self.suppressEdit = false
          return false
        }

        $(self.el)
          .html(self.editTemplate(self.model.toJSON()))
          .find('input')
          .focus()
          .blur(self.editDisable)
      })
    },
    
    editDisable: function() {
      this.render()
      $(this.el).find('a').addClass('active')
    },
    
    rename: function(e) {
      if (e.keyCode === 13) {
        this.model.set({ name: $(this.el).find('input').val() })
        this.editDisable()
      }
    }
  })


  //
  // A collection of playlists (which are also collections, ho ho ho)
  //
  Collection.Playlists = Backbone.Collection.extend({
    model: Model.Playlist,
    localStorage: new Store('Playlists'),
    initialize: function() {
      var self = this
      _.defer(function() {
        self.fetch()
        self.view = new View.Playlists({ quickbar: true })
      })
    }
  })


})


