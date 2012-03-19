Model.LastFM = Backbone.Model.extend({
  key: '75c8c3065db32d805a292ec1af5631a3',

  initialize: function() {
    _.bindAll(this, 'queryCallback')
    this.results = []
    this.page = 1
    console.log('lastfm', this.toJSON())
    this.query()
  },
  
  // query
  //   sets params, type, resultType, displayType (h3) based on method
  //   creates view if doesn't exist
  //   defers render of view if innerEl doesn't exist
  //   defers query to lastfm
  // queryCallback
  //   sets resultsMeta based on data.results or data.topalbums or data.toptracks
  //     * should base on type/method instead (requires lastfm research)
  //   sets results based on method
  //   appends results
  // appendResults
  //   unsets loading
  //   checks if results is array
  //     * sometimes results will not be an array (just one result - http://127.0.0.1:3000/artist/Sleeping%20People/top-tracks)
  //     
  
  query: function() {
    var self = this
    this.method = this.get('method')
    this.params = {
      api_key     : this.key,
      method      : this.method,
      page        : this.page,
      autocorrect : 1,
      limit       : this.get('limit') || 30,
      format      : 'json'
    }
    this.methodParser[this.method].apply(this)
        
    if (!this.view) {
      this.view = new View['SearchResults' + _.capitalize(this.type) + 's']({ model: this })
    }
    
    _.defer(function() {
      if (!self.view.$innerEl().length) {
        self.view.render()
      }
      
      $.getJSON('http://ws.audioscrobbler.com/2.0/?' + $.param(self.params), self.queryCallback)
    })
  },
  
  queryCallback: function(data) {
    // TODO check if view is visible before continuing
    var results
    
    this.paginationParser[this.paginationType || 'noPagination'].apply(this, [ data ])
    
    switch (this.method) {
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
    
    if (!_.isUndefined(results)) {
      results = _.flatten([ results ])
    }
    
    if (_.isArray(results)) {
      _.forEach(results, function(result) {
        var model = new Model['SearchResult' + _.capitalize(self.type)](self.resultParser[self.resultType].apply(self, [ result ]))
        self.results.push(model)
      })
      
      if (!this.view.$innerEl().length) {
        this.view.render()
      }
      
      this.updateLoadMore(results)
            
      _.forEach(this.results, function(result) {
        self.view.$innerEl().append(result.view.$el)
      })
    } else {
      this.resultsNotFound()
    }
  },
  
  updateLoadMore: function(results) {
    if (!this.pagination) {
      this.view.$el.find('.load-more').remove()
      return
    }
    this.view.$el.find('.load-more a').button('reset')
    
    if (parseInt(this.pagination.start) + parseInt(this.pagination.perPage) > parseInt(this.pagination.total)) {
      this.view.$el.find('.load-more').remove()
    } else {
      this.page++
    }
  },
  
  resultsNotFound: function() {
    delete this.results
    this.view.render()
  },
  
  methodParser: {
    'artist.getSimilar': function() {
      this.params.artist = this.get('artist'),
      this.type = 'artist'
      this.resultType = 'artist'
      this.displayType = 'Similar Artists'
      return this
    },
    'artist.getTopAlbums': function() {
      this.params.artist = this.get('artist'),
      this.type = 'album'
      this.resultType = 'deepAlbum'
      this.paginationType = 'topalbums'
      this.displayType = 'Top Albums'
      return this
    },
    'artist.getTopTracks': function() {
      this.params.artist = this.get('artist'),
      this.type = 'track'
      this.resultType = 'deepTrack'
      this.paginationType = 'toptracks'
      this.displayType = 'Top Tracks'
      return this
    },
    'artist.search': function() {
      this.params.artist = this.get('artist')
      this.type = 'artist'
      this.resultType = 'artist'
      this.paginationType = 'search'
      this.displayType = 'Artists'
      return this
    },
    'album.getInfo': function() {
      this.params.artist = this.get('artist')
      this.params.album = this.get('album')
      this.type = 'track'
      this.resultType = 'deepTrack'
      this.displayType = 'Track List'
      return this
    },
    'album.search': function() {
      this.params.album = this.get('album')
      this.type = 'album'
      this.resultType = 'album'
      this.paginationType = 'search'
      this.displayType = 'Albums'
      return this
    },
    'track.getSimilar': function() {
      this.params.artist = this.get('artist')
      this.params.track = this.get('track')
      this.type = 'track'
      this.resultType = 'deepTrack'
      this.displayType = 'Similar Tracks'
      return this
    },
    'track.search': function() {
      this.params.track = this.get('track')
      this.type = 'track'
      this.resultType = 'track'
      this.paginationType = 'search'
      this.displayType = 'Tracks'
      return this
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
      var meta = data.topalbums['@attr']
      this.pagination = {
        start   : (parseInt(meta.page) - 1) * parseInt(meta.perPage),
        perPage : parseInt(meta.perPage),
        total   : parseInt(meta.total)
      }
    },
    toptracks: function(data) {
      var meta = data.toptracks['@attr']
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
  
  loadMore: function() {
    if (this.loading) {
      return
    }
    this.loading = true
    this.view.$el.find('.load-more a').button('loading').addClass('disabled')
    this.query()
  }
})
