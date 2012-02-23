
// Mustache-style templates, e.g. {{ artist }}
Handlebars.compileSettings = {
  interpolate : /\{\{(.+?)\}\}/g,
  evaluate    : /<%(.+?)%>/g
}

// Underscore mixins
_.mixin({
  f: function() {
    return false
  }
})

// Global stuff.
window.Collection = {}
window.Model = {}
window.View = {}
window.Mixins = {}

//
// YouTube API Player callback executes when the chromeless player is read. The function name cannot be changed.
// This finalizes the boot process from the browser.
//
function onYouTubePlayerReady(id) {
  // Make the app visible. (css for fade effect)
  $('#app').css('opacity', '1.0')

  // Set the video player elements and bind its change and error events.
  Video.player = $('#' + id)[0]
  Video.player.addEventListener('onStateChange', 'Video.onStateChange')
  Video.player.addEventListener('onError', 'Video.onError')

  // TODO localStorage should hold this value and other settings.
  Video.volume(50)

  // Set up the router and backbone history.
  window.Router = new AppRouter()
  if (!Backbone.history.start()) {
    Router.navigate(window.location.pathname, true)
  }

  // Start updater for controls (refreshes timer, etc.)
  Controls.setUpdate()
}

// Fires when the window is resized (through _.debounce, so it only happens when input stops).
var windowResized = function() {
  if ($('body').hasClass('fullscreen')) {
    // Resize the fullscreen video through css and youtube chromeless player api.
    var $video = $('#video')
    $video.height($(window).height() - parseInt($video.css('bottom')))
    Video.player.setSize($video.width(), $video.height())
  } else {
    // Redraw the quickbar's scrollbar.
    var jsp = $('#quickbar').data('jsp')
    if (jsp) {
      jsp.reinitialise()
    }
  }
}


// Hijack all link clicks to use data-href instead of href.
$('a').live('click', function(e) {
  var $self = $(this)
  if (!$self.attr('href')) {
    Router.navigate($self.attr('data-href'), true)
  }
})

// TODO find a better place for this shit.
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}