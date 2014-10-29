var $ = require('jquery');
var Header = require('./header');
var Login = require('./login');
var Lobby = require('./lobby');
var Room = require('./room');

$(function() {
  new Header('.header');
  new Login('.login.page');
  new Lobby('.lobby.page');
  new Room('.room.page');

  $(document).trigger('login');
});
