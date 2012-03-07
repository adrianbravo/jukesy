
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
    _.defer(function() {
      window.Controls = new View.Controls
    })
  },
  
  stop: function() {
    this.stopped = true
    this.pause()
    if (this.track) {
      this.track = null
      //this.track.view.render()
      //  $(this.track.view.el).removeClass('playing')
    }
    
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
      this.next()
    }
    if (this.state == 1 && this.pauseNextState) {
      this.pauseNextState = false
      this.pause()
    }
    
    this.player.setPlaybackQuality('hd720')
    Controls.renderPlay()
    Controls.renderTimer()
  },
  
  playing: function() {
    return this.state == 1
  },
  
  pause: function() {
    this.player.pauseVideo()
  },
  
  play: function() {
    if (!NowPlaying.tracks.length) {
      return false
    }
    this.stopped = false

    if (!this.track) {
      this.next()
      return
    }
    
    this.player.playVideo()
    if (this.state != 1) {
      this.seek(Math.floor(this.currentTime()))
    }
  },
  
  next: function() {
    var self = this
      , next = null
    
    if (this.tryRepeat()) {
      return
    }
    
    if (this.track === _.last(NowPlaying.tracks)) {
      next = _.first(NowPlaying.tracks)
    } else {
      next = NowPlaying.tracks[_.indexOf(NowPlaying.tracks, this.track) + 1]
    }
    next.play()
  },
  
  prev: function() {
    var self = this
      , prev = null
    
    if (this.tryRepeat() || this.trySeek()) {
      return
    }
    
    this.skipToPrev = true
    if (this.track === _.first(NowPlaying.tracks)) {
      prev = _.last(NowPlaying.tracks)
    } else {
      prev = NowPlaying.tracks[_.indexOf(NowPlaying.tracks, this.track) - 1]
    }
    prev.play()
  },
  
  load: function(id) {
    if (this.state == 3) {
      return
    }
    this.player.loadVideoById(id)
  },
  
  tryRepeat: function() {
    console.log('trying to repeat')
    if (this.repeat && this.track) {
      console.log('this.track.play!')
      //this.track.play()
      this.seek(0)
      return true
    }
  },
  
  trySeek: function() {
    if (this.currentTime() > 2) {
      this.seek(0)
      return true
    }
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
    return this.player && this.player.getVideoBytesLoaded() / this.player.getVideoBytesTotal()
  },

  playRatio: function() {
    return this.player && this.player.getCurrentTime() / this.player.getDuration()
  },
  
  onError: function(error) {
    console.log('Video.onError', error)
    if (error == '150') {
      //this.track.playNextVideo()
      this.track.videos = _.rest(this.track.videos)
      this.track.play()
    }
  },
  
  error: function() {
    //$(this.track.view.el).addClass('error')
    if (this.lastError == this.track) {
      return
    }
    this.lastError = this.track
    console.log('Video.error')
    this.skipToPrev ? this.prev() : this.next()
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
    _.bindAll(this, 'updateTimer')
    
    this.render()
    this.$el.find('#repeat').tooltip()
    this.$el.find('#shuffle').tooltip()
    
    _.defer(function() {
      setInterval(Controls.updateTimer, 1000 / 8)      
    })
  },
  
  render: function() {
    this.$el.html(this.template())
  },
  
  events: {
    'click #play-pause' : 'playPause',
    'click #next'       : 'next',
    'click #prev'       : 'prev',
    'click #repeat:not(.disabled)'  : 'toggleRepeat',
    'click #shuffle:not(.disabled)' : 'toggleShuffle',
    //'click #fullscreen'     : 'toggleFullscreen',
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
  
  renderPlay: function() {
    if (Video.playing()) {
      this.$el.find('#play-pause div').addClass('icon-pause')
    } else {
      this.$el.find('#play-pause div').removeClass('icon-pause')
    }
  },
  
  renderTimer: function() {
    if (Video.playing()) {
      this.$el.find('#timer .progress').addClass('active')
    } else {
      this.$el.find('#timer .progress').removeClass('active')
    }
  },
  
  updateTimer: function() {
    var load = Video.loadRatio()
      , play = Video.playRatio()
      
    if (load > 0 && load != Infinity) {
      this.$el.find('#timer .progress').width(load * 100 + '%')
      this.$el.find('#timer .progress .bar').width(play * 100 + '%')
    } else {
      this.$el.find('#timer .progress').width(0)
      this.$el.find('#timer .progress .bar').width(0)
    }
  },
  
  next: function() {
    Video.next()
  },
  
  prev: function() {
    Video.prev()
  },
  
  // TODO DRY
  toggleRepeat: function() {
    var $repeat = this.$el.find('#repeat')
    if (Video.repeat) {
      Video.repeat = false
      $repeat.addClass('off')
      $repeat.attr('data-original-title', 'Repeat: off')
      $repeat.tooltip('show')
      _.delay(function() { $repeat.tooltip('hide') }, 1000)
    } else {
      Video.repeat = true
      $repeat.removeClass('off')
      $repeat.attr('data-original-title', 'Repeat: on')
      $repeat.tooltip('show')
      _.delay(function() { $repeat.tooltip('hide') }, 1000)
    }    
  },
  
  toggleShuffle: function() {
    var $shuffle = this.$el.find('#shuffle')
    if (Video.shuffle) {
      Video.shuffle = false
      $shuffle.addClass('off')
      $shuffle.attr('data-original-title', 'Shuffle: off')
      $shuffle.tooltip('show')
      _.delay(function() { $shuffle.tooltip('hide') }, 1000)
    } else {
      Video.shuffle = true
      $shuffle.removeClass('off')
      $shuffle.attr('data-original-title', 'Shuffle: on')
      $shuffle.tooltip('show')
      _.delay(function() { $shuffle.tooltip('hide') }, 1000)
    }
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
