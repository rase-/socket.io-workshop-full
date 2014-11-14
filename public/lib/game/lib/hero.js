var Shotgun = require('./shotgun');
var Body = require('./body');
var Motion = require('./motion');

// Respawn points
var spawnPoints = [ { x: -2, y: 7.6, z: 25 }, { x: -18.6, y: 7.6, z: -10.9 }, { x: 19.6, y: 7.6, z: -11 }, { x: 0.22, y: 5.3, z: 5.86 } ];

function Hero(object, height, username) {
  this.username = username;
  this.health = 100;
  this.points = 0;
  this.shotgun = new Shotgun();

  // Render target
  this.body = new Body(object, height);
  var position = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  this.motion = new Motion(position.x, position.y, position.z);
}

Hero.prototype.die = function() {
  this.health = 100;
  this.points--;
};

Hero.prototype.reset = function() {
  var position = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  this.motion.position.set(position.x, position.y, position.z);
  this.motion.velocity.multiplyScalar(0);

  this.die();
};

module.exports = Hero;
