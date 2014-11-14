var THREE = require('three');

var Motion = require('./motion');

var timeStep = 5;
var timeLeft = timeStep + 1;

var birdsEye = 100;
var kneeDeep = 0.4;

var raycaster = new THREE.Raycaster();
raycaster.ray.direction.set(0, -1, 0);

var angles = new THREE.Vector2();
var displacement = new THREE.Vector3();

module.exports = function(arenaModel) {
  return function(dt, motions) {
    timeLeft += dt;

    // run several fixed-step iterations to approximate varying-step

    dt = 5;
    while(timeLeft >= dt) {

      motions.forEach(function(motion) {
        // implement very simple platformer physics
        var time = 0.3, damping = 0.93;

        raycaster.ray.origin.copy(motion.position);
        raycaster.ray.origin.y += birdsEye;
        var hits = raycaster.intersectObject(arenaModel);


        motion.airborne = true;
        // are we above, or at most knee deep in, the platform?
        if((hits.length > 0) && (hits[0].face.normal.y > 0)) {
          var actualHeight = hits[0].distance - birdsEye;
          // collision: stick to the surface if landing on it
          if((motion.velocity.y <= 0) && (Math.abs(actualHeight) < kneeDeep)) {
            motion.position.y -= actualHeight;
            motion.velocity.y = 0;
            motion.airborne = false;
          }
        }

        if(motion.airborne) {
          // free fall: apply the gravity (more pull little by little)
          motion.velocity.y -= 0.01;
        }

        // Slow down player movement (has an effect vhen buttons not pressed)
        angles.copy(motion.spinning).multiplyScalar(time);
        if(!motion.airborne) motion.spinning.multiplyScalar(damping);
        displacement.copy(motion.velocity).multiplyScalar(time);
        if(!motion.airborne) motion.velocity.multiplyScalar(damping);

        motion.rotation.add(angles);
        motion.position.add(displacement);

        // where the player can actually look:
        // limit the tilt at ±0.4 radians
        motion.rotation.x = Math.max(-0.4, Math.min (0.4, motion.rotation.x));
        // wrap horizontal rotation to 0...2π
        motion.rotation.y += 2 * Math.PI; motion.rotation.y %= 2 * Math.PI;
      });

      timeLeft -= dt;
    }
  };
};
