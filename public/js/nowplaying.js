$(function() {


  //
  // Holds reference to the collection of tracks that are currently being played.
  //
  Model.NowPlaying = Backbone.Model.extend({
    initialize: function() {
      this.setPlaylist(new Model.Playlist());
    },

    tracks: function() {
      return this.playlist.get('tracks').models;
    },

    setPlaylist: function(playlist) {
      var self = this;

      self.playlist = playlist;
      self.buildTrackViews(self.tracks());
      self.view = new View.NowPlaying({ model: self.playlist });

       // TODO pseudostop
      if (Video.player) {
        Video.pause();
      }
      if (self.tracks()[0]) {
        self.tracks()[0].play();
      }
    },

    // TODO optimize, verify old track.view makes it to garbage collection?
    buildTrackViews: function(tracks) {
      _.each(tracks, function(track) {
        track.view = new View.Track({ model: track });
      });
    },

    add: function(tracks, options) {
      var self = this;

      self.playlist.get('tracks').add(tracks);
      self.buildTrackViews(tracks);

      if ($(NowPlaying.view.el).is('#main.now-playing')) {
        self.view.render();
      }

      if (!_.isUndefined(window.NowPlayingTrack) && _.include(['play', 'next'], options.method)) {
        if (options.method == 'play') {
          tracks[0].play();
        }
      } else {
        tracks[0].play();
      }
    }
  });


  //
  // Simple extension of playlists with a custom class name.
  //
  View.NowPlaying = View.Playlist.extend({
    className: 'now-playing'
  });


});
