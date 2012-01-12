$(function() {

  //
  // Allows repositioning of an element respective to a point
  //
  Mixins.Reposition = {
    reposition: function($el, x, y) {
      var w = $el.outerWidth(),
          h = $el.outerHeight(),
          max_w = $(window).width(),
          max_h = $(window).height()
          
      if (x + w > max_w) {
        x -= w
      }
      if (y + h > max_h) {
        y -= h
      }
      $el.css('left', x)
      $el.css('top', y)
    }
  };


});
