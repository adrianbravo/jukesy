$(function() {


  Model.Album = Backbone.Model.extend({
  });


  View.SearchAlbum = View.SearchResult.extend({
    template: Handlebars.compile($('#search-album-template').html())
  });


  View.SearchAlbums = View.SearchResults.extend({
    className: 'albums',
    viewObject: View.SearchAlbum,
    viewInner: 'ul',
    template: Handlebars.compile($('#search-albums-template').html())
  });


  Collection.Albums = Backbone.Collection.extend({
    model: Model.Album
  });


});
