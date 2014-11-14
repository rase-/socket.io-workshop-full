var $ = require('jquery');
var io = require('socket.io-client');
var Header = require('./header');
var Login = require('./login');
var Lobby = require('./lobby');
var Room = require('./room');
var socket = io();

$(function() {
  new Header('.header');
  new Login('.login.page');
  new Lobby('.lobby.page');
  new Room('.room.page');

  $(document).on('fullScreen', function(e, enabled) {
    $('.wrapper').toggleClass('full-screen', enabled);
  });
});
