Model.Playlist = Backbone.Model.extend({
  
  defaults: {
    name: 'Untitled Playlist',
    user: 'anonymous',
    sidebar: true,
    tracks_count: 0
  },
  
  initialize: function() {
    _.bindAll(this, 'setNowPlaying', 'unsetNowPlaying', 'syncCallback', 'destroyCallback', 'changeCallback', 'incrementUntitled')
    
    this.view = new View.Playlist({ model: this })
    this.destroyView = new View.PlaylistDestroy({ model: this })

    this.initializeTracks()
    this.on('sync', this.syncCallback)
    this.on('destroy', this.destroyCallback)
    this.on('change:name change:sidebar', this.changeCallback)
    _.defer(this.incrementUntitled)
  },
  
  initializeTracks: function() {
    this.tracks = new Collection.Tracks
    this.tracks.playlist = this
    this.tracks.on('remove', this.trackRemoveCallback)
    this.tracks.on('add remove', this.changeCallback)
    this.tracks.on('add remove', _.debounce(this.tracksCallback, 100), this)
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
  
  localUrl: function() {
    return '/user/' + this.get('user') + '/playlist/' + (this.id || this.cid)
  },
  
  toJSON: function() {
    return _.extend(_.clone(this.attributes), {
      url    : this.localUrl(),
      active : this.view.$el.is(':visible')
    })
  },
  
  navigateTo: function(replace) {
    Router.navigate(this.localUrl(), { trigger: true, replace: replace })
  },
  
  tracksCallback: function() {
    var change = this.tracks.models.length - this.get('tracks_count')
      , message
    
    this.set({ tracks_count: this.tracks.models.length })
    this.view.render()
    
    if (change > 0) {
      message = 'Added ' + change + ' ' + _.plural(change, 'track', 'tracks') + ' to ' + this.get('name')
    } else {
      message = 'Removed ' + Math.abs(change) + ' ' + _.plural(change, 'track', 'tracks') + ' from ' + this.get('name')
    }
    Meow.render({
      message: message,
      type: 'default'
    })
  },
  
  trackRemoveCallback: function(track, playlist, options) {
    var index, trackPrev
    track.view.remove()
    
    if (track == Video.track) {
      if (Shuffle.get('active')) {
        index = Shuffle.history.indexOf(track)
        trackPrev = Shuffle.history.at(index - 1)
        Shuffle.history.reset(Shuffle.history.first(index))
      } else {
        index = options.index || 0
        trackPrev = NowPlaying.tracks.at(index)
      }
      
      if (!trackPrev && !NowPlaying.tracks.length) {
        Video.stop()
      } else if (!trackPrev) {
        NowPlaying.tracks.play()
      } else {
        trackPrev.play()
        NowPlaying.tracks.next()
      }
    } else {
      Shuffle.history.remove(track)
    }
  },
  
  syncCallback: function(playlist, response, options) {
    if (options.changes && options.changes._id) {
      Router.navigate(this.localUrl(), { trigger: true, replace: true })
    }
    
    this.set({ changed: false }, { silent: true })
    this.view.render()
    
    if (_.isObject(response)) {
      Meow.render({
        message: 'Saved playlist - ' + this.get('name'),
        type: 'success'
      })
    }
  },
  
  destroyCallback: function(playlist, playlists, options) {
    if (this.get('nowPlaying')) {
      this.unsetNowPlaying()
    }
    if (this.view.$el.is(':visible')) {
      Router.navigate('/', { trigger: true, replace: true })
    }
    
    if (!this.isNew()) {
      Meow.render({
        message: 'Deleted playlist - ' + this.get('name'),
        type: 'danger'
      })
    }
  },
  
  changeCallback: function() {
    this.set({ changed: true }, { silent: true })
  },
  
  setNowPlaying: function() {
    if (window.NowPlaying) {
      NowPlaying.unsetNowPlaying()
    }
    window.NowPlaying = this
    NowPlaying.set({ nowPlaying: true }, { silent: true })
    this.view.render()
    if (window.Shuffle && Shuffle.get('active')) {
      Shuffle.enable()
    }
    return this
  },
  
  unsetNowPlaying: function() {
    this.set({ nowPlaying: false }, { silent: true })
    if (NowPlaying.isNew() && !NowPlaying.tracks.models.length) {
      NowPlaying.destroy()
    }
    if (Video.player) {
      Video.stop()
    }
    return this
  },
  
  cloneTracks: function() {
    return _.map(this.tracks.models, function(trackModel) { return trackModel.clone().toJSON() })
  },
    
  isEditable: function() {
    return (this.isNew() || (Session.user && Session.user.get('username') == this.get('user')))
  },
  
  incrementUntitled: function() {
    var self = this
      , name = base = 'Untitled Playlist'
      , count = 0
      , names
      
      if (this.get('user') != 'anonymous') {
        return
      }
      
      names = _.chain(Playlists.models)
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
    _.bindAll(this, 'keyDown', 'saveError', 'save', 'deleteConfirm', 'deleteError', 'delete', 'focusNameEdit', 'playAll')
  },

  render: function(options) {
    var self = this
      , $tracks
    
    options = options || {}
    
    this.$el.html(this.template({
      currentUser: Session.userJSON(),
      playlist: this.model.toJSON(),
      editName: options.editName
    }))
    $tracks = this.$el.find('table tbody')
    
    this.model.tracks.each(function(track) {
      $tracks.append(track.view.$el)
      track.view.delegateEvents()
    })
    
    if (this.model.isEditable()) {
      this.$el.find('.playlist-name').addClass('edit')
    }
    
    SidebarView.render()
    return this
  },
  
  playAll: function() {
    this.model.setNowPlaying()
    this.model.tracks.play()
  },
  
  queueNext: function() {
    NowPlaying.tracks.add(this.model.cloneTracks(), { at: _.indexOf(NowPlaying.tracks.models, Video.track) + 1 })
  },
  
  queueLast: function() {
    NowPlaying.tracks.add(this.model.cloneTracks())
  },
  
  toggleSidebar: function() {
    this.model.set({ sidebar: !this.model.get('sidebar') })
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
    
    this.render()
    new View.Alert({
      className: 'alert-error alert fade',
      message: (error.status == 401 && !errorJSON.errors) ? parseError('unauthorized') : 'Something went wrong while trying to save this playlist.',
      $prepend: this.$el
    })
  },

  save: function() {
    if (!Session.user) {
      loginModal.render().addAlert('not_logged_in_save')
      ModalView.setCallback(this.save)
      return
    }
    this.model.save({ tracks : this.model.tracks.toJSON() }, {
      error: this.saveError
    })
  },
    
  deleteError: function(model, error) {
    var $alert, errorJSON
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {
      errorJSON = {}
    }
    
    this.render()
    new View.Alert({
      className: 'alert-error alert fade',
      message: (error.status == 401 && !errorJSON.errors) ? parseError('unauthorized') : 'Something went wrong while trying to delete this playlist.',
      $prepend: this.$el
    })
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
      wait: true,
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
      playlists: _.chain(this.collection.models)
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
  }
})


;
