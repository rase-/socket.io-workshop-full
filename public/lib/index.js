var $ = require('jquery');
var Login = require('./login');
var Header = require('./header');
var Lobby = require('./lobby');
var Room = require('./room');

$(function() {
  new Login('.login.page');
  new Header('.header');
  new Lobby('.lobby.page');
  new Room('.room.page');

  $(document).on('fullScreen', function(e, enabled) {
    $('.wrapper').toggleClass('full-screen', enabled);
  });
});
