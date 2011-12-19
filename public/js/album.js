$(function() {


  Model.Album = Backbone.Model.extend({
  });


  View.SearchAlbum = View.SearchResult.extend({
    template: _.template($('#search-album-template').html())
  });


  View.SearchAlbums = View.SearchResults.extend({
    el: '#search .albums',

    viewObject: View.SearchAlbum,
    viewInner: 'ul',

    template: _.template($('#search-albums-template').html())
  });


  Collection.Albums = Backbone.Collection.extend({
    model: Model.Album
  });


});
