var THREE = require('three');

var moveAnims = ['run', 'crwalk', 'stand'];

function Renderer() {
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.camera = new THREE.PerspectiveCamera(90, 1, 0.1, 2000);
  this.scene = new THREE.Scene();

  this.scene.add(this.camera);
}

Renderer.prototype.render = function(dt, hero, players) {
  this.renderBodies(dt, hero, players);
  this.renderer.render(this.scene, this.camera);
};

Renderer.prototype.__defineGetter__('domElement', function() {
  return this.renderer.domElement;
});

Renderer.prototype.__defineGetter__('maxAnisotropy', function() {
  return this.renderer.getMaxAnisotropy;
});

Renderer.prototype.renderMap = function(skybox, arenaModel) {
  this.scene.add(skybox);
  this.scene.add(arenaModel);
};

Renderer.prototype.renderWeapon = function(model) {
  model.rotation.x = 0;
  model.rotation.y = -Math.PI / 2;
  model.position.x = 0.235; // center
  model.position.y = -0.2; // take less space on screen
  this.camera.add(model);
};

Renderer.prototype.registerPlayer = function(player) {
  this.scene.add(player.body.object);
};

Renderer.prototype.unregisterPlayer = function(player) {
  this.scene.remove(player.body.object);
};

Renderer.prototype.attachResize = function(gameViewportSize) {
  // Initialize resizing logic
  var resize = function() {
    var viewport = gameViewportSize();
    this.renderer.setSize(viewport.width, viewport.height);
    this.camera.aspect = viewport.width / viewport.height;
    this.camera.updateProjectionMatrix();
  }.bind(this);

  window.addEventListener('resize', resize, false);
  resize();
};

Renderer.prototype.renderBodies = function(dt, hero, players) {
  this.renderHero(hero);
  this.renderPlayers(players);
  this.animatePlayers(dt, players);
};

Renderer.prototype.renderHero = function(hero) {
  var body = hero.body;
  var motion = hero.motion;

  var euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.x = motion.rotation.x;
  euler.y = motion.rotation.y;
  body.object.quaternion.setFromEuler(euler);

  body.object.position.copy(motion.position);

  body.object.position.y += body.height;
};

Renderer.prototype.renderPlayers = function(players) {
  for (var id in players) {
    var body = players[id].body;
    var motion = players[id].motion;

    var euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = motion.rotation.x * 0; // Hack: cancel X axis rotation so that camera up and down does no falsely rotate the model
    euler.y = motion.rotation.y + (-90 * (Math.PI / 180)); // Hack: rotate model by 90 deg so it faces camera direction
    body.object.quaternion.setFromEuler(euler);

    body.object.position.copy(motion.position);

    body.object.position.y += body.height;
  }
};

Renderer.prototype.animatePlayers = function(dt, players) {
  for (var id in players) {
    var p = players[id];
    var moving = true;
    if (Math.abs(p.motion.velocity.x) < 0.0001
        && Math.abs(p.motion.velocity.y) < 0.0001
        && Math.abs(p.motion.velocity.z) < 0.0001) {
      moving = false;
    }

    if (p.body.object.playingOnce) {
      p.body.object.updateAnimation(dt);
    } else if (moving && 'run' !== p.body.object.animation) {
      p.body.object.playAnimation('run', 15);
    } else if (!moving && 'stand' !== p.body.object.animation) {
      p.body.object.playAnimation('stand', 1);
    } else {
      p.body.object.updateAnimation(dt);
    }
  }
};

module.exports = Renderer;
