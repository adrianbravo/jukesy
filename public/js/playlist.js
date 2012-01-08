$(function() {


  //
  // Displays a list of playlists for the #quickbar
  //
  View.Playlists = Backbone.View.extend({
    el: $('#main'),

    template: _.template($('#playlists-template').html()),

    initialize: function() {
      if (this.options.quickbar) {
        this.el = $('#my-playlists')
      }
      this.render()
    },

    render: function() {
      var self = this

      $('#quickbar a').removeClass('active')

      this.el.html(this.template({
        empty: _.isEmpty(Playlists.models),
        quick: this.options.quickbar
      }))

      _.each(Playlists.models, function(playlist) {
        var view = new View.PlaylistShort({ model: playlist })
        self.el.find('.playlists ul').append(view.render().el)
      })

      if (this.options.quickbar) {
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
    },

    tracks: function() {
      return this.get('tracks').models
    },

    play: function() {
      var self = this

      // TODO if nowplaying is new, delete now playing...
      NowPlaying = self
      self.buildTrackViews(self.tracks())
      //self.view = new View.NowPlaying({ model: self.playlist })

       // TODO pseudostop
      if (Video.player) {
        Video.pause()
      }
      if (self.tracks()[0]) {
        self.tracks()[0].play()
      }
    },

    // TODO optimize, verify old track.view makes it to garbage collection?
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

    add: function(tracks, options) {
      var self = this

      self.get('tracks').add(tracks)
      self.buildTrackViews(tracks)

      if ($(self.view.el).is('#main')) {
        self.view.render()
      }

      if (self === window.NowPlaying && !_.isUndefined(window.NowPlayingTrack) && _.include(['play', 'next'], options.method)) {
        if (options.method == 'play') {
          tracks[0].play()
        }
      } else {
        tracks[0].play()
      }
    },

    // Remove a track from the model.
    remove: function(model) {
      this.change()
      this.tracks() = _.without(this.tracks(), model)
      model.view.remove()
      model.destroy()
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
    el: $('#main'),

    template: {
      playlist        : _.template($('#playlist-template').html()),
      playlistEmpty   : _.template($('#playlist-empty-template').html()),
      nowPlayingEmpty : _.template($('#now-playing-empty-template').html())
    },

    render: function() {
      var self = this
      if (self.model.tracks().length > 0) {
        self.el.html(self.template.playlist(self.model.toJSON()))
        _.each(self.model.tracks(), function(track) {
          var el = track.view.render().el
          $(el).removeClass('selected').removeClass('playing')
          self.el.find('tbody').append(track.view.render().el)
        })
      } else if (self == NowPlaying.view) {
        self.el.html(self.template.nowPlayingEmpty)
      } else {
        self.el.html(self.template.playlistEmpty())
      }
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

    template: _.template($('#playlist-short-template').html()),

    initialize: function() {
      _.bindAll(this, 'render')
      this.model.shortView = this
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()))
      return this
    }
  })


  //
  // A collection of playlists (which are also collections, ho ho ho)
  //
  Collection.Playlists = Backbone.Collection.extend({
    model: Model.Playlist,
    localStorage: new Store('Playlists')
  })


})


