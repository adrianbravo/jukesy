
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

  if (!Backbone.history.start({ pushState: true })) {
    Router.navigate(window.location.pathname, true);
  }

  Controls.setUpdate();
}

var windowResized = function() {
  if ($('body').hasClass('fullscreen')) {
    var $video = $('#video');
    $video.height($(window).height() - $video.position().top);
    Video.player.setSize($video.width(), $video.height());
  }
};

$(function() {
  // Mustache-style templates, e.g. {{ artist }}
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g,
    evaluate    : /<%(.+?)%>/g
  };

  $(window).resize(_.debounce(windowResized));
});

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
