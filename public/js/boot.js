// Underscore mixins
_.mixin({
  capitalize: function(string) {
    string = '' + string;
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },
  plural: function(count, singular, plural) {
    return Math.abs(count) == 1 ? singular : plural;
  },
  clean: function(str) {
    return _s.strip((''+str).replace(/\s+/g, ' '));
  }
});

window.Collection = {};
window.Model = {};
window.View = {};
window.Mixins = {};

// Called when youtube chromeless player is ready
function onYouTubePlayerReady(e) {
  // Set the video player elements and bind its change and error events.
  Video.player = e.target;
  Video.volume(50);
}

function onYouTubeIframeAPIReady() {
  var player = new YT.Player('video', {
    height: '270',
    width: '480',
    playerVars: {
      controls: 0
    },
    events: {
      onReady: onYouTubePlayerReady,
      onStateChange: function() { window.Video.onStateChange(); },
      onError: function() { window.Video.onError(); }
    }
  });
}

// Redraws on resize
var windowResized = function() {
  if (window.Controls) {
    //Controls.updateTimer()
  }

  if (window.Video && Video.fullscreen) {
    var $video = $('#video');
    $video.height($(window).height() - parseInt($('#controls').height(), 10));
    $video.width($(window).width());
    $body.width($video.width());
    $body.height($video.height());
    Video.player.setSize($video.width(), $video.height());
  }
};

function urlTrack(artist, track) {
  return '/artist/' + encodeURIComponent(artist) + '/track/' + encodeURIComponent(track)
}

function urlAlbum(artist, album) {
  return '/artist/' + encodeURIComponent(artist) + '/album/' + encodeURIComponent(album)
}

function urlArtist(artist) {
  return '/artist/' + encodeURIComponent(artist)
}

function newNowPlaying() {
  var playlist = new Model.Playlist()
  Playlists.add([ playlist ])
  playlist.setNowPlaying()
}


;
