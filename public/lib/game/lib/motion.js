var THREE = require('three');

function Motion(px, py, pz, vx, vy, vz, rx, ry, sx, sy) {
  // basic entity motion information
  this.airborne = false;
  this.position = new THREE.Vector3(px || 0, py || 0, pz || 0);
  this.velocity = new THREE.Vector3(vx || 0, vy || 0, vz || 0);
  this.rotation = new THREE.Vector2(rx || 0, ry || 0);
  this.spinning = new THREE.Vector2(sx || 0, sy || 0);
}

Motion.prototype.update = function(motionData) {
  this.airborne = motionData.airborne;
  this.position.set(motionData.position.x, motionData.position.y, motionData.position.z);
  this.velocity.set(motionData.velocity.x, motionData.velocity.y, motionData.velocity.z);
  this.rotation.set(motionData.rotation.x, motionData.rotation.y);
  this.spinning.set(motionData.spinning.x, motionData.spinning.y);
};

module.exports = Motion;
