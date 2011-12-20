$(function() {


  //
  // Displays initial waitstate of search. Should render placeholders for search results.
  //
  View.Search = Backbone.View.extend({
    el: '#main',

    waitstate_template : _.template($('#search-waitstate-template').html()),

    initialize: function() {
      this.render();
      window.lastSelected = null;
    },

    render: function() {
      $(this.el).html(this.waitstate_template(this.model.toJSON()));
    }
  });


  //
  // Holds collections of search results for tracks, artists, and albums.
  // Handles querying last.fm for search results as well.
  //
  Model.Search = Backbone.Model.extend({
    lastfmAPIKey: '75c8c3065db32d805a292ec1af5631a3',

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
          api_key     : self.lastfmAPIKey,
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
      if (!self.isCurrentQuery(data.results)) {
        return;
      }

      // Figure out the type by searching json, e.g. results.artistmatches
      _.forEach([ 'artist', 'album', 'track' ], function(type) {
        if (_.isUndefined(data.results[type + 'matches'])) {
          return;
        }
        self[type].loading = false;

        self[type].page++;
        self[type].view.render();
        _.forEach(data.results[type + 'matches'][type], function(result) {
          self[type].add(self.resultToJSON(type, result));
        });
      });
    },

    loadMore: function(type) {
      if (this[type].loading) {
        return;
      }
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
          if (image.size == size) {
            src = image['#text'];
          }
        });
      } else if (!_.isUndefined(result.image)) {
        src = result.image;
      }
      return src;
    }
  });


  //
  // Displays a particular search result (e.g. a single track, artist, or album).
  //
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


  //
  // Displays a collection of search results.
  //
  View.SearchResults = Backbone.View.extend({
    tagName: 'ul',

    templateEmpty: _.template($('#search-empty-template').html()),

    initialize: function() {
      var self = this;
      ['artist', 'album', 'track'].forEach(function(type) {
        if (self.collection.model == Model[type.capitalize()]) {
          self.type = type;
        }
      });

      self.collection.bind('add', self.addModel);
      _.bindAll(self, 'addModel');
    },

    render: function() {
      if (this.collection.models.length == 0) {
        $(this.el).html(this.templateEmpty({ type: this.type }));
      }
    },

    addModel: function(model) {
      if (this.models.length == 1) {
        $(this.view.el).html(this.view.template());
      }

      var view = new this.view.viewObject({ model : model });
      $(this.view.el).find(this.view.viewInner).append(view.el);
    }
  });


  //
  // View behavior for search results that are tracks.
  //
  View.SearchTrack = View.SearchResult.extend(_.extend({
    tagName: 'tr',
    className: 'track',
    template: _.template($('#search-track-template').html()),

    events: {
      'click'    : 'toggleSelect',
      'dblclick' : 'play'
    },

    play: function() {
      this.queueTrack('play');
    },

    // Adds selected tracks to NowPlaying collection.
    queueTrack: function(method) {
      $(this.el).addClass('selected');
      NowPlaying.add(_(Search.track.models).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) {
            return null;
          }
          $(track.view.el).removeClass('selected');
          return (new Model.Track(track.toJSON()));
        }).compact().value(), { method: method });
    }
  }, Mixins.TrackSelection));


  //
  // Placeholder for multiple tracks as search results.
  //
  View.SearchTracks = View.SearchResults.extend({
    el: '#search .tracks',

    template: _.template($('#search-tracks-template').html()),

    viewObject: View.SearchTrack,
    viewInner: 'table tbody'
  });


});

