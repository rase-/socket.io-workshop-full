var THREE = require('three');

function SkyBox(images, side) {
  var skyboxTexture = new THREE.Texture(images);
  skyboxTexture.flipY = false;
  skyboxTexture.format = THREE.RGBFormat;
  skyboxTexture.needsUpdate = true;

  var skyboxShader = THREE.ShaderLib.cube;
  skyboxShader.uniforms.tCube.value = skyboxTexture;

  THREE.Mesh.call(this,
    new THREE.BoxGeometry(side, side, side),
    new THREE.ShaderMaterial({
      fragmentShader: skyboxShader.fragmentShader, vertexShader: skyboxShader.vertexShader,
      uniforms: skyboxShader.uniforms, depthWrite: false, side: THREE.BackSide
    })
  );
}

SkyBox.prototype = Object.create(THREE.Mesh.prototype);

module.exports = SkyBox;
