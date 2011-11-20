$(function() {

  Model.Album = Backbone.Model.extend({
  });

  View.SearchAlbum = View.SearchResult.extend({
    template: _.template($('#search-album-template').html()),
  });

  View.SearchAlbums = View.SearchResults.extend({
    el: '#search .albums',

    template: _.template($('#search-albums-template').html()),

    addModel: function(model) {
      var view = new View.SearchAlbum({ model : model });
      $(this.view.el).find('ul').append(view.el);
    }
  });

  Collection.Albums = Backbone.Collection.extend({
    model: Model.Album
  });

});
