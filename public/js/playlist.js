Model.Playlist = Backbone.Model.extend({
  urlRoot: function() {
    return Session.user ? '/user/' + Session.user.get('username') + '/playlist' : false
  },

  url: function() {
    var url = this.urlRoot()
    if (!this.isNew()) {
      url += '/' + this.get('_id')
    }
    return url
  },

  defaults: {
    name: 'Untitled Playlist',
    user: 'anonymous'
  },
  
  initialize: function() {
    console.log('Playlist.initialize')
    _.bindAll(this, 'nowPlaying')
    
    this.view = new View.Playlist({ model: this })
    this.tracks = []
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
    Meow.render(message)
  },
  
  removeTracks: function(tracks) {
    var self = this
      , message = 'Removed ' + tracks.length + ' ' + _.plural(tracks.length, 'track', 'tracks') + ' from ' + this.get('name') + '.'
    
    _.each(tracks, function(track) {
      self.tracks.splice(_.indexOf(self.tracks, track), 1)
    })
    Meow.render(message)
  },
  
  nowPlaying: function() {
    if (window.NowPlaying) {
      NowPlaying.nowPlaying = false
    }
    window.NowPlaying = this
    this.nowPlaying = true
    if (Video.player) {
      Video.stop()
    }
  }
  
})

View.Playlist = Backbone.View.extend({
  className: 'playlist',
  
  template: jade.compile($('#playlist-template').text()),

  events: {
    'click .playlist-name'     : 'toggleNameEdit',
    'click .playlist-save'     : 'save',
    //'click .playlist-save-as'  : 'saveAs',
    'blur .playlist-name-edit' : 'validateName',
    'keypress .playlist-name-edit' : 'keyDown',
    //'click .playlist-delete'  : 'delete'
  },
  
  initialize: function() {
    _.bindAll(this, 'keyDown', 'saveSuccess', 'saveError', 'save', 'saveAs', 'focusNameEdit')
  },

  render: function(options) {
    var self = this
    options = options || {}
    
    this.model.set({
      tracks: this.model.tracks,
      tracks_count: this.model.tracks.length
    })
    
    this.$el.html(this.template({
      currentUser: Session.userJSON(),
      playlist: this.model.toJSON(),
      nowPlaying: this.model.nowPlaying,
      edit: options.edit
    }))

    _.each(this.model.get('tracks'), function(track) {
      self.$el.find('tbody').append(track.view.render().$el)
    })
    
    return this
  },
  
  saveSuccess: function(playlist, response) {
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
    this.render({ edit: true })
    _.defer(this.focusNameEdit)
  },
  
  focusNameEdit: function() {
    this.$el.find('.playlist-name-edit').focus()
  },
  
  validateName: function() {
    var val = this.$el.find('.playlist-name-edit').val()
    // TODO if (val ...)
    this.model.set({ name: val })
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
