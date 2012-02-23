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
    template: Handlebars.compile($('#search-artists-template').html())
  });


  Collection.Artists = Backbone.Collection.extend({
    model: Model.Artist
  });


});
