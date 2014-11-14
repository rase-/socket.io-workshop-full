var $ = require('jquery');
var io = require('socket.io-client');
var Chat = require('./chat');
var socket = io();
var roomHtml = $('#template-room').html();

module.exports = Lobby;

function Lobby(selector) {
  this.$node = $(selector);
  this.$newRoom = this.$node.find('.new-room');
  this.$rooms = this.$node.find('.rooms');
  var self = this;

  this.chat = new Chat(this.$node.find('.chat'), {
    messageEvent: 'lobby message'
  });

  this.$newRoom.click(function() {
    socket.emit('add room');
  });

  this.$rooms.on('click', '.room', function() {
    var roomId = $(this).attr('data-id');
    socket.emit('join room', roomId);
  });

  socket.on('join lobby', function(rooms) {
    self.$node
      .trigger('fullScreen', false)
      .trigger('header', { title: 'Lobby' });

    self.$rooms.empty();
    rooms.forEach(function(room) {
      self.$rooms.append(createRoomNode(room));
    });

    self.chat.refresh();
    self.chat.log('Welcome to the game');

    self.$node.show();
    self.chat.focus();
  });

  socket.on('leave lobby', function() {
    self.$node.hide();
  });

  socket.on('room updated', function(room) {
    var $room = self.$rooms.find('.room[data-id=' + room.id + ']');
    if ($room.length) {
      $room.find('.num-users').text(room.users.length);
    } else {
      self.$rooms.append(createRoomNode(room));
    }
  });

  socket.on('room removed', function(roomId) {
    self.$rooms.find('.room[data-id=' + roomId + ']').remove();
  });
};

function createRoomNode(room) {
  var $room = $(roomHtml).attr('data-id', room.id);
  $room.find('.roomname').text(room.name);
  $room.find('.num-users').text(room.users.length);
  return $room;
}
