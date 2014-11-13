var $ = require('jquery');
var gameInit = require('./game');

function GameView(selector, userData, roomName) {
  var $gameContainer = $(selector);
  $gameContainer.html($('#template-game').html());
  $gameContainer.addClass('game');
  gameInit(userData, roomName);
}

module.exports = GameView;
