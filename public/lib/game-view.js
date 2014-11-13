var $ = require('jquery');
var gameInit = require('./game');

function GameView(selector, userData) {
  var $gameContainer = $(selector);
  $gameContainer.html($('#template-game').html());
  $gameContainer.addClass('game');
  gameInit(userData);
}

module.exports = GameView;
