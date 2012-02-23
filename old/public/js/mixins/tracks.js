$(function(){


  //
  // Handles ability to mark tracks as selected through clicks
  //
  Mixins.TrackSelection = {
    toggleSelect: function(e) {
      if (e.shiftKey) {
        this.fillSelected($(this.el), $(window.lastSelected));
      } else if (!(e.altKey || e.metaKey)) {
        if (e.type == 'contextmenu' && $(this.el).hasClass('selected')) {
        } else {
          $(this.el).toggleClass('selected').siblings().removeClass('selected');
        }
      } else {
        $(this.el).toggleClass('selected');
      }
      
      if (e.type == 'contextmenu') {
        $(this.el).addClass('selected')
      }
      window.lastSelected = this.el;
    },

    fillSelected: function($track1, $track2) {
      if (!$track1 || !$track2) {
        return;
      }
      if ($track1 == $track2) {
        $track1.addClass('selected');
      } else if ($track1.index() > $track2.index()) {
        $track1.prevUntil($track2).addClass('selected');
      } else if ($track2.index() > $track1.index()) {
        $track2.prevUntil($track1).addClass('selected');
      }
      $track1.addClass('selected');
      $track2.addClass('selected');
    }
  };


});
