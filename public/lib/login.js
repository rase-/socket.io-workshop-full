var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

module.exports = function(selector) {
  this.$node = $(selector);
  this.$form = this.$node.find('form');
  this.$input = this.$node.find('input.username');
  var self = this;

  $(document).on('login', function() {
    self.$node.show();
    self.$input.focus();
  });

  this.$node.click(function(e) {
    self.$input.focus();
  });

  this.$form.submit(function(e) {
    e.preventDefault();
    var username = self.$input.val().trim();
    socket.emit('login', username, function(user, rooms) {
      socket.user = user;
      self.$node.hide();
      self.$node.trigger('lobby', [rooms]);
    });
  });
};
