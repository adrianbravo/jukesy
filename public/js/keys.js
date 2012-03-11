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
    
  // /
  k191: function(e) {
    if (this.keypressHasModifier(e)) return
    if (Video.fullscreen) {
      Controls.toggleFullscreen()
    }
    $('#query').focus()
    return false
  }
      
}

$(function() {
  _.bindAll(KeyMapper, 'keypressHasModifier', 'k27', 'k32', 'k37', 'k38', 'k39', 'k40', 'k68', 'k70', 'k77', 'k82', 'k83', 'k191')
})
