

View.SearchQuery = Backbone.View.extend({
  template: jade.compile($('#search-query-template').text()),
  
  initialize: function(options) {
    this.query = options.query
    
    this.artistModel = new Model.Search({ artist: options.query, method: 'artist.search' })
    this.artistModel.view = this
    this.albumModel = new Model.Search({ album: options.query, method: 'album.search' })
    this.albumModel.view = this
    this.trackModel = new Model.Search({ track: options.query, method: 'track.search' })
    this.trackModel.view = this
  },
  
  render: function() {
    this.$el.html(this.template({
      query   : this.query,
      artists : this.artistModel.results,
      albums  : this.albumModel.results,
      tracks  : this.trackModel.results
    }))
    // append to #search-artists, #search-albums, and #search-tracks
    return this
  }
})


View.SearchTrack = Backbone.View.extend({
  template: jade.compile($('#search-track-template').text()),
  
  initialize: function(options) {
    this.artist = options.artist
    this.track = options.track
    
    this.model = new Model.Search({ artist: options.artist, track: options.track, method: 'track.getSimilar' })
    this.model.view = this
  },
  
  render: function() {
    this.$el.html(this.template({
      artist : this.artist,
      track  : this.track,
      tracks : this.model.results
    }))
    return this
  }
})




Model.Search = Backbone.Model.extend({
  key: '75c8c3065db32d805a292ec1af5631a3',

  initialize: function() {
    _.bindAll(this, 'queryCallback')
    this.results = []
    this.page = 1
    this.query()
  },
    
  query: function() {
    var params = {
          api_key     : this.key,
          method      : this.get('method'),
          page        : this.page,
          autocorrect : 1,
          format      : 'json'
        }

    switch (this.get('method')) {
      case 'artist.search':
        params.artist = this.get('artist')
        break
      case 'album.search':
        params.album = this.get('album')
        break
      case 'track.search':
        params.track = this.get('track')
        break
      case 'track.getSimilar':
        params.artist = this.get('artist')
        params.track = this.get('track')
        break
    }
    
    $.getJSON('http://ws.audioscrobbler.com/2.0/?' + $.param(params), this.queryCallback)
  },
  
  queryCallback: function(data) {
    // check if view is visible
    var results, type, self = this
    
    switch (this.get('method')) {
      case 'artist.search':
        type = 'artist'
        results = data.results.artistmatches && data.results.artistmatches.artist
        break
      case 'album.search':
        type = 'album'
        results = data.results.albummatches && data.results.albummatches.album
        break
      case 'track.search':
        type = 'track'
        results = data.results.trackmatches && data.results.trackmatches.track
        break
      case 'track.getSimilar':
        type = 'similarTrack'
        results = data.similartracks && data.similartracks.track
        break
    }
    
    if (!_.isUndefined(results) && _.isArray(results)) {
      _.forEach(results, function(result) {
        self.results.push(self.resultToJSON(type, result))
      })
    } else {
      this.resultsNotFound()
    }
    console.log(type, this.get('method'), this.results)
    this.view.render()
  },
  
  resultsNotFound: function() {
    delete this.results
  },
  
  resultToJSON: function(type, result) {
    var self = this
    switch (type) {
      case 'similarTrack':
        return new Model.Track({
          artist    : result.artist.name,
          name      : result.name,
          image     : self.resultImage(result)
        })
      case 'track':
        return new Model.Track({
          artist    : result.artist,
          name      : result.name,
          image     : self.resultImage(result)
        })
      case 'artist':
        return new Model.Artist({
          name      : result.name,
          image     : self.resultImage(result)
        })
      case 'album':
        return new Model.Album({
          artist  : result.artist,
          name    : result.name,
          image   : self.resultImage(result),
          albumid : result.id
        })
      case 'tag':
        return new Model.Tag({
          name  : result.name,
          count : result.count
        })
      default:
        return null
    }
  },

  resultImage: function(result, size){
    var src = '',
        size = size || 'large'
    if (_.isArray(result.image)) {
      _.each(result.image, function(image) {
        if (image.size == size) {
          src = image['#text']
        }
      })
    } else if (!_.isUndefined(result.image)) {
      src = result.image
    }
    return src
  }
  
  /*

  loadMore: function(type) {
    if (this[type].loading) {
      return
    }
    this[type].loading = true
    this.query([ 'track' ])
  },

  */
  
})





/*


$(function() {


  //
  // Displays initial waitstate of search. Should render placeholders for search results.
  //
  View.Search = Backbone.View.extend({
    waitstate_template : Handlebars.compile($('#search-waitstate-template').html()),

    render: function() {
      $(this.el).html(this.waitstate_template(this.model.toJSON()))

      if (_.isUndefined(this.model.artist.view)) {
        this.model.artist.view = new View.SearchArtists({ collection: this.model.artist })
        this.model.album.view  = new View.SearchAlbums({ collection: this.model.album })
        this.model.track.view  = new View.SearchTracks({ collection: this.model.track })
      }
      return this
    }
  })




  //
  // Displays a particular search result (e.g. a single track, artist, or album).
  //
  View.SearchResult = Backbone.View.extend({
    tagName: 'li',

    initialize: function() {
      this.model.view = this
      this.render()
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()))
      return this
    }
  })


  //
  // Displays a collection of search results.
  //
  View.SearchResults = Backbone.View.extend({
    templateEmpty: Handlebars.compile($('#search-empty-template').html()),

    initialize: function() {
      var self = this

      ;['artist', 'album', 'track'].forEach(function(type) {
        if (self.collection.model == Model[type.capitalize()]) {
          self.type = type
        }
      })

      self.collection.bind('add', self.addModel)
      _.bindAll(self, 'addModel')
    },

    render: function() {
      if (this.collection.models.length == 0) {
        $(this.el).html(this.templateEmpty({ type: this.type }))
      }
      return this
    },

    addModel: function(model) {
      if (this.models.length == 1) {
        $(this.view.el).html(this.view.template())
        $('#search').find('.' + this.view.type + 's').replaceWith(this.view.el)
      }

      var view = new this.view.viewObject({ model : model })
      $(this.view.el).find(this.view.viewInner).append(view.el)
    }
  })


  //
  // View behavior for search results that are tracks.
  //
  View.SearchTrack = View.SearchResult.extend(_.extend({
    tagName: 'tr',
    className: 'track',
    template: Handlebars.compile($('#search-track-template').html()),

    events: {
      'click'       : 'toggleSelect',
      'dblclick'    : 'play',
      'contextmenu' : 'showContextmenu'
    },

    initialize: function() {
      _.bindAll(this, 'play', 'queueTrack', 'queueNext', 'queueLast')
      this.model.view = this
      this.render()
    },
    
    play: function() {
      this.queueTrack('play')
    },

    queueNext: function() {
      this.queueTrack('next')
    },

    queueLast: function() {
      this.queueTrack('last')
    },

    // Adds selected tracks to NowPlaying collection.
    queueTrack: function(method) {
      $(this.el).addClass('selected')
      
      var tracks = _(Search.track.models).chain()
        .map(function(track) {
          if (!$(track.view.el).hasClass('selected')) {
            return null
          }
          $(track.view.el).removeClass('selected')

          var copyTrack = new Model.Track(track.toJSON())
          copyTrack.playlist = NowPlaying
          return copyTrack
        }).compact().value()

        NowPlaying.add(tracks, { method: method })
    },
    
    showContextmenu: function(e) {
      if (!$(this.el).hasClass('select')) {
        this.toggleSelect(e)
      }
      
      new Model.Contextmenu({
        event: e,
        actions: [
          { action: 'Play', extra: 'dblclick', callback: this.play },
          { action: 'Queue Next', callback: this.queueNext },
          { action: 'Queue Last', callback: this.queueLast }
        ]
      })
      return false
    }

  }, Mixins.TrackSelection))


  //
  // Placeholder for multiple tracks as search results.
  //
  View.SearchTracks = View.SearchResults.extend({
    className: 'tracks',
    template: Handlebars.compile($('#search-tracks-template').html()),
    viewObject: View.SearchTrack,
    viewInner: 'table tbody'
  })


})

*/