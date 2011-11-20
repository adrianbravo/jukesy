$(function() {

  
  /*
  View.Search = Backbone.View.extend({

    waiting_template   : _.template($('#lastfm-waiting-template').html()),
    results_template   : _.template($('#lastfm-search-template').html()),
    no_results_template: _.template($('#lastfm-no-results-template').html()),

    initialize: function() {
      this.render();
    },

    loadMore: function(event, ui) {
      if ($(event.currentTarget).hasClass('disabled')) return;
      $(event.currentTarget).addClass('disabled');
      this.model.set({ page: this.model.get('page') + 1 });
      this.model.query();
    },

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
      $(this.el).html(this.waitstate_template(this.model.toJSON()));
    }

  });

  // TODO
  // Hold running history of searches???
  // Check if the current search parameters (query) are right
  Model.Search = Backbone.Model.extend({
    api_key: '75c8c3065db32d805a292ec1af5631a3',

    initialize: function() {
      this.set({
        artist : new Collection.Artists(),
        album  : new Collection.Albums(),
        track  : new Collection.Tracks()
      }, { silent: true });

      this.pages = {
        artist : 1,
        album  : 1,
        track  : 1
      };

      this.view = new View.Search({ model: this });
      this.query();
    },

    query: function() {
      var self = this;
      _.forEach(['artist', 'album', 'track'], function(type) {
        var params = {
          api_key     : self.api_key,
          method      : type + '.search',
          page        : self.pages[type],
          autocorrect : 1,
          format      : 'json',
          callback    : 'window.Search.queryCallback',
        };
        params[type] = self.get('query');

        $.getScript('http://ws.audioscrobbler.com/2.0/?' + $.param(params));
      });
    },

      // loads up a view for each
      //   artist, albums, tracks
      // as callbacks are received, if the window location is correct, update those collections, which updates the views
    queryCallback: function(data) {
      var self = this;

      // TODO verify view exists before appending shit

      if (!self.isCurrentQuery(data.results)) {
        return;
      }


      // Figure out the type by searching json, e.g. results.artistmatches
      _.forEach(['artist', 'album', 'track'], function(type) {
        if (_.isUndefined(data.results[type + 'matches']))
          return;

        self.get(type).view = new View['Search' + type.capitalize() + 's']({ collection: self.get(type) });

        // Add initial models to the collection
        _.forEach(data.results[type + 'matches'][type], function(result) {
          self.get(type).add(self.resultToJSON(type, result));
        });

      });
    },

    isCurrentQuery: function(results) {
      return results ? (this.get('query') == results['@attr'].for) : false;
    },

    resultToJSON: function(type, result) {
      var self = this;
      switch (type) {
        case 'track':
          console.log('track', result);
          return new Model.Track({
            artist    : result.artist,
            name      : result.name,
            image     : self.resultImage(result),
            listeners : result.listeners
          });
        case 'artist':
          console.log('artist', result);
          return new Model.Artist({
            name      : result.name,
            image     : self.resultImage(result, 'extralarge'),
            listeners : result.listeners
          });
        case 'album':
          console.log('album', result);
          return new Model.Album({
            artist  : result.artist,
            name    : result.name,
            albumid : result.id,
            image   : self.resultImage(result, 'extralarge'),
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
      this.render();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  View.SearchResults = Backbone.View.extend({
    tagName: 'ul',

    initialize: function() {
      this.render();
      this.collection.bind('add', this.addModel);
    },

    render: function() {
      var count = this.collection.models.length;
      $(this.el).html(this.template({ count: this.collection.models.length }));
    }
  });

});

