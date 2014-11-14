var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

module.exports = Header;

function Header(selector) {
  this.$node = $(selector);
  this.$numUsers = this.$node.find('.num-users');
  this.$title = this.$node.find('.title');
  var self = this;

  $(document).on('header', function(e, data) {
    self.$title.text(data.title);
  });

  socket.on('num users', function(num) {
    self.$numUsers.text(num);
  });
};
