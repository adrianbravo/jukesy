// Underscore mixins
_.mixin({
  capitalize: function(string) {
    if (!_.isString(string)) {
      string = ''
    }
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
  },
  plural: function(count, singular, plural) {
    return count == 1 ? singular : plural
  }
})

window.Collection = {}
window.Model = {}
window.View = {}
window.Mixins = {}

// Called when youtube chromeless player is ready
function onYouTubePlayerReady(id) {
  // Set the video player elements and bind its change and error events.
  Video.player = $('#' + id)[0]
  Video.player.addEventListener('onStateChange', 'Video.onStateChange')
  Video.player.addEventListener('onError', 'Video.onError')
  Video.volume(50)
}

// Redraws on resize
var windowResized = function() {
  if (window.Controls) {
    //Controls.updateTimer()
  }
  
  if (window.Video && Video.fullscreen) {
    var $video = $('#video')
    $video.height($(window).height() - parseInt($('#controls').height()))
    $video.width($(window).width())
    $body.width($video.width())
    $body.height($video.height())
    Video.player.setSize($video.width(), $video.height())
  }
}

// Used to parse cookies from document
function cookieParser() {
  var ca = document.cookie.split(';')
    , len = ca.length
    , Cookies = {}

  for (var i = 0; i < len; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length)
    }

    var kv = c.split('=')
    try {
      var value = JSON.parse(unescape(kv[1]))
      Cookies[kv[0]] = value
    } catch(e) {
      Cookies[kv[0]] = kv[1]
    }
  }
  window.Cookies = Cookies
}

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
  /*
  var playlists = _.chain(Playlists.models)
                      .filter(function(playlist) { return playlist.get('sidebar') })
                      .sortBy(function(playlist) { return (playlist.isNew() ? '1' : '0') + playlist.get('name').toLowerCase() })
                      .map(function(playlist) { return playlist.toJSON() })
                      .value()
                      */
  var playlist = new Model.Playlist()
  Playlists.add([ playlist ])
  playlist.setNowPlaying()
}
