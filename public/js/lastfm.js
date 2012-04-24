Model.LastFM = Backbone.Model.extend({
  key: '75c8c3065db32d805a292ec1af5631a3',

  initialize: function() {
    _.bindAll(this, 'queryCallback', 'isCurrentQuery', 'setCurrentSearch')
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

    if (!this.hide) {
      this.on('query', this.updateView)    
      this.on('queryCallback', this.updateView)
      this.on('queryCallback', this.updateLoadMore)
    }
    
    // TODO should only happen if this result set needs a view
    this.setCurrentSearch()
    this.query()
  },
  
  setCurrentSearch: function() {
    window.CurrentSearch[this.type] = this
  },
  
  query: function() {
    var self = this
    this.trigger('query')
    
    _.defer(function() {
      //$.getJSON('http://ws.audioscrobbler.com/2.0/?' + $.param(self.params), self.queryCallback)
      $.ajax({
        url: 'http://ws.audioscrobbler.com/2.0/',
        dataType: 'jsonp',
        data: self.params,
        success: self.queryCallback
      })
    })
  },
  
  queryCallback: function(data) {
    this.loading = false
    // TODO should only happen if this result set needs a view
    if (!this.isCurrentQuery()) {
      return false
    }
    this.paginationParser[this.paginationType || 'noPagination'].apply(this, [ data ])
    this.appendResults(this.pluckResults(data))
    this.trigger('queryCallback')
  },
  
  isCurrentQuery: function() {
    return CurrentSearch[this.type] == this
  },
  
  appendResults: function(results) {
    var self = this
    
    if (!_.isUndefined(results) && !_.isString(results)) {
      results = _.flatten([ results ])
    }
    
    if (_.isArray(results)) {
      if (this.method == 'track.getSimilar') {
        this.addQueriedTrackToResults()
      }
   
      _.forEach(results, function(result) {
        self.results.push(new Model['SearchResult' + _.capitalize(self.type)](self.resultParser[self.resultType].apply(self, [ result ])))
      })
      this.params.page++
    } else {
      this.resultsNotFound()
    }
  },
  
  cloneTracks: function() {
    return _.map(this.results, function(track) { return new Model.Track(track.toJSON()) })
  },
  
  addQueriedTrackToResults: function() {
    this.results.push(new Model['SearchResult' + _.capitalize(this.type)](this.resultParser[this.resultType].apply(this, [{
      name: this.get('track'),
      artist: {
        name: this.get('artist')
      }
    }])))    
  },
  
  url: function() {
    return window.baseUrl + this.urlFragment
  },

  setType: function(type, deep) {
    this.resultType = deep ? 'deep' + _.capitalize(type) : type
    this.type = type
  },
  
  methodParser: {
    'artist.getSimilar': function() {
      this.params.artist = this.get('artist'),
      this.setType('artist')
      this.displayType = 'Similar Artists'
      this.urlFragment = '/artist/' + encodeURIComponent(this.get('artist'))
      this.pluckResults = function(data) {
        return data.similarartists && data.similarartists.artist
      }
    },
    'artist.getTopAlbums': function() {
      this.params.artist = this.get('artist'),
      this.setType('album', true)
      this.paginationType = 'topalbums'
      this.displayType = 'Top Albums'
      this.urlFragment = '/artist/' + encodeURIComponent(this.get('artist')) + '/top-albums'
      this.pluckResults = function(data) {
        return data.topalbums && data.topalbums.album
      }
    },
    'artist.getTopTracks': function() {
      this.params.artist = this.get('artist'),
      this.setType('track', true)
      this.paginationType = 'toptracks'
      this.displayType = 'Top Tracks'
      this.urlFragment = '/artist/' + encodeURIComponent(this.get('artist')) + '/top-tracks'
      this.pluckResults = function(data) {
        return data.toptracks && data.toptracks.track
      }
    },
    'artist.search': function() {
      this.params.artist = this.get('artist')
      this.setType('artist')
      this.paginationType = 'search'
      this.displayType = 'Artists'
      this.urlFragment = '/search/' + encodeURIComponent(this.get('artist')) + '/artist'
      this.pluckResults = function(data) {
        return data.results.artistmatches && data.results.artistmatches.artist
      }
    },
    'album.getInfo': function() {
      this.params.artist = this.get('artist')
      this.params.album = this.get('album')
      this.setType('track', true)
      this.displayType = 'Track List'
      this.urlFragment = '/artist/' + encodeURIComponent(this.get('artist')) + '/album/' + encodeURIComponent(this.get('album'))
      this.pluckResults = function(data) {
        return data.album && data.album.tracks && data.album.tracks.track
      }
    },
    'album.search': function() {
      this.params.album = this.get('album')
      this.setType('album')
      this.paginationType = 'search'
      this.displayType = 'Albums'
      this.urlFragment = '/search/' + encodeURIComponent(this.get('album')) + '/album'
      this.pluckResults = function(data) {
        return data.results.albummatches && data.results.albummatches.album
      }
    },
    'chart.getTopArtists': function() {
      this.setType('artist')
      this.displayType = 'Top Artists on Last.fm'
      this.pluckResults = function(data) {
        return data.artists && data.artists.artist
      }
    },
    'chart.getTopTracks': function() {
      this.setType('track', true)
      this.displayType = 'Top Tracks on Last.fm'
      this.pluckResults = function(data) {
        return data.tracks && data.tracks.track
      }
    },
    'track.getSimilar': function() {
      this.params.artist = this.get('artist')
      this.params.track = this.get('track')
      this.setType('track', true)
      this.displayType = 'Similar Tracks'
      this.urlFragment = '/artist/' + encodeURIComponent(this.get('artist')) + '/track/' + encodeURIComponent(this.get('track'))
      this.pluckResults = function(data) {
        return data.similartracks && data.similartracks.track
      }
    },
    'track.search': function() {
      this.params.track = this.get('track')
      this.setType('track')
      this.paginationType = 'search'
      this.displayType = 'Tracks'
      this.urlFragment = '/search/' + encodeURIComponent(this.get('track')) + '/track'
      this.pluckResults = function(data) {
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
  
  resultImage: function(result) {
    var src = '',
        size = this.get('imageSize') || 'extralarge'
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
    if (!this.show || !this.isCurrentQuery()) {
      return
    }
    if (!this.view) {
      this.view = new View['SearchResults' + _.capitalize(this.type) + 's']({ model: this })
    }
    _.defer(this.view.render)
  }
})


;