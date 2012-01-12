$(function(){


  Model.Modal = Backbone.Model.extend({
    initialize: function() {
      this.view = new View.Modal({ model: this });
    }
  });


  View.Modal = Backbone.View.extend({
    tagName: 'div',

    templates: {
      modal: Handlebars.compile($('#modal-template').html()),
      login: Handlebars.compile($('#login-template').html())
    },

    initialize: function() {
      this.render();
      $('body').append($(this.el).addClass('modal_wrapper'));
      this.refresh();
    },

    refresh: function() {
      var $modal = $(this.el).find('.modal');
      $modal.css('left', ($(window).width() / 2) - ($modal.width() / 2)).css('top', ($(window).height() / 2) - ($modal.height() / 2));
    },

    render: function() {
      var $outer = $(this.templates.modal()),
          $inner = this.templates[this.model.get('type')]();
      $outer.find('.modal').html($inner);

      $(this.el).html($outer);
      return this;
    }
  });


});
