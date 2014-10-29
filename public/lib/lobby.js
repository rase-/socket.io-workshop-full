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

  $(document).on('lobby', function(e, rooms) {
    self.refresh(rooms);
  });

  this.$newRoom.click(function() {
    socket.emit('add room', function(room) {
      self.navigateToRoom(room);
    });
  });

  this.$rooms.on('click', '.room', function() {
    var roomId = $(this).attr('data-id');
    socket.emit('join room', roomId, function(room) {
      self.navigateToRoom(room);
    });
  });

  socket.on('room added', function(room) {
    self.$rooms.prepend(self.createRoomNode(room));
  });

  socket.on('room removed', function(roomId) {
    self.$rooms.find('.room[data-id=' + roomId + ']').remove();
  });

  socket.on('room changed', function(room) {
    self.$rooms.find('.room[data-id=' + room.id + ']').find('.num-users').text(room.users.length);
  });
};

Lobby.prototype.refresh = function(rooms) {
  this.$rooms.empty();
  rooms.forEach(function(room) {
    this.$rooms.prepend(this.createRoomNode(room));
  }, this);

  this.$node.show();
  this.$node.trigger('headerTitle', 'Lobby');

  this.chat.refresh();
  this.chat.log('Welcome to the game');
};

Lobby.prototype.navigateToRoom = function(room) {
  this.$node.hide();
  this.$node.trigger('room', [room]);
};

Lobby.prototype.createRoomNode = function(room) {
  var $room = $(roomHtml).attr('data-id', room.id);
  $room.find('.roomname').text(room.name);
  $room.find('.num-users').text(room.users.length);
  return $room;
};
