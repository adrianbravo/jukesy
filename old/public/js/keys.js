$(function() {
  
  KeyMapper = {
    
    // The event lacks keyboard modifiers (ctrl, alt, shift, meta)
    keypressHasModifier: function(e) {
      return (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) ? true : false
    },
    
    // DELETE
    k8: function(e) {
      // TODO Can't we just check on window.lastSelected as a playlist?
      if (window.visiblePlaylist == window.lastSelected) {
        // TODO Replace confirm with modal dialog.
        if (confirm('Delete the playlist: ' + lastSelected.get('name') + '?')) {
          lastSelected.destroy({
            success: function(model, response) {
              if (window.NowPlaying == lastSelected) {
                NowPlaying.clear()
              }
              model.view.remove()
              model.shortView.remove()
              Router.navigate('/', true)
            }
          })
        } else {
          // Did not delete.
        }
      } else if (window.visiblePlaylist) {
        // TODO what if removed track is now playing
        var tracksToRemove = _.filter(visiblePlaylist.tracks(), function(track) {
          return $(track.view.el).hasClass('selected')
        })

        // Select next track to play
        var nextTrack = false,
            pauseNext = false
        if (window.NowPlayingTrack && $(NowPlayingTrack.view.el).hasClass('selected')) {
          if (Video.isNotPlaying) {
            pauseNext = true
          }
          nextTrack = NowPlayingTrack.nextUnselected()
          if (nextTrack == null) {
            NowPlaying.clear()
          }
        }

        if (tracksToRemove.length) {
          visiblePlaylist.remove(tracksToRemove)
        }

        if (nextTrack) {
          if (pauseNext) {
            Video.pauseNext()
          }
          nextTrack.play()
        }
      }
      return false
    },
    
    // SPACEBAR
    k32: function(e) {
      ($('#play').hasClass('pause')) ? window.Controls.pause() : window.Controls.play()
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
      Controls.$volume.slider('value', Controls.$volume.slider('value') + 5)
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
      Controls.$volume.slider('value', Controls.$volume.slider('value') - 5)
      return false
    },
    
    // CTRL-A, META-A
    k65: function(e) {
      if ((e.metaKey || e.ctrlKey) && window.visiblePlaylist) {
        var $el, trackView, selector

        if (visiblePlaylist.query) {
          $el = $(Search.track.view.el)
          trackView = Search.track.view.collection.models[0].view
          selector = trackView.tagName + '.' + trackView.className
        } else {
          $el = $(visiblePlaylist.view.el)
          trackView = visiblePlaylist.tracks()[0].view
          selector = trackView.tagName + '.' + trackView.className
        }

        if ($el.find(selector + '.selected').length < $el.find(selector).length) {
          $el.find(selector).addClass('selected')
        } else {
          $el.find(selector).removeClass('selected')
        }
        return false
      }
      return
    },
    
    // F
    k70: function(e) {
      if (this.keypressHasModifier(e)) return
      Video.toggleFullscreen()
      return false
    },
    
    // M
    k77: function(e) {
      if (this.keypressHasModifier(e)) return
      Controls.toggleMute(e)
      return false
    },
    
    // R
    k82: function(e) {
      if (this.keypressHasModifier(e)) return
      Controls.toggleRepeat(e)
      return false
    },
    
    // /
    k191: function(e) {
      if (this.keypressHasModifier(e)) return
      Video.fullscreenOff()
      $('#query').focus()
      return false
    },
    
    // ESCAPE
    k192: function(e) {
      Video.fullscreenDisable()
      return false
    }
    
  }
  
  _.bindAll(KeyMapper, 'keypressHasModifier', 'k8', 'k32', 'k37', 'k38', 'k39', 'k40', 'k65', 'k70', 'k77', 'k82', 'k191', 'k192')
})