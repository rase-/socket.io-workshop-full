var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

module.exports = Lobby;

function Lobby(selector) {
  this.$node = $(selector);
  this.$newRoom = this.$node.find('.new-room');
  this.$rooms = this.$node.find('.rooms');
  var self = this;

  socket.on('join lobby', function(rooms) {
    self.$node
      .trigger('fullScreen', false)
      .trigger('header', { title: 'Lobby' });

    self.$node.show();
  });
};
