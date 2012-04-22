View.Welcome = Backbone.View.extend({
  template: jade.compile($('#welcome-template').text()),
  
  events: {
    'click .play-all'       : 'playAll',
    'click .queue-all-next' : 'queueNext',
    'click .queue-all-last' : 'queueLast'
  },
  
  initialize: function(options) {
    this.tracks = _.map(Charts.tracks, function(track) {
      return new Model.SearchResultTrack(track)
    })
    this.artists = _.map(Charts.artists, function(artist) {
      return new Model.SearchResultArtist(artist)
    })
  },
  
  render: function() {
    var $tracks, $artists
      
    this.$el.html(this.template({ tracks: this.tracks, artists: this.artists }))
    $tracks = this.$el.find('#search-tracks table tbody')
    $artists = this.$el.find('#search-artists ul.thumbnails')
    
    _.each(this.tracks, function(track) {
      track.view.render()
      $tracks.append(track.view.$el)
    })
    
    _.each(this.artists, function(artist) {
      artist.view.render()
      $artists.append(artist.view.$el)
    })
    
    return this
  },
  
  playAll: function() {
    newNowPlaying()
    NowPlaying.tracks.add(this.cloneTracks())
    NowPlaying.tracks.play()
    NowPlaying.navigateTo(true)
  },
  
  queueNext: function() {
    NowPlaying.tracks.add(this.cloneTracks(), { at: _.indexOf(NowPlaying.tracks.models, Video.track) + 1 })
  },
  
  queueLast: function() {
    NowPlaying.tracks.add(this.cloneTracks())
  },
  
  cloneTracks: function() {
    return _.map(this.tracks, function(track) { return track.clone().toJSON() })
  }  
})


;