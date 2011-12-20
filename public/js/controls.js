$(function() {

  //
  // Ties visible controls mostly to the Video model.
  //
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
      'click #mute'             : 'toggleMute'
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
      this.$timerPlayed  = $('#timer_current');
      this.$volume       = $('#volume');
      this.lastMaxVolume = 50;

      this.$volume.slider({
        range : 'min',
        value : this.lastMaxVolume,
        min   : 0,
        max   : 100,

        slide: function(event, ui) {
          self.updateVolume(ui.value);
        },

        change: function(event, ui) {
          self.updateVolume(ui.value);
        },

        stop: function(event, ui) {
          if (ui.value > 0) {
            self.lastMaxVolume = ui.value;
          }
        }
      });
    },

    render: function() {
      $(this.el).html(this.template());
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
      Video.prev();
    },

    next: function() {
      Video.next();
    },

    play: function() {
      Video.play();
    },

    pause: function() {
      Video.pause();
    },

    seek: function(e) {
      Video.seek(Video.duration() * e.offsetX / this.$timer.width());
    },

    // ended (0), paused (2), video cued (5) or unstarted (-1).
    updatePlay: function() {
      if (window.Video.state == 1 || Video.state == 3) {
        $('#play').addClass('pause');
      } else {
        $('#play').removeClass('pause');
      }
    },

    update: function() {
      var loadRatio = Video.loadRatio(),
          playRatio = Video.playRatio();

      if (_.isNaN(playRatio) || _.isNaN(loadRatio)) {
        this.$timerLoaded.width(0);
        this.$timerPlayed.width(0);
        this.$timerLeft.html('');
        this.$timerRight.html('');
      } else {
        var time = Video.timers();
        this.$timerLoaded.width(this.$timer.width() * loadRatio);
        this.$timerPlayed.width(this.$timer.width() * playRatio);
        this.$timerLeft.html(time[0]);
        this.$timerRight.html(time[1]);
      }
    }
  });


});

