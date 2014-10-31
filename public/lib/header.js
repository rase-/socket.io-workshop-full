var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

module.exports = Header;

function Header(selector) {
  this.$node = $(selector);
  this.$numUsers = this.$node.find('.num-users');
  this.$title = this.$node.find('.title');
  var self = this;

  socket.on('num users', function(num) {
    self.$numUsers.text(num);
  });

  socket.on('join lobby', function() {
    self.$node.show();
    self.setTitle('Lobby');
  });

  socket.on('join room', function(room) {
    self.$node.show();
    self.setTitle(room.name);
  });
};

Header.prototype.setTitle = function(title) {
  this.$title.text(title);
};
