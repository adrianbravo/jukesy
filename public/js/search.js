$(function() {

  View.Search = Backbone.View.extend({
    el: $('#main'),

    events: {
      'click .more': 'loadMore',
    },

    waiting_template   : _.template($('#lastfm-waiting-template').html()),
    results_template   : _.template($('#lastfm-search-template').html()),
    no_results_template: _.template($('#lastfm-no-results-template').html()),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (this.model.results.length > 0) {
        this.el.html(this.results_template(this.model.toJSON()));
      } else if (this.model.done) {
        this.el.html(this.no_results_template(this.model.toJSON()));
      } else {
        this.el.html(this.waiting_template(this.model.toJSON()));
      }
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
    },
  });

  Model.Search = Backbone.Model.extend({
    api_key: '75c8c3065db32d805a292ec1af5631a3',

    initialize: function() {
      this.results = [];
      this.set({ page: 1 });
      this.query();
      this.view = new View.Search({ model: this });
    },

    addResult: function(result) {
      this.results.push(result);
      if (this.results.length == 1) this.view.render();
      result.view = new View['Search' + this.get('type').capitalize()]({ model: result });
      this.view.el.find('tbody').append(result.view.render().el);
    },

    query: function() {
      var params = {
        api_key     : this.api_key,
        method      : this.get('type') + '.search',
        page        : this.get('page'),
        autocorrect : 1,
        format      : 'json',
        callback    : 'window.Search.queryCallback',
      };
      params[this.get('type')] = this.get('query');

      $.getScript('http://ws.audioscrobbler.com/2.0/?' + $.param(params));
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
            console.log('result', result, 'error, bad result type');
            break;
        }
      });

      this.view.handleMore(data.results);
    },

    getImage: function(result, size){
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
    },

    isCurrentQuery: function(results) {
      if (results) return (results['opensearch:Query'].searchTerms == this.get('query'));
      return true;
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

});

