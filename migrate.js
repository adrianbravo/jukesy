var mysql = require('mysql')
  , mongodb = require('mongodb')
  , _ = require('underscore')
  , mongodServer = new mongodb.Server("127.0.0.1", 27017, {}) 
  , mysqlClient = mysql.createClient({ user: 'root', password: '' })
  , mongoClient
  , usersCollection
  , playlistsCollection
  , start = 0 
  , batchSize = 50

new mongodb.Db('jukesy', mongodServer, {}).open(function (error, client) {
  if (error) {
    throw error
  }

  usersCollection = new mongodb.Collection(client, 'users')
  playlistsCollection = new mongodb.Collection(client, 'playlists')
  mongoClient = client

  usersCollection.remove()
  playlistsCollection.remove()

  traverseSQL()
})

var traverseSQL = function() {
  mysqlClient.query('USE jukesy_rails')
  batchUsers(start)
}

var closeClients = function() {
  mysqlClient.end()
  mongoClient.close()
}

var batchUsers = function(index) {
  mysqlClient.query('SELECT * FROM users LIMIT ' + index + ', ' + batchSize, function (error, results) {    console.log('batch at index:', index)    if (results.length) {      var users = _.map(results, constructUserJSON)
        , playlists = []
        , pending = results.length + 1
        , complete = function() {
            pending--
            if (!pending) {
              batchUsers(index + batchSize)
            }
          }

      _.each(results, function(user) {
        mysqlClient.query('SELECT * FROM playlists WHERE user_id=' + user.id, function (error, results) {
          var playlists = _.map(results, function(playlist) {
            var json = { user: user.username }
            json.name = playlist.name
            json.tracks = convertJSONToTracks(playlist.json)
            json.tracks_count = json.tracks.length
            json.sidebar = true
            json.time = {}
            json.time.created = playlist.created_at
            json.time.updated = playlist.updated_at
            return json
          })
          playlistsCollection.insert(playlists, {}, function() {
            complete()
          })
        })
      })
      usersCollection.insert(users, {}, function() {
        complete()
      })

    } else {
      closeClients()
    }
  })
}

var convertJSONToTracks = function(json) {
  try {
    json = JSON.parse(json)
  } catch (e) {}
  if (!json) json = { tracks: [] }
  return _.map(json.tracks, function(track) {
    return {
      artist: unescape(json.artists[track[0]]),
      name: unescape(track[1])
    }
  })
}

var constructUserJSON = function(user) {
  var json = {}
  json.username = user.username
  json.password = user.encrypted_password
  json.email    = user.email
  json.salt     = user.password_salt
  json.time = {}
  json.time.created = user.created_at
  json.time.updated = user.updated_at
  return json
}
