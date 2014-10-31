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

  this.$leaveRoom.click(function() {
    socket.emit('leave room');
  });

  socket.on('join room', function(room) {
    self.chat.refresh();
    self.chat.log('You have joined ' + room.name);

    self.$users.empty();
    room.users.forEach(function(user) {
      self.$users.append(createUserNode(user));
    });

    self.$node.show();
    self.chat.focus();
  });

  socket.on('leave room', function(room) {
    self.$node.hide();
  });

  socket.on('user joined', function(user) {
    self.chat.log(user.username + ' joined');
    self.$users.append(createUserNode(user));
  });

  socket.on('user left', function(user) {
    self.chat.log(user.username + ' left');
    self.$users.find('.user[data-id=' + user.id + ']').remove();
  });

  socket.on('room closed', function(room) {
    alert('The game was closed');
    self.$node.hide();
  });
}

function createUserNode(user) {
  var $user = $(userHtml).attr('data-id', user.id);
  $user.find('.username').text(user.username);
  return $user;
}

