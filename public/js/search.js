View.SearchQuery = Backbone.View.extend({
  template: jade.compile($('#search-query-template').text()),
  
  innerEl: {
    artist : '#search-artists ul',
    album  : '#search-albums ul',
    track  : '#search-tracks tbody',
  },
  
  initialize: function(options) {
    this.query = options.query
    
    this.artistModel = new Model.Search({ artist: options.query, method: 'artist.search', max: 4 })
    this.albumModel = new Model.Search({ album: options.query, method: 'album.search', max: 6 })
    this.trackModel = new Model.Search({ track: options.query, method: 'track.search' })
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
    
    this.model = new Model.Search({ artist: options.artist, track: options.track, method: 'track.getSimilar' })
  },
  
  render: function() {
    this.$el.html(this.template({
      artist : this.artist,
      track  : this.track
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
      , self = this

    switch (this.get('method')) {
      case 'artist.search':
        params.artist = this.get('artist')
        this.type = 'artist'
        this.parseType = 'artist'
        break
      case 'album.search':
        params.album = this.get('album')
        this.type = 'album'
        this.parseType = 'album'
        break
      case 'track.search':
        params.track = this.get('track')
        this.type = 'track'
        this.parseType = 'track'
        break
      case 'track.getSimilar':
        params.artist = this.get('artist')
        params.track = this.get('track')
        this.type = 'track'
        this.parseType = 'similarTrack'
        break
    }
    this.view = new View[_.capitalize(this.type) + 's' + 'SearchResults']({ model: this })
    _.defer(function() {
      self.view.render()
    })

    
    $.getJSON('http://ws.audioscrobbler.com/2.0/?' + $.param(params), this.queryCallback)
  },
  
  queryCallback: function(data) {
    // TODO check if view is visible before continuing
    var results, type
    switch (this.get('method')) {
      case 'artist.search':
        results = data.results.artistmatches && data.results.artistmatches.artist
        break
      case 'album.search':
        results = data.results.albummatches && data.results.albummatches.album
        break
      case 'track.search':
        results = data.results.trackmatches && data.results.trackmatches.track
        break
      case 'track.getSimilar':
        results = data.similartracks && data.similartracks.track
        break
    }
    this.appendResults(results)
  },
  
  appendResults: function(results) {
    var self = this
    if (_.isArray(results)) {
      _.forEach(results, function(result) {
        var model = new Model[_.capitalize(self.type) + 'SearchResult'](self.resultToJSON(result))
        self.results.push(model)
      })
      
      if (!this.view.$innerEl().length) {
        this.view.render()
      }

      if (this.page == 1 && this.get('max') && (this.type == 'artist' || this.type == 'album')) {
        this.results = _.first(this.results, this.get('max'))
      }
      
      _.forEach(this.results, function(result) {
        self.view.$innerEl().append(result.view.$el)
      })
      
      //this.page++
    } else {
      this.resultsNotFound()
      this.view.render()
    }
  },
  
  resultsNotFound: function() {
    delete this.results
  },
  
  resultToJSON: function(result) {
    var self = this
    switch (this.parseType) {
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
          image     : self.resultImage(result),
          listeners : result.listeners
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
    var json = {}
    json[this.type] = this.model.results
    $(this.elSelector).html(this.template(json))
    return this
  }
}

View.ArtistsSearchResults = Backbone.View.extend(_.extend({
  template: jade.compile($('#artists-search-results-template').text()),
  innerElSelector: '#search #search-artists ul',
  elSelector: '#search #search-artists',
  type: 'artists'
}, View.SearchResults))

View.AlbumsSearchResults = Backbone.View.extend(_.extend({
  template: jade.compile($('#albums-search-results-template').text()),
  innerElSelector: '#search #search-albums ul',
  elSelector: '#search #search-albums',
  type: 'albums'
}, View.SearchResults))

View.TracksSearchResults = Backbone.View.extend(_.extend({
  template: jade.compile($('#tracks-search-results-template').text()),
  innerElSelector: '#search #search-tracks tbody',
  elSelector: '#search #search-tracks',
  type: 'tracks'
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

View.AlbumSearchResult = Backbone.View.extend(_.extend({
  tagName: 'li',
  template: jade.compile($('#album-search-result-template').text()),
  type: 'album',
  className :'span4'
}, View.SearchResult))

View.ArtistSearchResult = Backbone.View.extend(_.extend({
  tagName: 'li',
  template: jade.compile($('#artist-search-result-template').text()),
  type: 'artist',
  className :'span4'
}, View.SearchResult))

View.TrackSearchResult = Backbone.View.extend(_.extend({
  tagName: 'tr',
  template: jade.compile($('#track-search-result-template').text()),
  type: 'track'
}, View.SearchResult))

Model.AlbumSearchResult = Backbone.Model.extend({
  initialize: function() {
    this.view = new View.AlbumSearchResult({ model: this })
  }
})

Model.ArtistSearchResult = Backbone.Model.extend({
  initialize: function() {
    this.view = new View.ArtistSearchResult({ model: this })
  }
})

Model.TrackSearchResult = Backbone.Model.extend({
  initialize: function() {
    this.view = new View.TrackSearchResult({ model: this })
  }
})