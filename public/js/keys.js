KeyMapper = {
    
  // The event lacks keyboard modifiers (ctrl, alt, shift, meta)
  keypressHasModifier: function(e) {
    return (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) ? true : false
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
    //Controls.$volume.slider('value', Controls.$volume.slider('value') + 5)
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
    //Controls.$volume.slider('value', Controls.$volume.slider('value') - 5)
    return false
  },
      
  // F
  k70: function(e) {
    if (this.keypressHasModifier(e)) return
    //Video.toggleFullscreen()
    return false
  },
    
  // M
  k77: function(e) {
    if (this.keypressHasModifier(e)) return
    //Controls.toggleMute(e)
    return false
  },
    
  // R
  k82: function(e) {
    if (this.keypressHasModifier(e)) return
    //Controls.toggleRepeat(e)
    return false
  },
    
  // /
  k191: function(e) {
    if (this.keypressHasModifier(e)) return
    //Video.fullscreenOff()
    //$('#query').focus()
    return false
  },
    
  // ESCAPE
  k192: function(e) {
    //Video.fullscreenDisable()
    return false
  }
    
}

$(function() {
  _.bindAll(KeyMapper, 'keypressHasModifier', 'k32', 'k37', 'k38', 'k39', 'k40', 'k70', 'k77', 'k82', 'k191', 'k192')
})
