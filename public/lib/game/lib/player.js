var Body = require('./body');
var Motion = require('./motion');

function Player(playerID, model) {
  this.health = 100;

  // Render target
  model.scale.set(0.04, 0.04, 0.04);
  model.position.set(90, 1, 0.1);
  model.geometry.computeBoundingSphere();
  model.playerID = playerID;

  this.body = new Body(model);
  this.motion = new Motion(3, 1, 1);
}

module.exports = Player;
