Model.Playlist = Backbone.Model.extend({
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

  defaults: {
    name: 'Untitled Playlist',
    user: 'anonymous'
  },
  
  initialize: function() {
    console.log('Playlist.initialize', this.isNew())
    _.bindAll(this, 'setNowPlaying', 'changeCallback')
    
    this.view = new View.Playlist({ model: this })
    if (this.isNew()) {
      this.tracks = []
    }
    this.on('change:name change:sidebar', SidebarView.render, SidebarView)
    this.on('change', this.changeCallback, this)
  },
  
  changeCallback: function() {
    this.set({ changed: true }, { silent: true })
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
    Meow.render(message)
  },
  
  removeTracks: function(tracks) {
    var self = this
      , message = 'Removed ' + tracks.length + ' ' + _.plural(tracks.length, 'track', 'tracks') + ' from ' + this.get('name') + '.'
    
    _.each(tracks, function(track) {
      self.tracks.splice(_.indexOf(self.tracks, track), 1)
    })
    this.setTracks()
    Meow.render(message)
  },
  
  setNowPlaying: function() {
    if (window.NowPlaying) {
      NowPlaying.set({ nowPlaying: false }, { silent: true })
      NowPlaying.nowPlaying = false
    }
    window.NowPlaying = this
    NowPlaying.set({ nowPlaying: true }, { silent: true })
    this.nowPlaying = true
    
    if (Video.player) {
      Video.stop()
    }
    this.view.render()
    SidebarView.render()
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
  }
  
})

View.Playlist = Backbone.View.extend({
  className: 'playlist',
  
  template: jade.compile($('#playlist-show-template').text()),

  events: {
    'click .playlist-name.edit' : 'toggleNameEdit',
    'click .playlist-save'      : 'save',
    'click .playlist-sidebar'   : 'toggleSidebar',
    //'click .playlist-save-as'   : 'saveAs',
    //'click .playlist-delete'    : 'delete',
    'click .play-all'       : 'playAll',
    'click .queue-all-next' : 'queueNext',
    'click .queue-all-last' : 'queueLast',
    'blur .playlist-name-edit'     : 'validateName',
    'keypress .playlist-name-edit' : 'keyDown'
  },
    
  initialize: function() {
    _.bindAll(this, 'keyDown', 'saveSuccess', 'saveError', 'save', 'focusNameEdit', 'playAll')
  },

  render: function(options) {
    if (!this.model.isNew() && !this.model.tracks) {
      this.$el.html('Loading...')
      return this
    }
    // alter to fetch if tracks is not present when isNew() == false
    // on success re-render w/ tracks filled in (do not if the view is not visible)
    // on fail, show error?
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
    this.model.set({ changed: false }, { silent: true })
    if (!Playlists.get(this.model.id)) {
      Playlists.add([ this.model ])
    }
    var $alert = new View.Alert({
      className: 'alert-success alert',
      message: 'Your playlist has been saved.'
    })
    this.render().$el.prepend($alert.render())
  },
  
  saveError: function(model, error) {
    // TODO dry (reused from view form mixins)
    var errorJSON = {}
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {}
    
    console.log(errorJSON)
    if (error.status == 401 && !errorJSON.errors) {
      this.addAlert('unauthorized')
    } else if (error.status) {
      //this.addErrors(errorJSON.errors)
    } else {
      this.addAlert()
    }
    
    var $alert = new View.Alert({
      className: 'alert-error alert',
      message: 'Error!' || parseError(null, 'Error!' || 'no_connection')
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

  /*
  saveAs: function() {
    if (!Session.user) {
      loginModal.render().addAlert('not_logged_in_save')
      ModalView.setCallback(this.saveAs)
      return
    }
    console.log('save as')
    // clone playlist model
    // save new playlist model
    // do not change current playlist
  },

  delete: function() {
    console.log('delete')

    if (!Session.user) {
      // login modal w/ callback this.delete
      return
    }
  }
  */
  
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
    var val = this.$el.find('.playlist-name-edit').val()
    if (this.model.get('name') != val) {
      this.model.set({ name: val })
    }
    this.render()
  }
  
})

/*
function discover() {
  console.log('now playing', window.NowPlaying)
  // select random track/tag from playlist
  // if track/tag has no associated associated tracks:
  //   query lastfm for toptracks / similartracks
  //   should be able to use a separate callback to check results
  //   callback
  //     sets track's or tag's .tracks to the results
  //     selects a random track from the list
  //     if track is not in NowPlaying (or banned tracks eventually), add it
  //     else, try next track in list (... may need to restrict this)
  // this process should occur as an interval
  // should only add up to 3 tracks ahead
}
*/

View.Playlists = Backbone.View.extend({
  template: jade.compile($('#playlist-index-template').text()),
  
  className: 'playlists',
  
  render: function(options) {
    if (!this.collection.models) {
      this.$el.html('Loading...')
      return this
    }
    this.$el.html(this.template({
      playlists: _.map(this.collection.models, function(playlist) { return playlist.toJSON() }),
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
  }
})
