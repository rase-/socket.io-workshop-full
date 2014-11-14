var $ = require('jquery');
var keys = require('./keys');

var keysPressed = {};

var watchedKeyCodes = [keys.SP, keys.W, keys.A, keys.S, keys.D, keys.UP, keys.LT, keys.DN, keys.RT, keys.TAB];

function handler(down) {
  return function(e) {
    var index = watchedKeyCodes.indexOf(e.keyCode);
    if (index >= 0) {
      keysPressed[watchedKeyCodes[index]] = down; e.preventDefault();
    }
  };
}

module.exports.attach = function() {
  $(document).keydown(handler(true));
  $(document).keyup(handler(false));
};

module.exports.keysPressed = function() {
  return keysPressed;
};
