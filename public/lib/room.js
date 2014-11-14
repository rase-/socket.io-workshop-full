var $ = require('jquery');
var io = require('socket.io-client');
var Chat = require('./chat');
var socket = io();
var userHtml = $('#template-user').html();

module.exports = Room;

function Room(selector) {
  this.$node = $(selector);
  this.$startGame = this.$node.find('.start-game');
  this.$users = this.$node.find('.users');

  this.chat = new Chat(this.$node.find('.chat'));
  this.room = null;

  var self = this;

  socket.on('join room', function(room) {
    self.room = room;

    self.$node.trigger('header', {
      title: room.name,
      backBtn: {
        label: 'Back to the lobby',
        onClick: function() {
          socket.emit('leave room');
        }
      }
    });

    self.chat.refresh();
    self.chat.log('You have joined ' + room.name);
    self.$users.empty();

    room.users.forEach(function(user) {
      self.$users.append(createUserNode(user));
    });

    var isOwn = room.users[0].id === socket.user.id;
    self.$node.toggleClass('own', isOwn);
    self.$startGame.toggle(isOwn);

    self.$node.show();
    self.chat.focus();
  });
}

Room.prototype.startable = function() {
  return !!(this.room && this.room.users.length > 1);
};

function createUserNode(user) {
  var $user = $(userHtml).attr('data-id', user.id);
  $user.find('.username').text(user.username);
  return $user;
}
