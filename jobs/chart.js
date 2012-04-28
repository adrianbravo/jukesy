var request = require('superagent')
  , fs = require('fs')
  , _ = require('underscore')
  , apiKey = '75c8c3065db32d805a292ec1af5631a3'
  , getChartTopArtists
  , getChartTopTracks
  , getChartTopTags

function chartTopArtists() {
  var attempt = 0
  return function() {
    console.log('requesting chart.getTopArtists, attempt #' + (++attempt))
    request
      .get('http://ws.audioscrobbler.com/2.0/')
      .send({ method: 'chart.getTopArtists', api_key: apiKey, limit: '25', format: 'json' })
      .set('User-Agent', 'jukesy.com')
      .end(function(res) {
        var artists = null
        try {
          artists = JSON.parse(res.res.text).artists.artist
        } catch (e) {}

        if (!artists) {
          setTimeout(getChartTopArtists, 1000)
          return
        }

        artists = _.map(artists, function(artist) {
          return {
            name: artist.name,
            image: grabImage(artist)
          }
        })
        
        fs.writeFileSync('public/chart/topartists.json', JSON.stringify(artists))
      })
  }
}

function chartTopTracks() {
  var attempt = 0
  return function() {
    console.log('requesting chart.getTopTracks, attempt #' + (++attempt))
    request
      .get('http://ws.audioscrobbler.com/2.0/')
      .send({ method: 'chart.getTopTracks', api_key: apiKey, limit: '50', format: 'json' })
      .set('User-Agent', 'jukesy.com')
      .end(function(res) {
        var tracks = null
        try {
          tracks = JSON.parse(res.res.text).tracks.track
        } catch (e) {}

        if (!tracks) {
          setTimeout(getChartTopTracks, 1000)
          return
        }

        tracks = _.map(tracks, function(track) {
          return {
            artist: track.artist.name,
            name: track.name
          }
        })
        
        fs.writeFileSync('public/chart/toptracks.json', JSON.stringify(tracks))
      })
  }
}

function chartTopTags() {
  var attempt = 0
  return function() {
    console.log('requesting chart.getTopTags, attempt #' + (++attempt))
    request
      .get('http://ws.audioscrobbler.com/2.0/')
      .send({ method: 'chart.getTopTags', api_key: apiKey, limit: '50', format: 'json' })
      .set('User-Agent', 'jukesy.com')
      .end(function(res) {
        var tags = null
        try {
          tags = JSON.parse(res.res.text).tags.tag
        } catch (e) {}

        if (!tags) {
          setTimeout(getChartTopTags, 1000)
          return
        }

        tags = _.map(tags, function(tag) {
          return {
            name: tag.name,
            reach: tag.reach
          }
        })
        
        fs.writeFileSync('public/chart/toptags.json', JSON.stringify(tags))
      })
  }
}

function grabImage(result) {
  var src = '', size = 'extralarge'

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

getChartTopArtists = chartTopArtists()
getChartTopArtists()
getChartTopTracks = chartTopTracks()
getChartTopTracks()
getChartTopTags = chartTopTags()
getChartTopTags()



