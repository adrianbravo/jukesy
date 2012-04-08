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
    name: 'Untitled Playlist'
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
  template: jade.compile($('#playlist-template').text()),

  events: {
    'click .playlist-save'    : 'save',
    'click .playlist-save-as' : 'saveAs',
    //'click .playlist-delete'  : 'delete'
  },
  
  initialize: function() {
    _.bindAll(this, 'saveSuccess', 'saveError', 'save', 'saveAs')
  },

  render: function() {
    var self = this
    
    this.$el.html(this.template({
      playlist: this.model.toJSON(),
      tracks: this.model.tracks,
      nowPlaying: this.model.nowPlaying
    }))

    _.each(this.model.tracks, function(track) {
      self.$el.find('tbody').append(track.view.$el)
      track.view.delegateEvents()
    })
    return this
  },
  
  saveSuccess: function(playlist, response) {
    console.log('save success', playlist, response)
  },
  
  saveError: function(model, error) {
    console.log('save error', model, error)
  },

  save: function() {
    if (!Session.user) {
      loginModal.render().addAlert('not_logged_in_save')
      ModalView.setCallback(this.save)
      return
    }

    var sendJSON = {}
    //_.each(this.$el.find('[name]'), function(inputEl) {
    //  var $input = $(inputEl)
    //  sendJSON[$input.attr('name')] = $input.val()
    //})
    
    this.model.save(sendJSON, {
      success: this.saveSuccess,
      error: this.saveError
    })
  },

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

  /*
  delete: function() {
    console.log('delete')

    if (!Session.user) {
      // login modal w/ callback this.delete
      return
    }
  }
  */
  
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
