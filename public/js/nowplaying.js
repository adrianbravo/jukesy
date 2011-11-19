$(function() {

  Model.NowPlaying = Backbone.Model.extend({
    initialize: function() {
      var self = this;
      self.setPlaylist(new Model.Playlist());
    },

    tracks: function() {
      return this.playlist.get('tracks').models;
    },

    setPlaylist: function(playlist) {
      var self = this;
      self.playlist = playlist;

      _.each(self.tracks(), function(track) {
        track.view = new View.PlaylistTrack({ model: track });
      });

      self.view = new View.NowPlaying({ model: self.playlist });

      if (Video.player) Video.pause(); // TODO pseudostop
      if (self.tracks()[0]) self.tracks()[0].play();
    },

    // Add a track to the model.
    add: function(tracks, options) {
      var self = this;

      if (!_.isUndefined(window.nowPlayingTrack) && _.include(['play', 'next'], options.method)) {
        var i = _.indexOf(self.tracks(), nowPlayingTrack);
        self.playlist.get('tracks').add(tracks, { at: i + 1 });
      } else {
        self.playlist.get('tracks').add(tracks);
      }

      _.each(tracks, function(track) {
        track.view = new View.PlaylistTrack({ model: track });
      });

      self.view.render();

      if (!_.isUndefined(window.nowPlayingTrack) && _.include(['play', 'next'], options.method)) {
        if (options.method == 'play') tracks[0].play();
      } else {
        tracks[0].play();
      }
    }

  });

  View.NowPlaying = View.Playlist.extend({
    el: $('#now-playing')
  });

});
