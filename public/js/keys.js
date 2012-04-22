View.KeyboardShortcuts = Backbone.View.extend({
  el: $(document),
  
  template: jade.compile($('#keyboard-shortcuts-template').text()),

  events: {
    'keypress #query' : 'searchAll',
    'keydown'         : 'keyMapper',
    'keyup'           : 'setLastVolume',
    'click #keyboard-shortcuts' : 'render'
  },
  
  render: function() {
    ModalView.render(this.template())
  },
  
  searchAll: function(e) {
    if (e.keyCode == 13) {
      Router.navigate('/search/' + encodeURIComponent($('#query').val()), true)
      $('#query').val('').blur()
    }
  },
  
  keyMapper: function(e) {
    if ($(e.target).is('input, textarea')) {
      return
    }
    
    var fn = KeyMapper['k' + e.keyCode]
    if (fn) {
      return fn(e)
    }
  },
  
  setLastVolume: function(e) {
    var self = this
    
    if ($(e.target).is('input, textarea')) {
      return
    }
    
    if (e.keyCode == 38 || e.keyCode == 40) {
      _.defer(function() {
        var value = Video.player.getVolume()
        if (value) {
          Controls.lastVolume = value
        }
      })
    }
  }
})

KeyMapper = {
    
  // The event lacks keyboard modifiers (ctrl, alt, shift, meta)
  keypressHasModifier: function(e) {
    return (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) ? true : false
  },
  
  // ESCAPE
  k27: function(e) {
    if (Video.fullscreen) {
      Controls.toggleFullscreen()
    }
    return false
  },
  
  // SPACEBAR
  k32: function(e) {
    Controls.playPause()
    return false
  },
    
  // LEFT
  k37: function(e) {
    if (this.keypressHasModifier(e)) return
    window.Controls.prev()
    return false
  },
    
  // UP
  k38: function(e) {
    if (this.keypressHasModifier(e)) return
    var value = Video.player.getVolume()
    Video.volume(value + 2)
    return false
  },
    
  // RIGHT
  k39: function(e) {
    if (this.keypressHasModifier(e)) return
    window.Controls.next()
    return false
  },
    
  // DOWN
  k40: function(e) {
    if (this.keypressHasModifier(e)) return
    var value = Video.player.getVolume()
    Video.volume(value - 2)
    return false
  },
  
  // could make this a loop
  
  // 1
  k49: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(0)
    return false
  },
  
  // 2
  k50: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(1)
    return false
  },
  
  // 3
  k51: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(2)
    return false
  },
  
  // 4
  k52: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(3)
    return false
  },
  
  // 5
  k53: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(4)
    return false
  },
  
  // 6
  k54: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(5)
    return false
  },
  
  // 7
  k55: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(6)
    return false
  },
  
  // 8
  k56: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(7)
    return false
  },
  
  // 9
  k57: function(e) {
    if (this.keypressHasModifier(e)) return
    Video.track.setVideo(8)
    return false
  },
  
  // D
  k68: function(e) {
    if (this.keypressHasModifier(e)) return
    Controls.toggleRadio()
    return false
  },
      
  // F
  k70: function(e) {
    if (this.keypressHasModifier(e)) return
    Controls.toggleFullscreen()
    return false
  },
      
  // M
  k77: function(e) {
    if (this.keypressHasModifier(e)) return
    Controls.toggleMute()
    return false
  },
  
  // P
  k80: function(e) {
    if (this.keypressHasModifier(e)) return
    NowPlaying.navigateTo()
    return false
  },
  
  // Q
  k81: function(e) {
    if (this.keypressHasModifier(e)) return
    Controls.toggleQuality()
    return false
  },
  
  // R
  k82: function(e) {
    if (this.keypressHasModifier(e)) return
    Controls.toggleRepeat()
    return false
  },
 
  // S
  k83: function(e) {
    if (this.keypressHasModifier(e)) return
    Controls.toggleShuffle()
    return false
  },
  
  // V
  k86: function(e) {
    if (this.keypressHasModifier(e)) return
    if (Video.fullscreen) {
      Controls.toggleFullscreen()
    }
    Video.jumpTo()
    return false
  },
  
  // X
  k88: function(e) {
    if (this.keypressHasModifier(e)) return
    if (window.Video && Video.track) {
      NowPlaying.tracks.remove([ Video.track ])
    }
    return false
  },
  
  // /
  k191: function(e) {
    if (this.keypressHasModifier(e)) return
    if (Video.fullscreen) {
      Controls.toggleFullscreen()
    }
    _.defer(function() {
      $body.scrollTop(0)
      $('#query').focus()
    })
    return false
  }
      
}

$(function() {
  _.bindAll(KeyMapper, 'keypressHasModifier',
            'k27', 'k32', 'k37', 'k38', 'k39', 'k40',
            'k49', 'k50', 'k51', 'k52', 'k53', 'k54', 'k55', 'k56', 'k57', 
            'k68', 'k70', 'k77', 'k80', 'k81', 'k82', 'k83', 'k86', 'k88', 'k191')
})


;