
Model.Video = Backbone.Model.extend({
  initialize: function() {
    swfobject.embedSWF('http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=video&wmode=transparent', // swfUrlStr
                       'video', // replaceElemIdStr
                       '420',   // width
                       '240',   // height
                       '8',     // swfVersionStr
                       null,    // xiSwfUrlStr
                       null,    // flashVarsObj
                       { allowScriptAccess: 'always', wmode: 'transparent' },  // parameters
                       { id: 'video' }                                         // attributes
    )
    //_.bindAll(this, 'play', 'pause')
    
    _.defer(function() {
      window.Controls = new View.Controls
    })
  },
  
  stop: function() {
    this.stopped = true
    this.pause()
    //if (window.NowPlayingTrack) {
    //  $(NowPlayingTrack.view.el).removeClass('playing')
    //  NowPlayingTrack = null
    //}
    Controls.render()
    this.onStateChange(-1)
  },
  
  onStateChange: function(state) {
    console.log('Video.onStateChange', state)
    this.state = state
    if (this.state == -1) {
      //Controls.updateTrackInfo()
    }
    if (this.state == 0) {
      //this.next()
    }
    if (this.state == 1 && this.pauseNextState) {
      //this.pauseNextState = false
      this.pause()
    }
    
    this.player.setPlaybackQuality('hd720')
    Controls.updatePlay()
  },
  
  playing: function() {
    return this.state == 1
  },
  
  pause: function() {
    this.player.pauseVideo()
  },
  
  play: function() {
    // TODO
    // change to collection??
    console.log('Video.play 1')
    if (!NowPlaying.tracks.length) {
      return false
    }
    this.stopped = false

    if (!window.NowPlayingTrack) {
      this.next()
      return
    }
    console.log('Video.play 2', NowPlayingTrack)
    
    this.player.playVideo()
    console.log('Video.play 3')
    if (this.state != 1) {
      //this.seek(Math.floor(this.currentTime()))
    }
  },
  
  next: function() {
    console.log('Video.next')
    if (this.repeat && window.NowPlayingTrack) {
      NowPlayingTrack.play()
      return
    }
      
    var next = false
    _.each(NowPlaying.tracks, function(trackModel) {
      if (next == true) {
        next = trackModel
      }
      if (window.NowPlayingTrack === trackModel) {
        next = true
      }
    })

    if (next == true || next == false) {
      next = _.first(NowPlaying.tracks)
    }

    next.play()
  },
  
  prev: function() {
    if (this.repeat && window.NowPlayingTrack) {
      NowPlayingTrack.play()
      return
    }
      
    if (this.currentTime() > 2) {
      this.seek(0)
      return
    }

    this.skipToPrev = true

    var prev = null, prevSet = false
    if (window.NowPlayingTrack === _.first(NowPlaying.tracks)) {
      prev = _.last(NowPlaying.tracks)
    } else {
      _.each(NowPlaying.tracks, function(trackModel) {
        if (window.NowPlayingTrack === trackModel) prevSet = true
        if (!prevSet) prev = trackModel
      })
    }

    prev.play()
  },
  
  load: function(id) {
    if (this.state == 3) {
      return
    }
    this.player.loadVideoById(id)
  },
  
  pauseNext: function() {
    this.pauseNextState = true
  },
  
  volume: function(volume) {
    this.player.setVolume(volume)
  },

  seek: function(time) {
    this.player.seekTo(time, false)
  },

  duration: function() {
    return this.player.getDuration()
  },

  currentTime: function() {
    return this.player.getCurrentTime()
  },
  
  loadRatio: function() {
    return this.player.getVideoBytesLoaded() / this.player.getVideoBytesTotal()
  },

  playRatio: function() {
    return this.player.getCurrentTime() / this.player.getDuration()
  },
  
  onError: function(error) {
    console.log('Video.onError', error)
    if (error == '150') {
      NowPlayingTrack.videos = _.rest(NowPlayingTrack.videos)
      NowPlayingTrack.play()
    }
  },
  
  error: function() {
    //$(NowPlayingTrack.view.el).addClass('error')
    if (this.lastError == NowPlayingTrack) {
      return
    }
    this.lastError = NowPlayingTrack
    console.log('Video.error')
    //this.skipToPrev ? this.prev() : this.next()
  },

  search: function(track) {
    var query = '"' + track.artist + '" "' + track.name + '"'
    console.log('Video.search (should be false)', this.loading)
    if (!this.loading) {
      this.loading = true
      console.log('Video.search 2', window.setTrackVideoIds, track)

      var url = "http://gdata.youtube.com/feeds/api/videos?" + $.param({
          alt           : 'json-in-script',
          category      : 'Music',
          vq            : (query + this.filters(query)),
          orderby       : 'relevance',
          'start-index' : 1,
          'max-results' : 20,
          format        : 5,
          callback      : 'window.setTrackVideoIds'
      })

      $.getScript(url)
      return true
    }
  }, 

  filters: function(str) {
    var filters = ''
    if (!str.match(/instrumental/i)) filters += ' -instrumental'
    if (!str.match(/chipmunk/i)) filters += ' -chipmunk'
    if (!str.match(/karaoke/i)) filters += ' -karaoke'
    if (!str.match(/cover/i)) filters += ' -cover'
    if (!str.match(/remix/i)) filters += ' -remix'
    if (!str.match(/live/i)) filters += ' -live'
    return filters
  }

})

View.Controls = Backbone.View.extend({
  el: $('#controls'),
  
  template: jade.compile($('#controls-template').text()),
  
  initialize: function() {
    _.bindAll(this, 'updatePlay')
    this.render()
  },
  
  render: function() {
    this.$el.html(this.template())
  },
  
  events: {
    'click #play-pause' : 'playPause',
    'click #next'       : 'next',
    'click #prev'       : 'prev',
    //'click #fullscreen'     : 'toggleFullscreen',
    //'click #repeat'         : 'toggleRepeat',
    //'click #timer_loaded'   : 'seek',
    //'click #mute'           : 'toggleMute'
    //'click #volume'       : 'volume',
  },
  
  playPause: function(e) {
    if (Video.playing()) {
      Video.pause()
    } else {
      Video.play()
    }
  },
  
  updatePlay: function() {
    if (Video.playing()) {
      this.$el.find('#play-pause div').addClass('icon-pause')
    } else {
      this.$el.find('#play-pause div').removeClass('icon-pause')
    }
  },
  
  next: function() {
    Video.next()
  },
  
  prev: function() {
    Video.prev()
  }
    
})



















  /*
  fullscreenDisable: function() {
    this.fullscreen = false
    $('#fullscreen').removeClass('off')
    $('body').removeClass('fullscreen')
    $('#video').width('').height('')
  },

  fullscreenEnable: function() {
    this.fullscreen = true
    $('#fullscreen').addClass('off')
    $('body').addClass('fullscreen')
  },

  toggleFullscreen: function() {
    if (this.fullscreen) {
      this.fullscreenDisable()
    } else {
      this.fullscreenEnable()
    }
    windowResized()
    Controls.update()
  },

  toggleRepeat: function() {
    if (this.repeat) {
      this.repeat = false
      $('#repeat').removeClass('off')
    } else {
      this.repeat = true
      $('#repeat').addClass('off')
    }
  },



  timers: function() {
    var current   = Math.floor(this.player.getCurrentTime()),
        remaining = Math.ceil(this.player.getDuration() - current)

    return [
      this.humanizeSeconds(current),
      this.humanizeSeconds(remaining)
     ]
  },

  humanizeSeconds: function(s) {
    var minutes = Math.floor(s / 60),
        seconds = Math.floor(s % 60)
    if (seconds < 10) {
      seconds = "0" + seconds
    }
    return minutes + ":" + seconds
  },

})
*/
