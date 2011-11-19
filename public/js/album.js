$(function() {

  Model.Album = Backbone.Model.extend({
  });

  View.SearchAlbums = Backbone.View.extend({
    el: '#search .albums',

    tagName: 'ul',

    template: _.template($('#search-albums-template').html()),

    initialize: function() {
      console.log('search albums view');
      this.render();
    },

    render: function() {
      $(this.el).replaceWith(this.template({ count: this.collection.models.length }));
    }
  });

  Collection.Albums = Backbone.Collection.extend({
    model: Model.Album
  });

});

