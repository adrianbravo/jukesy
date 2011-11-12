$(function() {

  Collection.Playlists = Backbone.Collection.extend({
    model: Model.Playlist,

    localStorage: new Store("Playlists")
  });

  // Playlist Model
  // JSON example:
  // {
  //   name: "Unicorns",
  //   tracks: [
  //     {
  //       artist : "The Unicorns",
  //       name   : "I Was Born (A Unicorn)",
  //       image  : "http://userserve-ak.last.fm/serve/126/8632109.jpg"
  //     },
  //     ...
  //   ]
  // }
  Model.Playlist = Backbone.Model.extend({
    localStorage: new Store("Playlists"),

    defaults: {
      name: 'New Playlist'
    },

    initialize: function() {
      var self = this;
      _.bindAll(this, 'add', 'remove', 'sortByDOM');

      this.tracks = [];
      this.view = new View.Playlist({ model: this });
      this.view.render();
      this.bind('change', this.onchange);

      _.each(this.get('tracks'), function(track) {
        self.add([new Model.Track(track)], { silent: true });
      });

      if (self.tracks[0]) self.tracks[0].play();
    },

    onchange: function() {
      this.view.el.find('#save').removeClass('disabled');
    },

    // Add a track to the model.
    add: function(tracks, options) {
      if (!options.silent) this.change();
      var $placeholder
        , self = this;


      // At least one song, and play or next was clicked.
      // So IF will target the current song to add one after it.
      if (!_.isUndefined(window.nowPlayingTrack) && _.include(['play', 'next'], options.method)) {
        if (!$placeholder) {
          $placeholder = $('<div class="placeholder h"></div>');
          $(nowPlayingTrack.view.el).after($placeholder);
        }

        // Insert before placeholder (which is after current track).
        var i = _.indexOf(Playlist.tracks, nowPlayingTrack);
        _.each(tracks, function(track, j) {
          self.tracks.splice(i + 1 + j, 0, track);
          track.view = new View.PlaylistTrack({ model: track });
          $placeholder.before(track.view.render().el);
        });
        $placeholder.remove();

        if (options.method == 'play') tracks[0].play();
      } else {

        _.each(tracks, function(track) {
          self.tracks.push(track);

          // Render non_empty template on first addition.
          if (self.tracks.length == 1) self.view.render();
        });


        _.each(tracks, function(track) {
          track.view = new View.PlaylistTrack({ model: track });
          self.view.el.find('tbody').append(track.view.render().el);
        });
      }

      // Start playback.
      if (_.isUndefined(window.nowPlayingTrack)) this.tracks[0].play();
    },

    // Remove a track from the model.
    remove: function(model) {
      this.change();
      this.tracks = _.without(this.tracks, model);
      model.view.remove();
      model.destroy();
    },

    sortByDOM: function() {
      this.change();
      this.tracks = _.sortBy(this.tracks, function(track) {
        return _.indexOf($(track.view.el).parent().children(track.view.tagName), track.view.el);
      });
    }
  });

  View.PlaylistShort = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#playlist-short-template').html()),

    initialize: function() {
      _.bindAll(this, 'render');
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  View.Playlist = Backbone.View.extend({
    el: $('#now-playing'),

    events: {
      'click #save': 'save',
      'change input.name': 'setName'
    },

    empty_template: _.template($('#playlist-empty-template').html()),
    non_empty_template: _.template($('#playlist-template').html()),

    initialize: function() {
      var self = this;
      this.render();

      _.bindAll(this, 'save');

      this.el.sortable({
        placeholder: 'ui-state-highlight',
        items: 'tr',
        axis: 'y',
        distance: 4,
        containment: '#playlist',
        start: function(event, ui) {
          self.cancelClick = true;
        },
        beforeStop: function(event, ui) {
          //self.el.sortable('cancel');
        },
        stop: function(event, ui) {
          self.model.sortByDOM();
        },
      });
    },

    render: function() {
      if (this.model.tracks.length > 0) {
        this.el.html(this.non_empty_template(this.model.toJSON()));
      } else {
        this.el.html(this.empty_template());
      }
    },

    setName: function(e) {
      this.model.set({ name: this.el.find('input.name').val() })
    },

    save: function(e) {
      if ($(e.currentTarget).hasClass('disabled')) return;

      if (this.model.isNew()) Playlists.add(this.model);
      this.model.set({ tracks: this.model.tracks });
      this.model.save();

      this.el.find('#save').addClass('disabled');
      alert('Playlist saved.');
    }
  });

});


