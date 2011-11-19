$(function() {

  View.Playlists = Backbone.View.extend({
    el: $('#main'),

    template: _.template($('#playlists-template').html()),

    initialize: function() {
      if (this.options.quickbar)
        this.el = $('#my-playlists');
      this.render();
    },

    render: function() {
      var self = this;

      this.el.html(this.template({
        empty: _.isEmpty(Playlists.models),
        quick: this.options.quickbar
      }));

      _.each(Playlists.models, function(playlist) {
        var view = new View.PlaylistShort({ model: playlist });
        self.el.find('.playlists ul').append(view.render().el);
      });

      if (this.options.quickbar) {
        windowResized();
      }
    }

  });

  Model.Playlist = Backbone.Model.extend({
    localStorage: new Store('Playlists'),

    defaults: {
      name: 'New Playlist'
    },

    initialize: function() {
      var self = this;
      if (!self.isNew()) self.autosave = true;
      _.bindAll(self, 'remove', 'sortByDOM', 'saveLocally');

      // Loads tracks collection or converts its json to a new collection, silently.
      self.set({ tracks: new Collection.Tracks(self.get('tracks') || []) }, { silent: true });
      self.bind('change', self.saveLocally);

      self.oldToJSON = self.toJSON;
      self.toJSON = function() {
        var json = self.oldToJSON();
        json.tracks = self.get('tracks').toJSON();
        return json;
      };
    },

    saveLocally: function() {
      if (this.localStorage && this.autosave) {
        this.save();
        this.shortView.render();
      }
      // TODO handle saving remotely
    },

    // Remove a track from the model.
    remove: function(model) {
      this.change();
      this.get('tracks').models = _.without(this.get('tracks').models, model);
      model.view.remove();
      model.destroy();
    },

    sortByDOM: function() {
      this.get('tracks').models = _.sortBy(this.get('tracks').models, function(track) {
        return _.indexOf($(track.view.el).parent().children(track.view.tagName), track.view.el);
      });
      this.change();
    }
  });

  View.PlaylistShort = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#playlist-short-template').html()),

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.shortView = this;
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  View.Playlist = Backbone.View.extend({
    el: $('#main'),

    events: {
      'change input.name': 'setName'
    },

    empty_template: _.template($('#playlist-empty-template').html()),
    non_empty_template: _.template($('#playlist-template').html()),

    initialize: function() {
      var self = this;
      self.render();

      self.el.sortable({
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
      var self = this;
      if (self.model.get('tracks').models.length > 0) {
        self.el.html(self.non_empty_template(self.model.toJSON()));
        _.each(self.model.get('tracks').models, function(track) {
          self.el.find('tbody').append(track.view.render().el);
        });
      } else {
        self.el.html(self.empty_template());
      }
    },

    setName: function(e) {
      var self = this;
      self.model.set({ name: self.el.find('input.name').val() })
    }
  });

  Collection.Playlists = Backbone.Collection.extend({
    model: Model.Playlist,
    localStorage: new Store('Playlists')
  });

});


