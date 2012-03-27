View.BaseSearch = Backbone.View.extend({
  events: {
    'click .load-more a': 'loadMore'
  },
  
  loadMore: function() {
    this.model.loadMore()
  },
  
  render: function() {
    this.$el.html(this.template(this.options))
    return this
  }  
})

View.SearchQuery = View.BaseSearch.extend({
  template: jade.compile($('#search-query-template').text()),
  initialize: function(options) {
    this.options = options
    new Model.LastFM({ artist: options.query, method: 'artist.search', limit: 3, showMore: ('/search/' + options.query + '/artist') })
    new Model.LastFM({ album: options.query, method: 'album.search', limit: 6, showMore: ('/search/' + options.query + '/album') })
    new Model.LastFM({ track: options.query, method: 'track.search', limit: 15, showMore: ('/search/' + options.query + '/track') })
  }
})

View.SearchQueryTrack = View.BaseSearch.extend({
  template: jade.compile($('#search-query-track-template').text()),
  initialize: function(options) {
    this.options = options
    this.model = new Model.LastFM({ track: options.query, method: 'track.search', limit: 30, loadMore: true })
  }
})

View.SearchQueryAlbum = View.BaseSearch.extend({
  template: jade.compile($('#search-query-album-template').text()),
  initialize: function(options) {
    this.options = options
    this.model = new Model.LastFM({ album: options.query, method: 'album.search', limit: 30, loadMore: true })
  }
})

View.SearchQueryArtist = View.BaseSearch.extend({
  template: jade.compile($('#search-query-artist-template').text()),
  initialize: function(options) {
    this.options = options
    this.model = new Model.LastFM({ artist: options.query, method: 'artist.search', limit: 30, loadMore: true })
  }
})

// Essentially View.SearchTrackSimilar
View.SearchTrack = View.BaseSearch.extend({
  template: jade.compile($('#search-track-template').text()),
  initialize: function(options) {
    this.options = options
    new Model.LastFM({ artist: options.artist, track: options.track, method: 'track.getSimilar', limit: 250 })
  }
})

View.SearchAlbum = View.BaseSearch.extend({
  template: jade.compile($('#search-album-template').text()),
  initialize: function(options) {
    this.options = options    
    this.model = new Model.LastFM({ artist: options.artist, album: options.album, method: 'album.getInfo' })
  }
})

View.SearchArtist = View.BaseSearch.extend({
  template: jade.compile($('#search-artist-template').text()),
  initialize: function(options) {
    this.options = options
    new Model.LastFM({ artist: options.artist, method: 'artist.getSimilar', limit: 3, showMore: urlArtist(options.artist) + '/similar' })
    new Model.LastFM({ artist: options.artist, method: 'artist.getTopAlbums', limit: 6, showMore: urlArtist(options.artist) + '/top-albums' })
    new Model.LastFM({ artist: options.artist, method: 'artist.getTopTracks', limit: 15, showMore: urlArtist(options.artist) + '/top-tracks' })
  }
})

View.SearchArtistTopTracks = View.BaseSearch.extend({
  template: jade.compile($('#search-artist-top-tracks-template').text()),
  initialize: function(options) {
    this.options = options
    this.model = new Model.LastFM({ artist: options.artist, method: 'artist.getTopTracks', limit: 30, loadMore: true })
  }
})

View.SearchArtistTopAlbums = View.BaseSearch.extend({
  template: jade.compile($('#search-artist-top-albums-template').text()),
  initialize: function(options) {
    this.options = options
    this.model = new Model.LastFM({ artist: options.artist, method: 'artist.getTopAlbums', limit: 30, loadMore: true })
  }
})

View.SearchArtistSimilar = View.BaseSearch.extend({
  template: jade.compile($('#search-artist-similar-template').text()),
  initialize: function(options) {
    this.options = options
    this.model = new Model.LastFM({ artist: options.artist, method: 'artist.getSimilar', limit: 240, loadMore: true })
  }
})

View.SearchResults = {  
  initialize: function() {
    _.bindAll(this, 'render')
    this.render()
  },
  
  $innerEl: function() {
    return $(this.innerElSelector)
  },
  
  render: function() {
    var self = this
      , json = {
          type: this.model.type,
          query: this.model.get(this.model.type),
          displayType: this.model.displayType,
          showMore: this.model.get('showMore'),
          loadMore: this.model.get('loadMore')
        }
    json[this.type] = this.model.results
    this.$el = $(this.elSelector)
    this.$el.html(this.template(json))
    
    if (_.isArray(this.model.results) && this.$innerEl().length) {
      _.forEach(this.model.results, function(result) {
        self.$innerEl().append(result.view.$el)
      })
    }
    this.delegateEvents()
    this.renderLoadMore()
    return this
  },
  
  renderLoadMore: function() {
    if (this.model.loading) {
      this.$el.find('.load-more a').button('loading').addClass('disabled')
    } else {
      this.$el.find('.load-more a').button('reset')
    }
  }
}

View.SearchResultsTracks = Backbone.View.extend(_.extend({
  template: jade.compile($('#search-results-tracks-template').text()),
  innerElSelector: '#search #search-tracks .tracks tbody',
  elSelector: '#search #search-tracks',
  type: 'tracks',
  
  events: {
    'click .play-all'   : 'playAll',
    'click .queue-next' : 'queueNext',
    'click .queue-last' : 'queueLast'
  },
  
  playAll: function() {
    var clones = this.model.cloneResults()
      , playlist = new Model.Playlist // start with a fresh playlist
    playlist.nowPlaying()
    NowPlaying.addTracks(clones, Video.track ? _.indexOf(NowPlaying.tracks, Video.track) + 1 : 0)
    clones[0].play()
  },
  
  queueNext: function() {
    NowPlaying.addTracks(this.model.cloneResults(), Video.track ? _.indexOf(NowPlaying.tracks, Video.track) + 1 : 0)
  },
  
  queueLast: function() {
    NowPlaying.addTracks(this.model.cloneResults())
  }
}, View.SearchResults))

View.SearchResultsAlbums = Backbone.View.extend(_.extend({
  template: jade.compile($('#search-results-albums-template').text()),
  innerElSelector: '#search #search-albums .albums ul',
  elSelector: '#search #search-albums',
  type: 'albums'
}, View.SearchResults))

View.SearchResultsArtists = Backbone.View.extend(_.extend({
  template: jade.compile($('#search-results-artists-template').text()),
  innerElSelector: '#search #search-artists .artists ul',
  elSelector: '#search #search-artists',
  type: 'artists'
}, View.SearchResults))

View.SearchResult = Backbone.View.extend({  
  initialize: function() {
    this.render()
  },
  
  render: function() {
    var json = {}
    json[this.type] = this.model
    this.$el.html(this.template(json))
    this.delegateEvents()
    return this
  }
})

View.SearchResultTrack = View.SearchResult.extend(_.extend(Mixins.TrackViewEvents, {
  tagName: 'tr',
  template: jade.compile($('#search-result-track-template').text()),
  type: 'track',
  
  events: {
    'click .play-now'   : 'playNow',
    'click .dropdown'   : 'dropdown',
    'click .queue-next' : 'queueNext',
    'click .queue-last' : 'queueLast'
  },
  
  initialize: function() {
    _.bindAll(this, 'playNow', 'queueNext', 'queueLast')
    this.render()
  }
}))

View.SearchResultAlbum = View.SearchResult.extend({
  tagName: 'li',
  template: jade.compile($('#search-result-album-template').text()),
  type: 'album'
})

View.SearchResultArtist = View.SearchResult.extend({
  tagName: 'li',
  template: jade.compile($('#search-result-artist-template').text()),
  type: 'artist'
})

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