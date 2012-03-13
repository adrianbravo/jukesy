View.SearchQuery = Backbone.View.extend({
  template: jade.compile($('#search-query-template').text()),
    
  initialize: function(options) {
    this.query = options.query
    
    this.artistModel = new Model.Search({ artist: options.query, method: 'artist.search', limit: 3, showMore: ('/search/' + options.query + '/artist') })
    this.albumModel = new Model.Search({ album: options.query, method: 'album.search', limit: 6, showMore: ('/search/' + options.query + '/album') })
    this.trackModel = new Model.Search({ track: options.query, method: 'track.search', limit: 15, showMore: ('/search/' + options.query + '/track') })
  },
  
  render: function() {
    this.$el.html(this.template({ query: this.query }))
    return this
  }
})

// TODO dry these three
View.SearchQueryTrack = Backbone.View.extend({
  template: jade.compile($('#search-query-track-template').text()),
    
  events: {
    'click .load-more a': 'loadMore'
  },
  
  loadMore: function() {
    this.model.loadMore()
  },
  
  initialize: function(options) {
    this.query = options.query
    this.model = new Model.Search({ track: options.query, method: 'track.search', limit: 30, loadMore: true })
  },
  
  render: function() {
    this.$el.html(this.template({ query: this.query }))
    return this
  }
})

View.SearchQueryAlbum = Backbone.View.extend({
  template: jade.compile($('#search-query-album-template').text()),
    
  events: {
    'click .load-more a': 'loadMore'
  },
  
  loadMore: function() {
    this.model.loadMore()
  },
  
  initialize: function(options) {
    this.query = options.query
    this.model = new Model.Search({ album: options.query, method: 'album.search', limit: 30, loadMore: true })
  },
  
  render: function() {
    this.$el.html(this.template({ query: this.query }))
    return this
  }
})

View.SearchQueryArtist = Backbone.View.extend({
  template: jade.compile($('#search-query-artist-template').text()),
  
  events: {
    'click .load-more a': 'loadMore'
  },
  
  loadMore: function() {
    this.model.loadMore()
  },
  
  initialize: function(options) {
    this.query = options.query
    this.model = new Model.Search({ artist: options.query, method: 'artist.search', limit: 30, loadMore: true })
  },
  
  render: function() {
    this.$el.html(this.template({ query: this.query }))
    return this
  }
})

View.SearchTrack = Backbone.View.extend({
  template: jade.compile($('#search-track-template').text()),
  
  initialize: function(options) {
    this.artist = options.artist
    this.track = options.track
    
    this.model = new Model.Search({ artist: options.artist, track: options.track, method: 'track.getSimilar', limit: 150 })
  },
  
  render: function() {
    this.$el.html(this.template({
      artist : this.artist,
      track  : this.track
    }))
    return this
  }
})

View.SearchAlbum = Backbone.View.extend({
  template: jade.compile($('#search-album-template').text()),
  
  initialize: function(options) {
    this.artist = options.artist
    this.album = options.album
    
    this.model = new Model.Search({ artist: options.artist, album: options.album, method: 'album.getInfo' })
  },
  
  render: function() {
    this.$el.html(this.template({
      artist : this.artist,
      album  : this.album
    }))
    return this
  }
})

View.SearchArtist = Backbone.View.extend({
  template: jade.compile($('#search-artist-template').text()),
    
  initialize: function(options) {
    this.artist = options.artist
    
    this.similarArtist = new Model.Search({ artist: options.artist, method: 'artist.getSimilar', limit: 3, showMore: urlArtist(options.artist) + '/similar' })
    this.topAlbum = new Model.Search({ artist: options.artist, method: 'artist.getTopAlbums', limit: 6, showMore: urlArtist(options.artist) + '/top-albums' })
    this.topTrack = new Model.Search({ artist: options.artist, method: 'artist.getTopTracks', limit: 15, showMore: urlArtist(options.artist) + '/top-tracks' })
  },
  
  render: function() {
    this.$el.html(this.template({ artist: this.artist }))
    return this
  }
})

Model.Search = Backbone.Model.extend({
  key: '75c8c3065db32d805a292ec1af5631a3',

  initialize: function() {
    _.bindAll(this, 'queryCallback', 'loadMore')
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
          limit       : this.get('limit') || 30,
          format      : 'json'
        }
      , self = this

    switch (this.get('method')) {
      case 'artist.getSimilar':
        params.artist = this.get('artist'),
        this.type = 'artist'
        this.parseType = 'artist'
        this.displayType = 'Similar Artists'
        break
      case 'artist.getTopAlbums':
        params.artist = this.get('artist'),
        this.type = 'album'
        this.parseType = 'deepAlbum'
        this.displayType = 'Top Albums'
        break
      case 'artist.getTopTracks':
        params.artist = this.get('artist'),
        this.type = 'track'
        this.parseType = 'deepTrack'
        this.displayType = 'Top Tracks'
        break
      case 'artist.search':
        params.artist = this.get('artist')
        this.type = 'artist'
        this.parseType = 'artist'
        this.displayType = 'Artists'
        break
      case 'album.getInfo':
        params.artist = this.get('artist')
        params.album = this.get('album')
        this.type = 'track'
        this.parseType = 'deepTrack'
        this.displayType = 'Track List'
        break
      case 'album.search':
        params.album = this.get('album')
        this.type = 'album'
        this.parseType = 'album'
        this.displayType = 'Albums'
        break
      case 'track.getSimilar':
        params.artist = this.get('artist')
        params.track = this.get('track')
        this.type = 'track'
        this.parseType = 'deepTrack'
        this.displayType = 'Similar Tracks'
        break
      case 'track.search':
        params.track = this.get('track')
        this.type = 'track'
        this.parseType = 'track'
        this.displayType = 'Tracks'
        break
    }
    
    if (!this.view) {
      this.view = new View['SearchResults' + _.capitalize(this.type) + 's']({ model: this })
    }
    
    _.defer(function() {
      if (!self.view.$innerEl().length) {
        self.view.render()
      }
      
      $.getJSON('http://ws.audioscrobbler.com/2.0/?' + $.param(params), self.queryCallback)
    })
  },
  
  queryCallback: function(data) {
    // TODO check if view is visible before continuing
    var results
    
    if (data.results) {
      this.resultsMeta = {
        start   : data.results['opensearch:startIndex'],
        perPage : data.results['opensearch:itemsPerPage'],
        total   : data.results['opensearch:totalResults']
      }
    }
    
    switch (this.get('method')) {
      case 'artist.getSimilar':
        results = data.similarartists && data.similarartists.artist
        break
      case 'artist.getTopAlbums':
        results = data.topalbums && data.topalbums.album
        break
      case 'artist.getTopTracks':
        results = data.toptracks && data.toptracks.track
        break
      case 'artist.search':
        results = data.results.artistmatches && data.results.artistmatches.artist
        break
      case 'album.getInfo':
        results = data.album && data.album.tracks && data.album.tracks.track
        break
      case 'album.search':
        results = data.results.albummatches && data.results.albummatches.album
        break
      case 'track.getSimilar':
        results = data.similartracks && data.similartracks.track
        break
      case 'track.search':
        results = data.results.trackmatches && data.results.trackmatches.track
        break
    }
    this.appendResults(results)
  },
  
  appendResults: function(results) {
    var self = this
    
    this.loading = false
    if (_.isArray(results)) {
      _.forEach(results, function(result) {
        var model = new Model['SearchResult' + _.capitalize(self.type)](self.resultToJSON(result))
        self.results.push(model)
      })
      
      if (!this.view.$innerEl().length) {
        this.view.render()
      }
      
      this.updateLoadMore(results)
      
      if (this.page == 1 && this.get('limit') && (this.type == 'artist' || this.type == 'album')) {
        this.results = _.first(this.results, this.get('limit'))
      }
      
      _.forEach(this.results, function(result) {
        self.view.$innerEl().append(result.view.$el)
      })
    } else {
      this.resultsNotFound()
      this.view.render()
    }
  },
  
  updateLoadMore: function(results) {    
    if (!this.resultsMeta || !this.resultsMeta.start || !this.resultsMeta.perPage || !this.resultsMeta.total) {
      return
    }
    this.view.$el.find('.load-more a').button('reset')
    
    if (parseInt(this.resultsMeta.start) + parseInt(this.resultsMeta.perPage) > parseInt(this.resultsMeta.total)) {
      this.view.$el.find('.load-more').remove()
    } else {
      this.page++
    }
  },
  
  resultsNotFound: function() {
    delete this.results
  },
  
  resultToJSON: function(result) {
    var self = this
    switch (this.parseType) {
      case 'deepTrack':
        return new Model.Track({
          artist    : result.artist.name,
          name      : result.name,
        })
      case 'track':
        return new Model.Track({
          artist    : result.artist,
          name      : result.name,
        })
      case 'artist':
        return new Model.Artist({
          name      : result.name,
          image     : self.resultImage(result)
        })
      case 'deepAlbum':
        return new Model.Album({
          artist  : result.artist.name,
          name    : result.name,
          image   : self.resultImage(result),
          mbid    : result.mbid
        })
      case 'album':
        return new Model.Album({
          artist  : result.artist,
          name    : result.name,
          image   : self.resultImage(result),
          mbid    : result.mbid
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
  },
  
  loadMore: function() {
    if (this.loading) {
      return
    }
    this.loading = true
    this.view.$el.find('.load-more a').button('loading').addClass('disabled')
    this.query()
  }
  
})





/*
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
*/

View.SearchResults = {  
  initialize: function() {
    this.render()
  },
  
  $innerEl: function() {
    return $(this.innerElSelector)
  },
  
  render: function() {
    var json = {
      type: this.model.type,
      query: this.model.get(this.model.type),
      displayType: this.model.displayType,
      showMore: this.model.get('showMore'),
      loadMore: this.model.get('loadMore')
    }
    json[this.type] = this.model.results
    this.$el = $(this.elSelector)
    this.$el.html(this.template(json))
    return this
  }
}

View.SearchResultsTracks = Backbone.View.extend(_.extend({
  template: jade.compile($('#search-results-tracks-template').text()),
  innerElSelector: '#search #search-tracks tbody',
  elSelector: '#search #search-tracks',
  type: 'tracks'
}, View.SearchResults))

View.SearchResultsAlbums = Backbone.View.extend(_.extend({
  template: jade.compile($('#search-results-albums-template').text()),
  innerElSelector: '#search #search-albums ul',
  elSelector: '#search #search-albums',
  type: 'albums'
}, View.SearchResults))

View.SearchResultsArtists = Backbone.View.extend(_.extend({
  template: jade.compile($('#search-results-artists-template').text()),
  innerElSelector: '#search #search-artists ul',
  elSelector: '#search #search-artists',
  type: 'artists'
}, View.SearchResults))

View.SearchResult = {  
  initialize: function() {
    this.render()
  },
  render: function() {
    var json = {}
    json[this.type] = this.model
    this.$el.html(this.template(json))
    return this
  }  
}

View.SearchResultTrack = Backbone.View.extend(_.extend({
  tagName: 'tr',
  template: jade.compile($('#search-result-track-template').text()),
  type: 'track'
}, View.SearchResult))

View.SearchResultAlbum = Backbone.View.extend(_.extend({
  tagName: 'li',
  template: jade.compile($('#search-result-album-template').text()),
  type: 'album'
}, View.SearchResult))

View.SearchResultArtist = Backbone.View.extend(_.extend({
  tagName: 'li',
  template: jade.compile($('#search-result-artist-template').text()),
  type: 'artist'
}, View.SearchResult))

Model.SearchResultTrack = Backbone.Model.extend({
  initialize: function() {
    this.view = new View.SearchResultTrack({ model: this })
  }
})

Model.SearchResultAlbum = Backbone.Model.extend({
  initialize: function() {
    this.view = new View.SearchResultAlbum({ model: this })
  }
})

Model.SearchResultArtist = Backbone.Model.extend({
  initialize: function() {
    this.view = new View.SearchResultArtist({ model: this })
  }
})