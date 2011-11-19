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
        artists : new Collection.Artists(),
        albums  : new Collection.Albums(),
        tracks  : new Collection.Tracks()
      }, { silent: true });

      this.pages = {
        artists : 1,
        albums  : 1,
        tracks  : 1
      };

      this.view = new View.Search({ model: this });
      this.query();
    },

    query: function() {
      var self = this;
      //_.forEach(['artist', 'track', 'album'], function(type) {
      _.forEach(['artist', 'album'], function(type) {
        var params = {
          api_key     : self.api_key,
          method      : type + '.search',
          page        : self.pages[type + 's'],
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

      console.log('query callback', data);

      // Figure out the type by searching json, e.g. results.artistmatches
      _.forEach(['artist', 'album', 'track'], function(type) {
        if (_.isUndefined(data.results[type + 'matches']))
          return;

        self.get(type + 's').view = new View['Search' + type.capitalize() + 's']({ collection: self.get(type + 's') });

        // Add initial models to the collection
        _.forEach(data.results[type + 'matches'][type], function(result) {
          self.get(type + 's').add(self.resultToJSON(type, result));
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
          return new Model.Track({
            artist : result.artist,
            name   : result.name,
            image  : self.resultImage(result),
          });
        case 'artist':
          return new Model.Artist({
            name      : result.name,
            image     : self.resultImage(result, 'extralarge'),
            listeners : result.listeners
          });
        case 'album':
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

  /*
  Model.Search = Backbone.Model.extend({
    api_key: '75c8c3065db32d805a292ec1af5631a3',

    initialize: function() {
      this.results = [];
      this.set({ page: 1 });
      this.query();
      this.view = new View.Search({ model: this });

      this.set({ tracks: new Collection.Tracks([]) }, { silent: true });
    },

    addResult: function(result) {
      this.results.push(result);
      if (this.results.length == 1) this.view.render();
      // TODO
      // ADD MULTIPLE RESULT TYPES
      // View.Track added here
      result.view = new View[this.get('type').capitalize()]({ model: result });
      this.view.el.find('tbody').append(result.view.render().el);
    },

    queryCallback: function(data) {
      this.view.el.find('.more').removeClass('disabled');
      this.done = true;

      if (!this.isCurrentQuery(data.results)) return;

      // TODO Split off into type-specific parsers
      if (_.isUndefined(data.results) || !_.isArray(data.results[this.get('type') + 'matches'][this.get('type')])) {
        this.view.render();
        return;
      }

      var self = this;
      _.each(data.results[this.get('type') + 'matches'][this.get('type')], function(result) {

        switch (self.get('type')) {
          case 'track':
            self.addResult(new Model.Track({
              artist : result.artist,
              name   : result.name,
              image  : self.getImage(result),
            }));
            break;

          case 'artist':
            self.addResult(new Model.Artist({
              name      : result.name,
              image     : self.getImage(result, 'extralarge'),
              listeners : result.listeners
            }));
            break;

          case 'album':
            self.addResult(new Model.Album({
              artist  : result.artist,
              name    : result.name,
              albumid : result.id,
              image   : self.getImage(result, 'extralarge'),
            }));
            break;

          case 'tag':
            self.addResult(new Model.Tag({
              name  : result.name,
              count : result.count
            }));
            break;

          default:
            break;
        }
      });

      this.view.handleMore(data.results);
    },

  });

  View.SearchTag = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#tag-template').html()),

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
  });

  View.SearchAlbum = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#album-template').html()),

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
  });

  View.SearchArtist = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#artist-template').html()),

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
  });
  */

});

