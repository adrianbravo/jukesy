Model.Playlist = Backbone.Model.extend({
  
  defaults: {
    name: 'Untitled Playlist',
    user: 'anonymous',
    sidebar: true
  },
  
  initialize: function() {
    _.bindAll(this, 'setNowPlaying', 'changeCallback', 'syncMeow', 'incrementUntitled')
    
    this.view = new View.Playlist({ model: this })
    this.destroyView = new View.PlaylistDestroy({ model: this })

    if (this.isNew()) {
      this.tracks = []
      this.setTracks({ silent: true })
    }
    
    this.on('change:name change:sidebar', SidebarView.render, SidebarView)
    this.on('change', this.changeCallback, this)
    this.on('sync', this.syncMeow, this)
    this.on('destroy', this.destroyCallback, this)
    
    this.tracksModifiedCount = 0 // counter for internal modifications to tracks
    
    if (this.get('user') == 'anonymous') {
      _.defer(this.incrementUntitled)
    }
  },
  
  urlRoot: function() {
    var user = this.get('user')
    if (user == 'anonymous') {
      user = Session.user && Session.user.get('username')
    }
    return user ? '/user/' + user + '/playlist' : false
  },

  url: function() {
    var url = this.urlRoot()
    if (!this.isNew()) {
      url += '/' + this.id
    }
    return url
  },
  
  navigateTo: function() {
    Router.navigate(this.toJSON().url, { trigger: true })
  },
  
  toJSON: function() {
    return _.extend(_.clone(this.attributes), {
      url    : '/user/' + this.get('user') + '/playlist/' + (this.id || this.cid),
      active : this.view.$el.is(':visible')
    })
  },
  
  syncMeow: function(method) {
    switch(method) {
      case 'save':
        Meow.render({
          message: 'Saved playlist: ' + this.get('name'),
          type: 'success'
        })
        return
      case 'delete':
        Meow.render({
          message: 'Deleted playlist: ' + this.get('name'),
          type: 'danger'
        })
        return
    }
  },
  
  changeCallback: function() {
    this.set({ changed: true }, { silent: true })
  },
  
  destroyCallback: function() {
    if (this.nowPlaying) {
      newNowPlaying()
    }
    if (this.view.$el.is(':visible')) {
      Router.navigate('/', { trigger: true, replace: true })
    }
  },
  
  addTracks: function(tracks, position) {
    var self = this
      , message = 'Added ' + tracks.length + ' ' + _.plural(tracks.length, 'track', 'tracks') + ' to ' + this.get('name') + '.'
      
    if (_.isUndefined(position)) {
      position = this.tracks.length
    }
    _.each(tracks, function(track) {
      self.tracks.splice(position++, 0, track)
      track.playlist = self
    })
    this.setTracks()
    this.tracksModifiedCount++
    Meow.render({
      message: message,
      type: 'primary'
    })
  },
  
  removeTracks: function(tracks) {
    var self = this
      , position
      , message = 'Removed ' + tracks.length + ' ' + _.plural(tracks.length, 'track', 'tracks') + ' from ' + this.get('name') + '.'
    
    _.each(tracks, function(track) {
      if (track == Video.track) {
        if (self.tracks.length == 1) {
          Video.stop()
        } else {
          Video.next()
        }
      }
      self.tracks.splice(_.indexOf(self.tracks, track), 1)
    })
    this.setTracks()
    this.tracksModifiedCount++
    Meow.render({
      message: message,
      type: 'primary'
    })
    self.view.render()
  },
  
  moveTracks: function(tracks, position) {
    // will move tracks in tracks from their current positions to the new position, in their order
    // ( tracks = [0, 1, 2, 3, 4, 5], moveTracks([1, 3, 4], 0) => tracks = [1, 3, 4, 0, 2, 5])
    // this.tracksModifiedCount++
  },
  
  setNowPlaying: function() {
    if (window.NowPlaying) {
      NowPlaying.set({ nowPlaying: false }, { silent: true })
      NowPlaying.nowPlaying = false
      if (NowPlaying.isNew() && NowPlaying.tracksModifiedCount <= 1) {
        NowPlaying.destroy()
      }
    }
    window.NowPlaying = this
    NowPlaying.set({ nowPlaying: true }, { silent: true })
    this.nowPlaying = true
    
    if (Video.player) {
      Video.stop()
    }
    
    SidebarView.render()
    return this
  },
  
  cloneResults: function() {
    return _(this.tracks).chain()
      .map(function(track) {
        return new Model.Track(track.toJSON())
      })
      .value()
  },
  
  setTracks: function(options) {
    this.set({
      tracks: this.tracks,
      tracks_count: this.tracks.length
    }, options)
  },
  
  isEditable: function() {
    return (this.isNew() || (Session.user && Session.user.get('username') == this.get('user')))
  },
  
  incrementUntitled: function() {
    var self = this
      , name = base = 'Untitled Playlist'
      , count = 0
      , names = _.chain(Playlists.models)
                    .filter(function(playlist) { return playlist.get('user') == 'anonymous' && self.cid != playlist.cid })
                    .map(function(playlist) { return playlist.get('name') })
                    .value()
    
    while (count <= names.length) {
      if (count) {
        name = base + ' ' + count
      }
    
      if (_.indexOf(names, name) == -1) {
        this.set({ name: name }, { silent: true })
        this.view.render()
        SidebarView.render()
        return
      }
      count++   
    }
  }
  
})

View.PlaylistDestroy = Backbone.View.extend({
  className: 'playlist-destroy modal',
  
  template: jade.compile($('#playlist-destroy-template').text()),
  
  events: {
    'click .destroy-confirm' : 'destroy',
    'click .go-back'         : 'close'
  },
  
  initialize: function() {
    _.bindAll(this, 'close', 'destroy')
  },
  
  close: function() {
    this.$el.modal('hide')
  },
  
  destroy: function() {
    if (this.renderOptions.confirm) {
      this.renderOptions.confirm()
    }
    this.close()
  },

  render: function(options) {
    this.renderOptions = options || {}
    
    this.$el.modal({
      backdrop: 'static',
      keyboard: false
    })
    this.$el.html(this.template({ playlist: this.model.toJSON() }))
    this.delegateEvents()
    return this
  }
})

View.Playlist = Backbone.View.extend({
  className: 'playlist',
  
  template: jade.compile($('#playlist-show-template').text()),

  events: {
    'click .playlist-name.edit' : 'toggleNameEdit',
    'click .playlist-save'      : 'save',
    'click .playlist-sidebar'   : 'toggleSidebar',
    'click .playlist-delete'    : 'delete',
    'click .play-all'       : 'playAll',
    'click .queue-all-next' : 'queueNext',
    'click .queue-all-last' : 'queueLast',
    'blur .playlist-name-edit'     : 'validateName',
    'keypress .playlist-name-edit' : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'keyDown', 'saveSuccess', 'saveError', 'save', 'deleteConfirm', 'deleteSuccess', 'deleteError', 'delete', 'focusNameEdit', 'playAll')
  },

  render: function(options) {
    if (!this.model.isNew() && !this.model.tracks) {
      this.$el.html('Loading...')
      return this
    }
    
    var self = this
    options = options || {}
    
    this.model.setTracks({ silent: true })
    
    this.$el.html(this.template({
      currentUser: Session.userJSON(),
      playlist: this.model.toJSON(),
      nowPlaying: this.model.nowPlaying,
      editName: options.editName
    }))

    _.each(this.model.get('tracks'), function(track) {
      self.$el.find('tbody').append(track.view.render().$el)
    })
    if (this.model.isEditable()) {
      this.$el.find('.playlist-name').addClass('edit')
    }
    
    return this
  },
  
  playAll: function() {
    this.model.setNowPlaying()
    if (this.model.tracks[0]) {
      this.model.tracks[0].play()
    }
  },
  
  queueNext: function() {
    NowPlaying.addTracks(this.model.cloneResults(), Video.track ? _.indexOf(NowPlaying.tracks, Video.track) + 1 : 0)
  },
  
  queueLast: function() {
    NowPlaying.addTracks(this.model.cloneResults())
  },
  
  toggleSidebar: function() {
    this.model.set({ sidebar: !this.model.get('sidebar') })
    this.render()
  },
  
  saveSuccess: function(playlist, response) {
    this.model.trigger('sync', 'save')
    this.model.set({ changed: false }, { silent: true })
    if (!Playlists.get(this.model.id)) {
      Playlists.add([ this.model ])
    }
    this.render()
  },
  
  // TODO dry (reused from view form mixins)
  saveError: function(model, error) {
    var $alert, errorJSON
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {
      errorJSON = {}
    }
    
    $alert = new View.Alert({
      className: 'alert-error alert',
      message: (error.status == 401 && !errorJSON.errors) ? parseError('unauthorized') : 'Something went wrong while trying to save this playlist.'
    })
    this.render().$el.prepend($alert.render())
  },

  save: function() {
    if (!Session.user) {
      loginModal.render().addAlert('not_logged_in_save')
      ModalView.setCallback(this.save)
      return
    }
    this.model.save({}, {
      success: this.saveSuccess,
      error: this.saveError
    })
  },

  deleteSuccess: function(playlist, response) {
    this.model.trigger('sync', 'delete')
  },
  
  deleteError: function(model, error) {
    var $alert, errorJSON
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {
      errorJSON = {}
    }
    
    if (error.status == 401 && !errorJSON.errors) {
      $alert = new View.Alert({
        className: 'alert-error alert',
        message: parseError('unauthorized')
      })
    } else {
      $alert = new View.Alert({
        className: 'alert-error alert',
        message: 'Something went wrong while trying to delete this playlist.'
      })
    }
    this.render().$el.prepend($alert.render())
  },
  
  deleteConfirm: function() {
    this.delete(null, true)
  },
  
  delete: function(e, confirmed) {
    if (!Session.user && !this.model.isNew()) {
      loginModal.render().addAlert('not_logged_in_destroy')
      ModalView.setCallback(this.delete)
      return
    }
    
    if (!this.model.isNew() && !confirmed) {
      this.model.destroyView.render({
        confirm: this.deleteConfirm
      })
      return
    }
    
    this.model.destroy({
      success: this.deleteSuccess,
      error: this.deleteError
    })
  },
  
  keyDown: function(event) {
    if (event.keyCode == 13) {
      this.$el.find('.playlist-name-edit').blur()
    }   
  },
  
  toggleNameEdit: function() {
    this.render({ editName: true })
    _.defer(this.focusNameEdit)
  },
  
  focusNameEdit: function() {
    this.$el.find('.playlist-name-edit').focus()
  },
  
  validateName: function() {
    var val = this.$el.find('.playlist-name-edit').val().trim()
    if (val && this.model.get('name') != val) {
      this.model.set({ name: val })
    }
    this.render()
  }
  
})

View.Playlists = Backbone.View.extend({
  template: jade.compile($('#playlist-index-template').text()),
  
  className: 'playlists',
  
  render: function(options) {
    if (!this.collection.models) {
      this.$el.html('Loading...')
      return this
    }
    
    this.$el.html(this.template({
      playlists: _.chain(Playlists.models)
                    .sortBy(function(playlist) {
                      return [
                        playlist.isNew(),
                        playlist.get('name').toLowerCase(),
                        playlist.get('time') && playlist.get('time').created
                      ]
                    })
                    .map(function(playlist) { return playlist.toJSON() })
                    .value(),
      user: this.collection.user
    }))
    return this
  }
})

Collection.Playlists = Backbone.Collection.extend({
  model: Model.Playlist,
  url: function() {
    return '/user/' + this.user + '/playlist'
  },
  
  initialize: function() {
    this.view = new View.Playlists({ collection: this })
    
    this.on('add', this.view.render, this.view)
    this.on('remove', this.view.render, this.view)
    this.on('add', this.sidebarRender, this)
    this.on('remove', this.sidebarRender, this)
  },
  
  sidebarRender: function() {
    if (window.SidebarView) {
      SidebarView.render()
    }
  }
})


;