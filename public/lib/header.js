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

  $(document).on('headerTitle', function(e, title) {
    self.$node.toggle(!!title);
    self.$title.text(title || '');
  });
};
