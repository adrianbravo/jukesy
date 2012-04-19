
Model.Video = Backbone.Model.extend({
  initialize: function() {
    swfobject.embedSWF('http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=video&wmode=transparent', // swfUrlStr
                       'video', // replaceElemIdStr
                       '480',   // width
                       '270',   // height
                       '8',     // swfVersionStr
                       null,    // xiSwfUrlStr
                       null,    // flashVarsObj
                       { allowScriptAccess: 'always', wmode: 'transparent' },  // parameters
                       { id: 'video' }                                         // attributes
    )
    _.bindAll(this, 'volume', 'seek', 'stop')
    
    _.defer(function() {
      window.Controls = new View.Controls
    })
  },
  
  stop: function() {
    this.stopped = true
    this.pause()
    if (this.track) {
      this.track.unsetPlaying()
      this.track = null
    }
    
    Controls.render()
    this.onStateChange(-1)
  },
  
  onStateChange: function(state) {
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
    if (!NowPlaying.tracks.models.length) {
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
  
  isInitialLoad: function() {
    return this.state == -1 && !this.loadRatio() && !this.playRatio()
  },

  next: function() {
    var self = this
      , next = null
    
    if (this.skipToPrev) {
      this.prev()
      return
    }

    if (this.loading || this.state == 3 || this.tryRepeat()) {
      return
    }
    
    if (Shuffle.get('active')) {
      Shuffle.next()
      return
    }
    
    if (this.track === _.last(NowPlaying.tracks.models) || _.isUndefined(this.track)) {
      next = _.first(NowPlaying.tracks.models)
    } else {
      next = NowPlaying.tracks.models[_.indexOf(NowPlaying.tracks.models, this.track) + 1]
    }

    if (next === this.track) {
      this.seek(0)
    } else {
      next.play()
    }
  },
  
  prev: function() {
    var self = this
      , prev = null
    
    if (this.loading || this.state == 3 || this.tryRepeat() || this.trySeek()) {
      return
    }
    
    if (Shuffle.get('active')) {
      Shuffle.prev()
      return
    }
    
    this.skipToPrev = true
    if (this.track === _.first(NowPlaying.tracks.models) || _.isUndefined(this.track)) {
      prev = _.last(NowPlaying.tracks.models)
    } else {
      prev = NowPlaying.tracks.models[_.indexOf(NowPlaying.tracks.models, this.track) - 1]
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
    if (this.repeat && this.track) {
      // TODO fix this up
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
    $('#volume-bar .fill').width(volume + '%')
    
    var $volumeIcon = $('#volume div')
    $volumeIcon.removeClass('icon-volume-off')
    $volumeIcon.removeClass('icon-volume-down')
    $volumeIcon.removeClass('icon-volume-up')
    if (volume == 0) {
      $volumeIcon.addClass('icon-volume-off')
    } else if (volume <= 50) {
      $volumeIcon.addClass('icon-volume-down')
    } else {
      $volumeIcon.addClass('icon-volume-up')
    }
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
    this.track.youtubeError(parseInt(error))
  },
  
  search: function(track) {
    var query = '"' + track.artist + '" "' + track.name + '"'
    if (!this.loading) {
      this.loading = true

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

  jumpTo: function() {
    $body.scrollTop(0)
  },

  // TODO replace filters as front-end rather than modifying potential search results
  filters: function(str) {
    var filters = ''
    //if (!str.match(/instrumental/i)) filters += ' -instrumental'
    //if (!str.match(/chipmunk/i)) filters += ' -chipmunk'
    //if (!str.match(/karaoke/i)) filters += ' -karaoke'
    //if (!str.match(/cover/i)) filters += ' -cover'
    //if (!str.match(/remix/i)) filters += ' -remix'
    //if (!str.match(/live/i)) filters += ' -live'
    return filters
  }

})

View.Controls = Backbone.View.extend({
  el: $('#controls'),
  
  template: jade.compile($('#controls-template').text()),
  
  initialize: function() {
    _.bindAll(this, 'updateTimer', 'dragVolumeStop', 'dragTimerStop')
    this.render()
    
    _.defer(function() {
      setInterval(Controls.updateTimer, 333)
    })
  },
  
  render: function() {
    this.$el.html(this.template())
    this.volumeRefresh()
    this.renderRepeat()
    this.renderShuffle()
    this.renderRadio()
    this.renderFullscreen()
  },
  
  events: {
    'click #play-pause' : 'playPause',
    'click #next'       : 'next',
    'click #prev'       : 'prev',
    'click #repeat'     : 'toggleRepeat',
    'click #shuffle'    : 'toggleShuffle',
    'click #radio'      : 'toggleRadio',
    'click #fullscreen' : 'toggleFullscreen',
    'click #volume'     : 'toggleMute',
    'mousedown #volume-bar'  : 'dragVolume',
    'mousedown #timer'       : 'dragTimer'
  },

  volumeRefresh: function() {
    if (Video.player) {
      Video.volume(Video.player.getVolume())
    }
  },
  
  playPause: function(e) {
    if (Video.playing()) {
      Video.pause()
    } else {
      Video.play()
    }
  },

  toggleMute: function() {
    var value = Video.player.getVolume()
    if (value) {
      Video.volume(0)
    } else {
      Video.volume(this.lastVolume || 50)
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
      this.$el.find('#timer').addClass('active')
    } else {
      this.$el.find('#timer').removeClass('active')
    }
  },
  
  updateTimer: function() {
    var load = Video.loadRatio()
      , play = Video.playRatio()
    
    if (!Video.stopped && load > 0 && load != Infinity) {
      this.$el.find('#timer .fill').width(load * 100 + '%')
      this.$el.find('#timer .track').width(play * 100 + '%')
      this.$el.find('#time-read .time-current').html(this.humanizeSeconds(Video.currentTime()))
      this.$el.find('#time-read .time-duration').html(' / ' + this.humanizeSeconds(Video.duration()))
    } else {
      this.$el.find('#timer .fill').width(0)
      this.$el.find('#timer .track').width(0)
      this.$el.find('#time-read .time-current, #time-read .time-duration').html('')
    }
    if (Video.fullscreen) {
      $body.scrollTop(0)
    }
  },
  
  next: function() {
    Video.next()
  },
  
  prev: function() {
    Video.prev()
  },
  
  toggleRepeat: function() {
    if (this.$el.find('#repeat').hasClass('disabled')) {
      return
    }
    Video.repeat = !Video.repeat
    this.renderRepeat()
  },
  
  renderRepeat: function() {
    Video.repeat ? this.$el.find('#repeat').removeClass('off') : this.$el.find('#repeat').addClass('off')
  },
  
  toggleShuffle: function() {
    if (this.$el.find('#shuffle').hasClass('disabled')) {
      return
    }
    if (Shuffle.get('active')) {
      Shuffle.disable()
    } else {
      Shuffle.enable()
    }
    this.renderShuffle()
  },
  
  renderShuffle: function() {
    Shuffle.get('active') ? this.$el.find('#shuffle').removeClass('off') : this.$el.find('#shuffle').addClass('off')
  },
  
  toggleFullscreen: function() {
    if (Video.fullscreen) {
      this.fullscreenDisable()
    } else {
      this.fullscreenEnable()
    }
    windowResized()
    //this.update() ???
  },
  
  fullscreenDisable: function() {
    Video.fullscreen = false
    this.renderFullscreen()
    $body.removeClass('fullscreen').width('').height('')
    $('#video').width('').height('')
    _.defer(function() {
      Video.jumpTo()
    })
  },
  
  fullscreenEnable: function() {
    Video.fullscreen = true
    this.renderFullscreen()
    $body.addClass('fullscreen')
    _.defer(function() {
      $body.scrollTop(0)
    })
  },
  
  renderFullscreen: function() {
    var $fullscreen = this.$el.find('#fullscreen div')
    Video.fullscreen ? $fullscreen.addClass('icon-resize-small') : $fullscreen.removeClass('icon-resize-small')
  },
  
  toggleRadio: function() {
    if (this.$el.find('#radio').hasClass('disabled')) {
      return
    }
    if (Radio.get('active')) {
      Radio.disable()
    } else {
      Radio.enable()
    }
    this.renderRadio()
  },
  
  renderRadio: function() {
    if (Radio.get('active')) {
      this.$el.find('#radio').removeClass('off')
      this.$el.find('#shuffle').addClass('disabled').addClass('off')
      this.$el.find('#repeat').addClass('disabled').addClass('off')
    } else {
      this.$el.find('#radio').addClass('off')
      this.$el.find('#shuffle').removeClass('disabled')
      this.$el.find('#repeat').removeClass('disabled')
    }
  },
  
  dragVolume: function(e) {
    var $target = $(e.target)
    if ($target.parents('#volume-bar').length) {
      $target = $target.parents('#volume-bar')
    }  
    this.dragVolumeStop()
    this.dragVolumeStart($target, e)
  },
  
  dragVolumeStart: function($target, e) {
    this.dragger = this.dragVolumeFill($target, Video.volume)
    this.dragger(e)
    $(document).on('mouseup', this.dragVolumeStop)
    $(document).on('mousemove', this.dragger)
    $body.addClass('dragging')
  },
  
  dragVolumeFill: function($target, callback) {
    return function(e, secondCallback) {
      var w = $target.width()
        , boundedPosition = Math.min(Math.max(e.clientX - $target.offset().left, 0), w) * 100 / w
      callback(boundedPosition)
      if (!_.isUndefined(secondCallback)) {
        secondCallback(boundedPosition)
      }
    }
  },
  
  dragVolumeStop: function(e) {
    $body.removeClass('dragging')
    if (e) {
      this.dragger(e, function(lastVolume) {
        if (lastVolume) {
          Controls.lastVolume = lastVolume
        }        
      })
    }
    $(document).off('mousemove')
    $(document).off('mouseup')
    this.dragger = null
  },
  
  dragTimer: function(e) {
    if ($(e.target).is('#timer')) {
      return false
    }  
    this.dragTimerStop()
    this.dragTimerStart($('#timer .fill'), e)
  },
  
  dragTimerStart: function($target, e) {
    this.dragger = this.dragTimerFill($target, $('#timer').width(), Video.duration(), Video.seek)
    this.dragger(e)
    $(document).on('mouseup', this.dragTimerStop)
    $(document).on('mousemove', _.debounce(this.dragger, 300))
    $body.addClass('dragging')
  },
  
  dragTimerFill: function($target, timerWidth, maxTime, callback) {
    return function(e) {
      var w = $target.width()
        , boundedPosition = Math.min(Math.max(e.clientX - $target.offset().left, 0), w) * maxTime / timerWidth
      callback(boundedPosition)
    }
  },
  
  dragTimerStop: function(e) {
    $body.removeClass('dragging')
    $(document).off('mousemove')
    $(document).off('mouseup')
    this.dragger = null
  },

  humanizeSeconds: function(s) {
    var minutes = Math.floor(s / 60),
        seconds = Math.floor(s % 60)
    if (seconds < 10) {
      seconds = "0" + seconds
    }
    return minutes + ":" + seconds
  }
  
})


;
