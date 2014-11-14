var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

module.exports = Login;

function Login(selector) {
  this.$node = $(selector);
  this.$form = this.$node.find('form');
  this.$input = this.$node.find('input.username');
  var self = this;

  this.$node.click(function(e) {
    self.$input.focus();
  });

  this.$form.submit(function(e) {
    e.preventDefault();
    var username = self.$input.val().trim();
    socket.emit('login', username);
  });

  socket.on('login', function(user) {
    socket.user = user;
    self.$node.hide();
  });

  this.$node.show();
  this.$input.focus();
};
