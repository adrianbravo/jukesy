Model.LastFM = Backbone.Model.extend({
  key: '75c8c3065db32d805a292ec1af5631a3',

  initialize: function() {
    _.bindAll(this, 'queryCallback')
    this.results = []
    this.show = true
    this.method = this.get('method')
    this.params = {
      api_key     : this.key,
      method      : this.method,
      page        : 1,
      autocorrect : 1,
      limit       : this.get('limit') || 30,
      format      : 'json'
    }
    this.methodParser[this.method].apply(this)
    
    this.on('query', this.updateView)
    this.on('queryCallback', this.updateView)
    this.on('queryCallback', this.updateLoadMore)
    
    this.query()
  },
  
  query: function() {
    var self = this
    this.trigger('query')
    
    _.defer(function() {
      $.getJSON('http://ws.audioscrobbler.com/2.0/?' + $.param(self.params), self.queryCallback)
    })
  },
  
  queryCallback: function(data) {
    var results
    
    this.loading = false
    this.paginationParser[this.paginationType || 'noPagination'].apply(this, [ data ])
    this.appendResults(this.parseResults(data))
    this.trigger('queryCallback')
  },
  
  appendResults: function(results) {
    var self = this
    
    if (!_.isUndefined(results) && !_.isString(results)) {
      results = _.flatten([ results ])
    }
    
    if (_.isArray(results)) {
      _.forEach(results, function(result) {
        var model = new Model['SearchResult' + _.capitalize(self.type)](self.resultParser[self.resultType].apply(self, [ result ]))
        self.results.push(model)
      })
      this.params.page++
    } else {
      this.resultsNotFound()
    }
  },
  
  methodParser: {
    'artist.getSimilar': function() {
      this.params.artist = this.get('artist'),
      this.type = 'artist'
      this.resultType = 'artist'
      this.displayType = 'Similar Artists'
      this.parseResults = function(data) {
        return data.similarartists && data.similarartists.artist
      }
    },
    'artist.getTopAlbums': function() {
      this.params.artist = this.get('artist'),
      this.type = 'album'
      this.resultType = 'deepAlbum'
      this.paginationType = 'topalbums'
      this.displayType = 'Top Albums'
      this.parseResults = function(data) {
        return data.topalbums && data.topalbums.album
      }
    },
    'artist.getTopTracks': function() {
      this.params.artist = this.get('artist'),
      this.type = 'track'
      this.resultType = 'deepTrack'
      this.paginationType = 'toptracks'
      this.displayType = 'Top Tracks'
      this.parseResults = function(data) {
        return data.toptracks && data.toptracks.track
      }
    },
    'artist.search': function() {
      this.params.artist = this.get('artist')
      this.type = 'artist'
      this.resultType = 'artist'
      this.paginationType = 'search'
      this.displayType = 'Artists'
      this.parseResults = function(data) {
        return data.results.artistmatches && data.results.artistmatches.artist
      }
    },
    'album.getInfo': function() {
      this.params.artist = this.get('artist')
      this.params.album = this.get('album')
      this.type = 'track'
      this.resultType = 'deepTrack'
      this.displayType = 'Track List'
      this.parseResults = function(data) {
        return data.album && data.album.tracks && data.album.tracks.track
      }
    },
    'album.search': function() {
      this.params.album = this.get('album')
      this.type = 'album'
      this.resultType = 'album'
      this.paginationType = 'search'
      this.displayType = 'Albums'
      this.parseResults = function(data) {
        return data.results.albummatches && data.results.albummatches.album
      }
    },
    'track.getSimilar': function() {
      this.params.artist = this.get('artist')
      this.params.track = this.get('track')
      this.type = 'track'
      this.resultType = 'deepTrack'
      this.displayType = 'Similar Tracks'
      this.parseResults = function(data) {
        return data.similartracks && data.similartracks.track
      }
    },
    'track.search': function() {
      this.params.track = this.get('track')
      this.type = 'track'
      this.resultType = 'track'
      this.paginationType = 'search'
      this.displayType = 'Tracks'
      this.parseResults = function(data) {
        return data.results.trackmatches && data.results.trackmatches.track
      }
    }
  },
  
  paginationParser: {
    search: function(data) {
      this.pagination = {
        start   : parseInt(data.results['opensearch:startIndex']),
        perPage : parseInt(data.results['opensearch:itemsPerPage']),
        total   : parseInt(data.results['opensearch:totalResults'])  
      }
    },
    topalbums: function(data) {
      var meta = data.topalbums && data.topalbums['@attr']
      if (!meta) {
        this.pagination = null
        return
      }
      this.pagination = {
        start   : (parseInt(meta.page) - 1) * parseInt(meta.perPage),
        perPage : parseInt(meta.perPage),
        total   : parseInt(meta.total)
      }
    },
    toptracks: function(data) {
      var meta = data.toptracks && data.toptracks['@attr']
      if (!meta) {
        this.pagination = null
        return
      }
      this.pagination = {
        start   : (parseInt(meta.page) - 1) * parseInt(meta.perPage),
        perPage : parseInt(meta.perPage),
        total   : parseInt(meta.total)
      }
    },
    noPagination: function(data) {}
  },
  
  resultParser: {
    deepTrack: function(result) {
      return new Model.Track({
        artist    : result.artist.name,
        name      : result.name,
      })
    },
    track: function(result) {
      return new Model.Track({
        artist    : result.artist,
        name      : result.name,
      })
    },
    artist: function(result) {
      return new Model.Artist({
        name      : result.name,
        image     : this.resultImage(result)
      })
    },
    deepAlbum: function(result) {
      return new Model.Album({
        artist  : result.artist.name,
        name    : result.name,
        image   : this.resultImage(result),
        mbid    : result.mbid
      })
    },
    album: function(result) {
      return new Model.Album({
        artist  : result.artist,
        name    : result.name,
        image   : this.resultImage(result),
        mbid    : result.mbid
      })
    },
    tag: function(result) {
      return new Model.Tag({
        name  : result.name,
        count : result.count
      })
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
  
  resultsNotFound: function() {
    delete this.results
  },
  
  loadMore: function() {
    if (this.loading) {
      return
    }
    this.loading = true
    this.query()
  },
  
  updateLoadMore: function() {
    if (!this.pagination || (this.pagination.start + this.pagination.perPage > this.pagination.total)) {
      this.set('loadMore', false)
      
      if (this.view) {
        this.view.$el.find('.load-more').remove()
      }
    }
  },
  
  updateView: function() {
    if (!this.show) {
      return
    }
    
    if (!this.view) {
      this.view = new View['SearchResults' + _.capitalize(this.type) + 's']({ model: this })
    }
    
    // TODO prevent from rendering on query if view already rendered
    _.defer(this.view.render)
  }
})
