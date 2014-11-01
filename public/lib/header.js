var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

module.exports = Header;

function Header(selector) {
  this.$node = $(selector);
  this.$numUsers = this.$node.find('.num-users');
  this.$title = this.$node.find('.title');
  this.$backBtn = this.$node.find('.back');
  var self = this;

  this.$backBtn.click(function() {
    socket.emit('leave room');
  });

  socket.on('num users', function(num) {
    self.$numUsers.text(num);
  });

  socket.on('join lobby', function() {
    self.setTitle('Lobby');
    self.$node.show();
  });

  socket.on('join room', function(room) {
    self.setTitle(room.name);
    self.$backBtn.show();
    self.$node.show();
  });

  socket.on('leave room', function(room) {
    self.$backBtn.hide();
  });
};

Header.prototype.setTitle = function(title) {
  this.$title.text(title);
};
