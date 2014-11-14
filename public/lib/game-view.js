var $ = require('jquery');
var gameInit = require('./game');

function GameView(selector, userData, roomData) {
  var $gameContainer = $(selector);
  $gameContainer.html($('#template-game').html());
  $gameContainer.addClass('game');
  gameInit(userData, roomData);
}

module.exports = GameView;
