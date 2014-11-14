var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();
var messageHtml = $('#template-message').html();
var logHtml = $('#template-log').html();

module.exports = Chat;

function Chat(selector, opts) {
  this.$node = $(selector);
  this.$form = this.$node.find('form');
  this.$input = this.$node.find('input.message');
  this.$messages = this.$node.find('.messages');

  opts = opts || {};
  this.messageEvent = opts.messageEvent || 'message';

  var self = this;
  this.$form.submit(function(e) {
    e.preventDefault();
    var message = self.$input.val().trim();
    if (!message) return;

    socket.emit('message', message);
    self.$input.val('');
    self.addMessage(socket.user, message);
  });

  socket.on(this.messageEvent, this.addMessage.bind(this));
}

Chat.prototype.refresh = function() {
  this.$messages.empty();
  this.focus();
};

Chat.prototype.focus = function() {
  this.$input.focus();
};

Chat.prototype.log = function(message) {
  this.$messages.append(createLog(message));
};

Chat.prototype.addMessage = function(user, message) {
  createMessage(user, message).appendTo(this.$messages);
  this.$messages[0].scrollTop = this.$messages[0].scrollHeight;
};

function createMessage(user, message) {
  var $message = $(messageHtml);
  $message.find('.username').text(user.username);
  $message.find('.body').text(message);
  return $message;
}

function createLog(text) {
  return $(logHtml).text(text);
};
