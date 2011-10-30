$(function() {

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
      );

      _.bindAll(this, 'toggleFullscreen', 'fullscreenOff');
    },

    fullscreenOff: function() {
      if (this.fullscreen) this.toggleFullscreen();
    },

    toggleFullscreen: function() {
      if (this.fullscreen) {
        this.fullscreen = false;
        $('#fullscreen').removeClass('off');
        $('body').removeClass('fullscreen');
        $('#video').width('').height('');
      } else {
        this.fullscreen = true;
        $('#fullscreen').addClass('off');
        $('body').addClass('fullscreen');
      }
      windowResized();
      Controls.update();
    },

    bytesRatio: function() {
      return this.player.getVideoBytesLoaded() / this.player.getVideoBytesTotal();
    },

    timeRatio: function() {
      return this.player.getCurrentTime() / this.player.getDuration();
    },

    timers: function() {
      var current = Math.floor(this.player.getCurrentTime()),
          remaining = Math.ceil(this.player.getDuration() - current);

      return [
        this.humanizeSeconds(current),
        this.humanizeSeconds(remaining)
       ];
    },

    timeRemaining: function() {
    },

    humanizeSeconds: function(s) {
      var minutes = Math.floor(s / 60);
      var seconds = Math.floor(s % 60);
      if (seconds < 10) seconds = "0" + seconds;
      return minutes + ":" + seconds;
    },

    volume: function(volume) {
      this.player.setVolume(volume);
    },

    seek: function(time) {
      this.player.seekTo(time, false);
    },

    duration: function() {
      return this.player.getDuration();
    },

    currentTime: function() {
      return this.player.getCurrentTime();
    },

    hideBadge: function() {
      window.Controls.$songBadge.stop().css('opacity', '').hide();
    },

    showBadge: function() {
      window.Controls.$songBadge.stop().css('opacity', '').show();
    },

    load: function(id) {
      if (this.state == 3) return;

      clearTimeout(this.showBadgeTimeout);
      clearTimeout(this.hideBadgeTimeout);
      this.hideBadge();

      // set timeout to show name + track
      var self = this;
      this.showBadgeTimeout = setTimeout(function() {
        self.showBadge();
        self.hideBadgeTimeout = setTimeout(function() {
          window.Controls.$songBadge.animate({ opacity: 0 }, 1000, function() {
            window.Video.hideBadge();
          });
        }, 4000);
      }, 1000);

      // in timeout: display element (unset any css too), wait 2s, animate to opacity 0, 
      this.player.loadVideoById(id);
    },

    pause: function() {
      this.player.pauseVideo();
    },

    play: function() {
      this.player.playVideo();
      if (this.state != 1) this.seek(Math.floor(this.currentTime()));
    },

    next: function() {
      var next = false;
      _.each(Playlist.tracks, function(trackModel) {
        if (next == true) next = trackModel;
        if (window.currentlyPlayingTrackModel === trackModel) next = true;
      });
      if (next == true || next == false) next = Playlist.tracks[0];

      next.play();
    },

    prev: function() {
      if (this.currentTime() > 2) {
        this.seek(0);
        return;
      }

      this.skipToPrev = true;

      var prev = null, prevSet = false;
      if (window.currentlyPlayingTrackModel === _.first(Playlist.tracks)) {
        prev = _.last(Playlist.tracks);
      } else {
        _.each(Playlist.tracks, function(trackModel) {
          if (window.currentlyPlayingTrackModel === trackModel) prevSet = true;
          if (!prevSet) prev = trackModel
        });
      }

      prev.play();
    },

    on_state_change: function(state) {
      this.state = state;
      if (this.state == -1) {
        Controls.$songInfo.html('');
        Controls.$songBadge.html('');
      }
      if (this.state == 0) this.next();
      this.player.setPlaybackQuality('hd720');
      window.Controls.updatePlay();
    },

    on_error: function(error) {
      if (error == '150') {
        window.currentlyPlayingTrackModel.videos = _.rest(window.currentlyPlayingTrackModel.videos);
        window.currentlyPlayingTrackModel.play();
      }
    },

    error: function() {
      $(window.currentlyPlayingTrackModel.view.el).addClass('error');
      this.skipToPrev ? this.prev() : this.next();
    },

    setTrackVideoIds: function(data) {
      if (!data.feed.entry) {
        window.currentlyPlayingTrackModel.videos = [];
      } else {
        window.currentlyPlayingTrackModel.videos = _.map(data.feed.entry, function(entry) {
          return _.last(entry.id.$t.split('/'));
          /*
          VideoResults.reset();
          _.each(data.feed.entry, function(video) {
            VideoResults.add({
              author      : video.author[0].name.$t,
              title       : video.title.$t,
              description : video.content.$t,
              youtube_id  : _.last(video.id.$t.split('/')),
            });
          });
          */
        });
      }
      this.loading = false;
      $('#controls #play').removeClass('loading');
      window.currentlyPlayingTrackModel.play();
    },

    searchByArtistAndTrack: function(artist, track, callback) {
      this.search('"' + artist + '" "' + track + '"', callback);
    },

    search: function(query, callback) {
      if (!this.loading) {
        this.loading = true;
        $('#controls #play').addClass('loading');

        var url = "http://gdata.youtube.com/feeds/api/videos?" + $.param({
            alt           : 'json-in-script',
            category      : 'Music',
            vq            : (query + this.filters(query)),
            orderby       : 'relevance',
            'start-index' : 1,
            'max-results' : 20,
            format        : 5,
            callback      : callback,
        });

        $.getScript(url);
      }
    }, 

    filters: function(str) {
      var filters = ''; 
      if (!str.match(/instrumental/i)) filters += ' -instrumental';
      if (!str.match(/chipmunk/i)) filters += ' -chipmunk';
      if (!str.match(/karaoke/i)) filters += ' -karaoke';
      if (!str.match(/cover/i)) filters += ' -cover';
      if (!str.match(/remix/i)) filters += ' -remix';
      if (!str.match(/live/i)) filters += ' -live';
      return filters;
    }, 
  });


});



