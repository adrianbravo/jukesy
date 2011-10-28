
window.Collection = {};
window.Model = {};
window.View = {};

// YouTube API Player callback
// The function name cannot be changed.
function onYouTubePlayerReady(id) {
  Video.player = $('#' + id)[0];
  Video.player.addEventListener('onStateChange', 'Video.on_state_change');
  Video.player.addEventListener('onError', 'Video.on_error');
  Video.volume(50); // TODO localStorage this value

  window.Router = new AppRouter();

  if (!Backbone.history.start())
    Router.navigate('/', true);

  Controls.setUpdate();
}

function windowResized() {
  var h = $(window).height(),
      w = $(window).width();

  if (window.Video && window.Video.fullscreen) {
    $('#video').width(w).height(h - $('#footer').outerHeight());
  }
}

$(function() {
  // Mustache-style templates, e.g. {{ artist }}
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g,
    evaluate    : /<%(.+?)%>/g
  };

  $(window).resize(windowResized);
  windowResized();
});

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
