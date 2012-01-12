$(function() {


  Model.Artist = Backbone.Model.extend({
  });


  View.SearchArtist = View.SearchResult.extend({
    template: Handlebars.compile($('#search-artist-template').html())
  });


  View.SearchArtists = View.SearchResults.extend({
    className: 'artists',
    viewObject: View.SearchArtist,
    viewInner: 'ul',
    template: _.template($('#search-artists-template').html())
  });


  Collection.Artists = Backbone.Collection.extend({
    model: Model.Artist
  });


});
