// Underscore mixins
_.mixin({
  capitalize: function(string) {
    if (!_.isString(string)) {
      string = ''
    }
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
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
  Video.volume(100)
  
  //Video.load('lxhk-cWQbrs')

  // Set up the router and backbone history.
  //window.Router = new AppRouter()
  //if (!Backbone.history.start()) {
  //  Router.navigate(window.location.pathname, true)
  //}

  // Start updater for controls (refreshes timer, etc.)
  //Video.setUpdate()
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