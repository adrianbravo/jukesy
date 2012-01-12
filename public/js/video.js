$(function() {


  //
  // Connects to the chromeless player and uses bindings for controls.
  //
  Model.Video = Backbone.Model.extend({
    initialize: function() {
      swfobject.embedSWF('http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=video&wmode=transparent', // swfUrlStr
                         'video', // replaceElemIdStr
                         '540',   // width
                         '320',   // height
                         '8',     // swfVersionStr
                         null,    // xiSwfUrlStr
                         null,    // flashVarsObj
                         { allowScriptAccess: 'always', wmode: 'transparent' },  // parameters
                         { id: 'video' }                                         // attributes
      )

      _.bindAll(this, 'toggleFullscreen')
    },

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

    loadRatio: function() {
      return this.player.getVideoBytesLoaded() / this.player.getVideoBytesTotal()
    },

    playRatio: function() {
      return this.player.getCurrentTime() / this.player.getDuration()
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

    load: function(id) {
      if (this.state == 3) {
        return
      }
      this.player.loadVideoById(id)
    },

    pause: function() {
      this.player.pauseVideo()
    },

    stop: function() {
      this.stopped = true
      this.pause()
      if (window.NowPlayingTrack) {
        $(NowPlayingTrack.view.el).removeClass('playing')
        NowPlayingTrack = null
      }
      Controls.render()
      this.onStateChange(-1)
    },

    play: function() {
      if (!NowPlaying.tracks().length) {
        return false
      }
      this.stopped = false
      this.player.playVideo()
      if (this.state != 1) {
        this.seek(Math.floor(this.currentTime()))
      }
    },

    next: function() {
      var next = false
      _.each(NowPlaying.tracks(), function(trackModel) {
        if (next == true) {
          next = trackModel
        }
        if (window.NowPlayingTrack === trackModel) {
          next = true
        }
      })

      if (next == true || next == false) {
        next = _.first(NowPlaying.tracks())
      }

      next.play()
    },
    
    pauseNext: function() {
      this.pauseNextState = true
    },
    
    isNotPlaying: function() {
      return this.state != 1
    },

    prev: function() {
      if (this.currentTime() > 2) {
        this.seek(0)
        return
      }

      this.skipToPrev = true

      var prev = null, prevSet = false
      if (window.NowPlayingTrack === _.first(NowPlaying.tracks())) {
        prev = _.last(NowPlaying.tracks())
      } else {
        _.each(NowPlaying.tracks(), function(trackModel) {
          if (window.NowPlayingTrack === trackModel) prevSet = true
          if (!prevSet) prev = trackModel
        })
      }

      prev.play()
    },

    onStateChange: function(state) {
      this.state = state
      if (this.state == -1) {
        Controls.updateSongInfo()
      }
      if (this.state == 0) {
        this.next()
      }
      if (this.state == 1 && this.pauseNextState) {
        this.pauseNextState = false
        this.pause()
      }
      this.player.setPlaybackQuality('hd720')
      window.Controls.updatePlay()
    },

    onError: function(error) {
      if (error == '150') {
        NowPlayingTrack.videos = _.rest(NowPlayingTrack.videos)
        NowPlayingTrack.play()
      }
    },

    error: function() {
      $(NowPlayingTrack.view.el).addClass('error')
      if (this.lastError == NowPlayingTrack) {
        return
      }
      this.lastError = NowPlayingTrack
      this.skipToPrev ? this.prev() : this.next()
    },

    // TODO move this to the track model.
    setTrackVideoIds: function(data) {
      if (!data.feed.entry) {
        window.NowPlayingTrack.videos = []
      } else {
        window.NowPlayingTrack.videos = _.map(data.feed.entry, function(entry) {
          return _.last(entry.id.$t.split('/'))
          /*
          VideoResults.reset()
          _.each(data.feed.entry, function(video) {
            VideoResults.add({
              author      : video.author[0].name.$t,
              title       : video.title.$t,
              description : video.content.$t,
              youtube_id  : _.last(video.id.$t.split('/')),
            })
          })
          */
        })
      }
      this.loading = false
      $('#controls #play').removeClass('loading')
      window.NowPlayingTrack.play()
    },

    searchByArtistAndTrack: function(artist, track, callback) {
      this.search('"' + artist + '" "' + track + '"', callback)
    },

    search: function(query, callback) {
      if (!this.loading) {
        this.loading = true
        $('#controls #play').addClass('loading')

        var url = "http://gdata.youtube.com/feeds/api/videos?" + $.param({
            alt           : 'json-in-script',
            category      : 'Music',
            vq            : (query + this.filters(query)),
            orderby       : 'relevance',
            'start-index' : 1,
            'max-results' : 20,
            format        : 5,
            callback      : callback
        })

        $.getScript(url)
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


})