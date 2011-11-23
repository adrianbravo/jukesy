$(function() {

  
  /*
  View.Search = Backbone.View.extend({
    handleMore: function(results) {
      var totalResults = parseInt(results['opensearch:totalResults'])
        , startIndex   = parseInt(results['opensearch:startIndex'])
        , itemsPerPage = parseInt(results['opensearch:itemsPerPage']);

      if (totalResults < startIndex + itemsPerPage) this.el.find('.more').hide();
    }
  });
  */

  View.Search = Backbone.View.extend({
    el: '#main',

    waitstate_template : _.template($('#search-waitstate-template').html()),

    initialize: function() {
      this.render();
    },

    render: function() {
      $('#quickbar .quickbar-inner a').removeClass('active');
      $(this.el).html(this.waitstate_template(this.model.toJSON()));
    }

  });

  Model.Search = Backbone.Model.extend({
    api_key: '75c8c3065db32d805a292ec1af5631a3',

    initialize: function() {
      this.artist = new Collection.Artists();
      this.album  = new Collection.Albums();
      this.track  = new Collection.Tracks();

      this.view = new View.Search({ model: this });

      this.artist.view = new View.SearchArtists({ collection: this.artist });
      this.album.view  = new View.SearchAlbums({ collection: this.album });
      this.track.view  = new View.SearchTracks({ collection: this.track });

      this.artist.page = 1;
      this.album.page  = 1;
      this.track.page  = 1;

      this.query();
    },

    // Debounce will keep the queries from firing off if back/forward is repeatedly pressed.
    query: _.debounce(function(types) {
      var self = this;
      types = types || [ 'artist', 'album', 'track' ];

      _.forEach(types, function(type) {
        var params = {
          api_key     : self.api_key,
          method      : type + '.search',
          page        : self[type].page,
          autocorrect : 1,
          format      : 'json',
          callback    : 'window.Search.queryCallback',
        };
        params[type] = self.get('query');

        $.getScript('http://ws.audioscrobbler.com/2.0/?' + $.param(params));
      });
    }, 600),

    queryCallback: function(data) {
      var self = this;
      if (!self.isCurrentQuery(data.results))
        return;

      // Figure out the type by searching json, e.g. results.artistmatches
      _.forEach(['artist', 'album', 'track'], function(type) {
        if (_.isUndefined(data.results[type + 'matches']))
          return;
        self[type].loading = false;

        self[type].page++;
        self[type].view.render();
        _.forEach(data.results[type + 'matches'][type], function(result) {
          self[type].add(self.resultToJSON(type, result));
        });
      });
    },

    loadMore: function(type) {
      if (this[type].loading)
        return;
      this[type].loading = true;
      this.query([ 'track' ]);
    },

    isCurrentQuery: function(results) {
      return results ? (this.get('query') == results['@attr'].for) : false;
    },

    resultToJSON: function(type, result) {
      var self = this;
      switch (type) {
        case 'track':
          return new Model.Track({
            artist    : result.artist,
            name      : result.name,
            image     : self.resultImage(result),
            listeners : result.listeners || 0
          });
        case 'artist':
          return new Model.Artist({
            name      : result.name,
            image     : self.resultImage(result),
            listeners : result.listeners || 0
          });
        case 'album':
          return new Model.Album({
            artist  : result.artist,
            name    : result.name,
            albumid : result.id,
            image   : self.resultImage(result),
          });
        case 'tag':
          return new Model.Tag({
            name  : result.name,
            count : result.count
          });
        default:
          return null;
      }
    },

    resultImage: function(result, size){
      var src = '',
          size = size || 'large';
      if (_.isArray(result.image)) {
        _.each(result.image, function(image) {
          if (image.size == size) src = image['#text'];
        });
      } else if (!_.isUndefined(result.image)) {
        src = result.image;
      }
      return src;
    }

  });

  View.SearchResult = Backbone.View.extend({
    tagName: 'li',

    initialize: function() {
      this.model.view = this;
      this.render();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  View.SearchResults = Backbone.View.extend({
    tagName: 'ul',

    templateEmpty: _.template($('#search-empty-template').html()),

    initialize: function() {
      var self = this;
      ['artist', 'album', 'track'].forEach(function(type) {
        if (self.collection.model == Model[type.capitalize()])
          self.type = type;
      });

      self.collection.bind('add', self.addModel);
      _.bindAll(self, 'addModel');
    },

    render: function() {
      if (this.collection.models.length == 0)
        $(this.el).html(this.templateEmpty({ type: this.type }));
    },

    addModel: function(model) {
      if (this.models.length == 1)
        $(this.view.el).html(this.view.template());

      var view = new this.view.viewObject({ model : model });
      $(this.view.el).find(this.view.viewInner).append(view.el);
    }
  });

});

