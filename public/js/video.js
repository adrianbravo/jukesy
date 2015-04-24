
Model.Video = Backbone.Model.extend({
  initialize: function() {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    _.bindAll(this, 'volume', 'seek', 'stop');

    this.quality = 'hd720';
    _.defer(function() {
      window.Controls = new View.Controls();
    });
  },

  toggleQuality: function() {
    this.quality = (this.quality == 'hd720') ? 'medium' : 'hd720'
    this.player.setPlaybackQuality(this.quality)
    Meow.render({
      message: 'Set video quality to ' + this.quality,
      type: 'info'
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
      NowPlaying.tracks.next()
    }
    if (this.state == 1 && this.pauseNextState) {
      this.pauseNextState = false
      this.pause()
    }

    this.player.setPlaybackQuality(this.quality)
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
      NowPlaying.tracks.next()
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
    this.pauseNextState = true;
  },

  volume: function(volume) {
    this.player.setVolume(volume);
    $('#volume-bar .fill').width(volume + '%');

    var $volumeIcon = $('#volume div');
    $volumeIcon.removeClass('icon-volume-off');
    $volumeIcon.removeClass('icon-volume-down');
    $volumeIcon.removeClass('icon-volume-up');
    if (volume == 0) {
      $volumeIcon.addClass('icon-volume-off');
    } else if (volume <= 50) {
      $volumeIcon.addClass('icon-volume-down');
    } else {
      $volumeIcon.addClass('icon-volume-up');
    }
  },

  seek: function(time) {
    if (this.player) {
      this.player.seekTo(time, false);
    }
  },

  duration: function() {
    return this.player.getDuration();
  },

  currentTime: function() {
    return this.player.getCurrentTime();
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
    var query = '"' + track.artist + '" "' + track.name + '"';
    if (!this.loading) {
      this.loading = true;

      var url = "https://www.googleapis.com/youtube/v3/search?" + $.param({
          key             : 'AIzaSyCWqOB4EY4ro6LWNRhoFrMYVOorI8G0Q-U',
          part            : 'id',
          type            : 'video',
          order           : 'relevance',
          maxResults      : '20',
          videoEmbeddable : 'true',
          q               : (query + this.filters(query)),
          callback        : 'window.setTrackVideoIds'
      });

      $.getScript(url);
      return true;
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
    _.bindAll(this, 'updateTimer', 'dragVolumeStop', 'dragTimerStop', 'toggleQuality')
    this.render()
    $('#quality').on('click', this.toggleQuality)

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
    this.renderQuality()
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
    NowPlaying.tracks.next()
  },

  prev: function() {
    NowPlaying.tracks.prev()
  },

  toggleQuality: function() {
    Video.toggleQuality()
    this.renderQuality()
  },

  renderQuality: function() {
    $('#quality').html(Video.quality == 'hd720' ? 'HD' : 'MED')
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
    if (Shuffle.active) {
      Shuffle.disable()
    } else {
      Shuffle.enable()
    }
    this.renderShuffle()
  },

  renderShuffle: function() {
    Shuffle.active ? this.$el.find('#shuffle').removeClass('off') : this.$el.find('#shuffle').addClass('off')
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
    if (Radio.active) {
      Radio.disable()
    } else {
      Radio.enable()
    }
    this.renderRadio()
  },

  renderRadio: function() {
    if (Radio.active) {
      this.$el.find('#radio').removeClass('off')
      this.$el.find('#shuffle').addClass('disabled').addClass('off')
    } else {
      this.$el.find('#radio').addClass('off')
      this.$el.find('#shuffle').removeClass('disabled')
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
