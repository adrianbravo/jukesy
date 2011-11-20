$(function() {

  Model.Artist = Backbone.Model.extend({
  });

  View.SearchArtist = View.SearchResult.extend({
    template: _.template($('#search-artist-template').html()),
  });

  View.SearchArtists = View.SearchResults.extend({
    el: '#search .artists',

    template: _.template($('#search-artists-template').html()),

    addModel: function(model) {
      var view = new View.SearchArtist({ model : model });
      $(this.view.el).append(view.el);
    }
  });

  Collection.Artists = Backbone.Collection.extend({
    model: Model.Artist
  });

});
