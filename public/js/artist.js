$(function() {

  Model.Artist = Backbone.Model.extend({
  });

  View.SearchArtist = View.SearchResult.extend({
    template: _.template($('#search-artist-template').html()),
  });

  View.SearchArtists = View.SearchResults.extend({
    el: '#search .artists',

    viewObject: View.SearchArtist,
    viewInner: 'ul',

    template: _.template($('#search-artists-template').html())
  });

  Collection.Artists = Backbone.Collection.extend({
    model: Model.Artist
  });

});
