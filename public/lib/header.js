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

  $(document).on('header', function(e, data) {
    var backBtn = data.backBtn || {};

    self.$title.text(data.title);
    self.$backBtn
      .text(backBtn.label || '')
      .toggle(!!backBtn.label)
      .off('click');

    var onClick = backBtn.onClick;
    if (onClick) {
      self.$backBtn.click(onClick);
    }
  });

  socket.on('num users', function(num) {
    self.$numUsers.text(num);
  });
}
