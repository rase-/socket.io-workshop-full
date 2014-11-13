var THREE = require('three');

function AnimatedMD2Model(json, image) {
  if (json.constructor == THREE.Geometry) {
    // avoid needless re-init in clone() call
    THREE.MorphAnimMesh.call(this, json, image);
  } else {
    var texture = new THREE.Texture(image);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({ map: texture, morphTargets: true });

    var loader = new THREE.JSONLoader();
    var model = loader.parse(json);
    var geometry = model.geometry;
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeMorphNormals();
    geometry.computeBoundingBox();
    THREE.MorphAnimMesh.call(this, geometry, material);

    this.parseAnimations();
  }

  this.playingOnce = false;
  this.fullTime = 0;
}

AnimatedMD2Model.prototype = Object.create(THREE.MorphAnimMesh.prototype);

AnimatedMD2Model.prototype.playAnimation = function(animationKey, fps) {
  if (this.playingOnce) return;

  this.animation = animationKey;
  this.fps = fps;

  THREE.MorphAnimMesh.prototype.playAnimation.call(this, animationKey, fps);
  this.children.forEach(function(child) {
    child.playAnimation(animationKey, fps);
  });
};

AnimatedMD2Model.prototype.playOnce = function(animationKey, fps) {
  this.playAnimation(animationKey, fps);
  this.fullTime = 0;
  this.playingOnce = true;
};

AnimatedMD2Model.prototype.updateAnimation = function(dt) {
  this.fullTime += this.direction * dt;

  THREE.MorphAnimMesh.prototype.updateAnimation.call(this, dt);
  this.children.forEach(function(child) {
    child.updateAnimation(dt);
  });

  if (this.playingOnce && this.fullTime >= this.duration) {
    this.playingOnce = false;
  }
};

AnimatedMD2Model.prototype.clone = function() {
  var o = new AnimatedMD2Model(this.geometry, this.material);
  THREE.MorphAnimMesh.prototype.clone.call(this, o);
  return o;
};

module.exports = AnimatedMD2Model;
