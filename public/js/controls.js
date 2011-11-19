$(function() {

  View.Controls = Backbone.View.extend({
    el: $('#controls'),

    template         : _.template($('#controls-template').html()),
    songInfoTemplate : _.template($('#song-info-template').html()),

    events: {
      'click #play:not(.pause)' : 'play',
      'click #play.pause'       : 'pause',
      'click #next'             : 'next',
      'click #prev'             : 'prev',
      'click #fullscreen'       : 'toggleFullscreen',
      'click #timer_loaded'     : 'seek',
      'click #mute'             : 'toggleMute',
      //'click #volume'       : 'volume',
    },

    initialize: function() {
      var self = this;
      _.bindAll(this, 'update', 'setUpdate');

      this.render();

      this.$songInfo     = $('#song_info'),
      this.$timer        = $('#timer'),
      this.$timerLeft    = $('#timer_left'),
      this.$timerRight   = $('#timer_right'),
      this.$timerLoaded  = $('#timer_loaded'),
      this.$timerCurrent = $('#timer_current');
      this.$volume       = $('#volume');
      this.lastMaxVolume = 50;

      this.$volume.slider({
        range: 'min',
        value: this.lastMaxVolume,
        min  : 0,
        max  : 100,
        slide: function(event, ui) {
          self.updateVolume(ui.value);
        },
        change: function(event, ui) {
          self.updateVolume(ui.value);
        },
        stop: function(event, ui) {
          if (ui.value > 0) self.lastMaxVolume = ui.value;
        },
      });
    },

    setUpdate: function() {
      this.updateInterval = setInterval(this.update, 100);
    },

    toggleFullscreen: function() {
      Video.toggleFullscreen();
    },

    toggleMute: function(e) {
      if (!_.isUndefined(e)) {
        var volume = (this.mute) ? this.lastMaxVolume : 0;
        this.$volume.slider('value', volume);
        return;
      }

      if (this.mute) {
        this.mute = false;
        $('#mute').removeClass('on');
      } else {
        this.mute = true;
        $('#mute').addClass('on');
      }
    },

    updateVolume: function(volume) {
      if (volume && this.mute) {
        this.toggleMute();
      } else if (!volume && !this.mute) {
        this.toggleMute();
      }
      Video.volume(volume);
    },

    prev: function() {
      window.Video.prev();
    },

    next: function() {
      window.Video.next();
    },

    play: function() {
      window.Video.play();
    },

    pause: function() {
      window.Video.pause();
    },

    seek: function(e) {
      window.Video.seek(window.Video.duration() * e.offsetX / this.$timer.width());
    },

    // ended (0), paused (2), video cued (5) or unstarted (-1).
    updatePlay: function() {
      if (window.Video.state == 1 || window.Video.state == 3) {
        $('#play').addClass('pause');
      } else {
        $('#play').removeClass('pause');
      }
    },

    update: function() {
      var bytesRatio = window.Video.bytesRatio(),
          timeRatio  = window.Video.timeRatio();

      if (_.isNaN(timeRatio) || _.isNaN(bytesRatio)) {
        this.$timerLoaded.width(0);
        this.$timerCurrent.width(0);
        this.$timerLeft.html('');
        this.$timerRight.html('');
      } else {
        this.$timerLoaded.width(this.$timer.width() * bytesRatio);
        this.$timerCurrent.width(this.$timer.width() * timeRatio);
        var time = window.Video.timers();
        this.$timerLeft.html(time[0]);
        this.$timerRight.html(time[1]);
      }
    },

    render: function() {
      $(this.el).html(this.template());
    },

  });

});

