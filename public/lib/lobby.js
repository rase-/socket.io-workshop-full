var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();
var roomHtml = $('#template-room').html();

module.exports = Lobby;

function Lobby(selector) {
  this.$node = $(selector);
  this.$newRoom = this.$node.find('.new-room');
  this.$rooms = this.$node.find('.rooms');
  var self = this;

  this.$newRoom.click(function() {
    socket.emit('add room');
  });

  socket.on('join lobby', function(rooms) {
    self.$node
      .trigger('fullScreen', false)
      .trigger('header', { title: 'Lobby' });

    self.$rooms.empty();
    rooms.forEach(function(room) {
      self.$rooms.append(createRoomNode(room));
    });

    self.$node.show();
  });

  socket.on('leave lobby', function() {
    self.$node.hide();
  });

  socket.on('room updated', function(room) {
    console.log(room);
    self.$rooms.append(createRoomNode(room));
  });
};

function createRoomNode(room) {
  var $room = $(roomHtml).attr('data-id', room.id);
  $room.find('.roomname').text(room.name);
  $room.find('.num-users').text(room.users.length);
  return $room;
}
