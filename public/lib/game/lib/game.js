var THREE = require('three');
var $ = require('jquery');

var Network = require('./network');

// Rendering engine
var Renderer = require('./renderer');
var HUD = require('./hud');

// Game components
var Hero = require('./hero');
var Player = require('./player');
var Shotgun = require('./shotgun');
var Shot = require('./shot');

// For motion handling
var keys = require('./keys');
var input = require('./input');

// Physics
var physics = require('./physics');

function Game() {
  this.renderer = new Renderer();
  this.shotgunSwayFactor = 0;
  this.assets = {};
}

Game.prototype.checkHeroOutOfBounds = function() {
  // temorary system to bring our hero back on the platform
  var motion = this.hero.motion;
  if (motion.position.y < -123) {
    this.hero.reset();
  }
};

Game.prototype.handleKeyboardControls = function() {
  if (this.freezeControls) {
    return;
  }

  var keysPressed = input.keysPressed();
  var motion = this.hero.motion;
  if(!motion.airborne) {

    // look around
    var sx = keysPressed[keys.UP] ? 0.04 : (keysPressed[keys.DN] ? -0.04 : 0);
    var sy = keysPressed[keys.LT] ? 0.04 : (keysPressed[keys.RT] ? -0.04 : 0);

    if(Math.abs(sx) >= Math.abs(motion.spinning.x)) motion.spinning.x = sx;
    if(Math.abs(sy) >= Math.abs(motion.spinning.y)) motion.spinning.y = sy;

    // move around
    // calculate forward direction in the horizontal plane from rotation
    var forward = new THREE.Vector3();
    var sideways = new THREE.Vector3();

    forward.set(Math.sin(motion.rotation.y), 0, Math.cos(motion.rotation.y));
    // calculate sideways direction from forward direction
    sideways.set(forward.z, 0, -forward.x);

    // Move slightly forwards or backwards if W ar S pressed
    forward.multiplyScalar(keysPressed[keys.W] ? -0.1 : (keysPressed[keys.S] ? 0.1 : 0));
    // Move slightly to the left or right if A ar D pressed
    sideways.multiplyScalar(keysPressed[keys.A] ? -0.1 : (keysPressed[keys.D] ? 0.1 : 0));

    // Total movement on this frame (you can move both forward and sideways)
    var combined = forward.add(sideways);

    // If the player is already moving but not as fast, speed up
    if(Math.abs(combined.x) >= Math.abs(motion.velocity.x)) motion.velocity.x = combined.x;
    if(Math.abs(combined.y) >= Math.abs(motion.velocity.y)) motion.velocity.y = combined.y;
    if(Math.abs(combined.z) >= Math.abs(motion.velocity.z)) motion.velocity.z = combined.z;
  }

  var shotgun = this.hero.shotgun;
  shotgun.pullingTrigger = keysPressed[keys.SP] || false;

  if (keysPressed[keys.TAB]) {
    this.hud.showAllPoints();
  } else {
    this.hud.hideAllPoints();
  }
};

Game.prototype.fireShotgun = function() {
  var motion = this.hero.motion;
  var shotgun = this.hero.shotgun;

  var t = 5e-3 * (Date.now() % 6283); // sway dat shotgun
  var a = motion.airborne ? 0 : motion.velocity.length();
  var b;
  this.shotgunSwayFactor *= 0.8;
  this.shotgunSwayFactor += 0.2 * a;
  a = this.shotgunSwayFactor;
  b = 0.5 * a;

  this.assets.shotgunModel.position.x =  0.235 + a * Math.cos(t);
  this.assets.shotgunModel.position.y = -0.2   + b * (Math.cos(t * 2) - 1);

  if (shotgun.pullingTrigger && !shotgun.firing) {
    shotgun.firing = true;

    // Play the sound with a small of delay
    var shootTrack = this.assets.shootTrack;
    if (shootTrack.paused) {
      setTimeout(function() {
        shootTrack.play();
      }, 100);

    } else {
        shootTrack.currentTime = 0;
    }

    $({ t: 0 }).animate({ t: 1 }, {
      duration: 600,
      step: function(t) {
        var model = this.assets.shotgunModel;
        var length = model.geometry.morphTargets.length;
        var position = length * t;
        var frame = Math.floor(position);
        var spill = position - frame;
        var a = frame % length, b = (frame + 1) % length;
        var b = (frame + 1) % length;

        for (var i = 0; i < model.morphTargetInfluences.length; i++) {
          if (i === a) {
            model.morphTargetInfluences[i] = 1 - spill;
          } else if (i === b) {
            model.morphTargetInfluences[i] = spill;
          } else {
            model.morphTargetInfluences[i] = 0;
          }
        }
      }.bind(this),
      complete: function() {
        shotgun.firing = false;
      }
    });

    // Create ray for shot
    var origin = motion.position.clone();
    origin.y += this.hero.body.height * 0.8;

    var direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(new THREE.Euler(
      motion.rotation.x, motion.rotation.y, motion.rotation.z, 'YXZ'
    ));

    this.shots.push(new Shot(new THREE.Ray(origin, direction)));
  }
};

Game.prototype.applyDamage = function() {
  this.shots.forEach(function(shot) {
    var ray = shot.ray;
    for (var id in this.players) {
      // Check collision to player with raycast
      var transformedRay = new THREE.Ray();
      var inverseMatrix = new THREE.Matrix4();
      inverseMatrix.getInverse( this.players[id].body.object.matrixWorld );
      transformedRay.copy( ray ).applyMatrix4( inverseMatrix );
      if (transformedRay.isIntersectionBox(this.players[id].body.object.geometry.boundingBox)) {
        // Notify player of hit
        this.network.sendHit(id);

        this.players[id].health -= 10;
        if (0 === this.players[id].health) {
          // If hit killed the player, increment points. Player will be respawned on the other end
          this.hero.points++;
        } else {
          // If player hit but not killed, render pain animation
          this.players[id].body.object.playOnce('pain', 1);
        }

        return;
      }
    }
  }.bind(this));

  this.shots = [];
};

Game.prototype.motions = function() {
  return [this.hero.motion].concat(Object.keys(this.players).map(function(key) {
    return this.players[key].motion;
  }.bind(this)));
};

Game.prototype.playerObjects = function() {
  return Object.keys(this.players).map(function(key) {
    return this.players[key].body.object;
  }.bind(this));
};

// Order of steps on each frame drawn
Game.prototype.gameLoop = function(dt) {
  this.applyDamage();
  this.checkHeroOutOfBounds();
  this.handleKeyboardControls();
  this.applyPhysics(dt, this.motions());
  this.fireShotgun();
  this.hud.update();
};

Game.prototype.start = function(gameViewportSize, userData, roomData) {
  // Create player entity
  this.hero = new Hero(this.renderer.camera, 2.0, userData.username);

  // Players
  this.players = {};

  this.network = new Network();
  this.network.join(userData, roomData);

  // Initialize HUD
  this.hud = new HUD(this.hero, this.players);
  this.hud.hideAllPoints();

  // Configure physics
  this.applyPhysics = physics(this.assets.arenaModel);

  // Array for shot objects
  this.shots = [];

  this.network.on('sync', function(motionData) {
    if (!this.players[motionData.id]) {
      this.players[motionData.id] = new Player(motionData.id, motionData.username, this.assets.playerModel.clone());
      this.renderer.registerPlayer(this.players[motionData.id]);
    }

    this.players[motionData.id].motion.update(motionData.motion);
    this.players[motionData.id].health = motionData.health;
    this.players[motionData.id].points = motionData.points;
  }.bind(this));

  // Send player data periodically
  setInterval(function() {
    this.network.sendPlayerData({ health: this.hero.health, motion: this.hero.motion, points: this.hero.points, username: this.hero.username });
  }.bind(this), 10);

  this.network.on('hit', function(data) {
    this.hero.health -= data.damage;
    if (this.hero.health <= 0) {
      this.hero.reset();
    }
    this.hud.flashRed();
  }.bind(this));

  this.network.on('disconnect', function(playerID) {
    this.renderer.unregisterPlayer(this.players[playerID]);
    delete this.players[playerID];
  }.bind(this));

  this.renderer.attachResize(gameViewportSize);

  // Rendering loop
  var lastTimeStamp;
  var render = function(timeStamp) {
    var timeElapsed = lastTimeStamp ? timeStamp - lastTimeStamp : 0; lastTimeStamp = timeStamp;

    // call our game loop with the time elapsed since last rendering, in ms
    this.gameLoop(timeElapsed);

    this.renderer.render(timeElapsed, this.hero, this.players);
    requestAnimationFrame(render);
  }.bind(this);

  requestAnimationFrame(render);
};

module.exports = Game;
