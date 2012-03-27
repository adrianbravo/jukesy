Mixins.TrackViewEvents = {

  removeTrack: function() {
    if (this.model.playing) {
      // when deleting multiple songs, this will be more complex
      Video.next()
    }

    this.model.playlist.removeTrack(this.model)
    this.model.playlist.nowPlayingView.render()
    //this.model.playlist.view.render()
  },
  
  addTrack: function(method, playlist) {    
    var position
      , self = this
      , clone = new Model.Track(this.model.toJSON())
    
    
    // check for now playing track
    /*
        // Adds selected tracks to NowPlaying collection.
        queueTrack: function(method) {
          $(this.el).addClass('selected')
          var tracks = _(Search.track.models).chain()
            .map(function(track) {
              if (!$(track.view.el).hasClass('selected')) {
                return null
              }
              $(track.view.el).removeClass('selected')

              var copyTrack = new Model.Track(track.toJSON())
              copyTrack.playlist = NowPlaying
              return copyTrack
            }).compact().value()

            NowPlaying.add(tracks, { method: method })
        },
    */
    
    if (method == 'play' || method == 'next') {
      if (Video.track) {
        position = _.indexOf(playlist.tracks, Video.track) + 1
      } else {
        position = 0
      }
    }
    playlist.add(clone, position)
    
    _.defer(function() {
      self.$el.removeClass('selected').siblings().removeClass('selected')
    })
    return clone
  },
    
  playNow: function() {
    this.addTrack('play', NowPlaying).play()
  },
  
  queueNext: function() {
    this.addTrack('next', NowPlaying)
  },
  
  queueLast: function() {
    this.addTrack('last', NowPlaying)
  },
  
  dropdown: function() {
    this.$el.find('.dropdown-toggle').dropdown('toggle')
    return false
  }
  
}

Mixins.TrackSelection = {
  
  toggleSelect: function(e) {
    if (e.shiftKey) {
      this.fillSelected(this.$el, window.lastSelected.$el)
    } else if (!(e.altKey || e.metaKey)) {
      if (e.type == 'contextmenu' && this.$el.hasClass('selected')) {
      } else {
        this.$el.toggleClass('selected').siblings().removeClass('selected');
      }
    } else {
      this.$el.toggleClass('selected');
    }
      
    if (e.type == 'contextmenu') {
      this.$el.addClass('selected')
    }
    window.lastSelected = this
  },

  fillSelected: function($track1, $track2) {
    if (!$track1 || !$track2) {
      return
    }
    if ($track1 == $track2) {
      $track1.addClass('selected')
    } else if ($track1.index() > $track2.index()) {
      $track1.prevUntil($track2).addClass('selected')
    } else if ($track2.index() > $track1.index()) {
      $track2.prevUntil($track1).addClass('selected')
    }
    $track1.addClass('selected')
    $track2.addClass('selected')
  }
  
}

Mixins.ViewFormErrors = {
  
  submit: function() {
    var sendJSON = {}
    _.each(this.$el.find('[name]'), function(inputEl) {
      var $input = $(inputEl)
      sendJSON[$input.attr('name')] = $input.val()
    })
    this.model.save(sendJSON, {
      success: this.submitSuccess,
      error: this.submitError
    })
    return false
  },
  
  submitError: function(model, error) {
    this.removeErrors()
    var errorJSON = {}
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {}
    
    if (error.status == 401 && !errorJSON.errors) {
      this.addAlert('unauthorized')
    } else if (error.status) {
      this.addErrors(errorJSON.errors)
    } else {
      this.addAlert()
    }
    this.focusInput()
  },
  
  addErrors: function(errors) {
    var self = this
    _.each(errors, function(error, field) {
      if (field == '$') {
        self.addAlert(error)
      } else {
        var $group = self.$el.find('.controls [name=' + field + ']').parents('.control-group')
        $group.addClass('error')
        $group.find('span.help-inline').html(parseError(field, error))
      }
    })
  },

  removeErrors: function() {
    this.$el.find('.error').removeClass('error')
    this.$el.find('.alert').remove()
    this.$el.find('span.help-inline').html('')
  },
  
  addAlert: function(message) {
    var $alert = new View.Alert({
          className: 'alert-error alert fade',
          message: parseError(null, message || 'no_connection')
        }).render()
      
    this.elAlertFind().prepend($alert)
    _.defer(function() {
      $alert.addClass('in')
    })
  },
  
  focusInput: function() {
    var self = this
    _.defer(function() {
      self.elFocusFind().focus()
    })
  },
  
  elAlertFind: function() {
    return this.elAlert ? this.$el.find(this.elAlert) : this.$el
  },
  
  elFocusFind: function() {
    var $input
    if (this.elFocus) {
      $input = this.$el.find(this.elFocus)
    } else {
      $input = this.$el.find('.error:first [name]')
      if (!$input.length) {
        $input = this.$el.find('[name]:first')
      }
    }
    return $input
  }  

}
