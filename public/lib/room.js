var $ = require('jquery');
var io = require('socket.io-client');
var Chat = require('./chat');
var socket = io();
var userHtml = $('#template-user').html();

module.exports = Room;

function Room(selector) {
  this.$node = $(selector);
  this.$leaveRoom = this.$node.find('.leave-room');
  this.$users = this.$node.find('.users');

  this.chat = new Chat(this.$node.find('.chat'));

  var self = this;

  $(document).on('room', function(e, room) {
    self.refresh(room);
  });

  this.$leaveRoom.click(function() {
    socket.emit('leave room', function(rooms) {
      self.backToLobby(rooms);
    });
  });

  socket.on('user joined', function(user) {
    self.chat.log(user.username + ' joined');
    self.$users.append(userNode(user));
  });

  socket.on('user left', function(user) {
    self.chat.log(user.username + ' left');
    self.$users.find('.user[data-id=' + user.id + ']').remove();
  });

  socket.on('room closed', function(rooms) {
    alert('The game was closed');
    self.backToLobby(rooms);
  });
}

Room.prototype.refresh = function(room) {
  this.$users.empty();
  room.users.forEach(function(user) {
    this.$users.append(this.createUser(user));
  }, this);

  this.$node.show();
  this.$node.trigger('headerTitle', room.name);

  this.chat.refresh();
  this.chat.log('You have joined ' + room.name);
};

Room.prototype.createUser = function(user) {
  var $user = $(userHtml).attr('data-id', user.id);
  $user.find('.username').text(user.username);
  return $user;
};

Room.prototype.backToLobby = function(rooms) {
  this.$node.hide();
  this.$node.trigger('lobby', [rooms]);
};

