$(function() {

  Model.Artist = Backbone.Model.extend({
  });

  View.Artist = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#search-artist-template').html()),

    initialize: function() {
      this.render();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  View.SearchArtists = Backbone.View.extend({
    el: '#search .artists',

    tagName: 'ul',

    template: _.template($('#search-artists-template').html()),

    initialize: function() {
      this.render();
      this.collection.bind('add', this.addModel);
    },

    addModel: function(model) {
      var view = new View.Artist({ model : model });
      $(this.view.el).append(view.el);
    },

    render: function() {
      var count = this.collection.models.length;
      $(this.el).html(this.template({ count: this.collection.models.length }));
    }
  });

  Collection.Artists = Backbone.Collection.extend({
    model: Model.Artist
  });

});
