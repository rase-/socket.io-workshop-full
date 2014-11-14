var $ = require('jquery');
var io = require('socket.io-client');
var Chat = require('./chat');
var GameView = require('./game-view');
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

  this.$startGame.click(function() {
    socket.emit('start game');
  });

  socket.on('join room', function(room) {
    self.room = room;

    self.$node.trigger('header', {
      title: room.name,
      backBtn: {
        label: 'Back to the Lobby',
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

  socket.on('leave room', function(room) {
    self.room = null;
    self.$node.hide();
  });

  socket.on('user joined', function(user) {
    self.room.users.push(user);
    self.chat.log(user.username + ' joined');
    self.$users.append(createUserNode(user));
    self.$startGame.prop('disabled', !self.startable());
  });

  socket.on('user left', function(user) {
    self.room.users.some(function(u, i) {
      if (user.id !== u.id) return;
      self.room.users.splice(i, 1);
      return true;
    });

    self.chat.log(user.username + ' left');
    self.$users.find('.user[data-id=' + user.id + ']').remove();
    self.$startGame.prop('disabled', !self.startable());
  });

  socket.on('room closed', function(room) {
    alert('The game was closed');
    self.$node.hide();
  });

  socket.on('game started', function(room) {
    self.$node.hide();
    new GameView('.wrapper', socket.user, room);
  });
}

Room.prototype.startable = function() {
  return !!(this.room && this.room.users.length > 1);
}

function createUserNode(user) {
  var $user = $(userHtml).attr('data-id', user.id);
  $user.find('.username').text(user.username);
  return $user;
}

