var THREE = require('three');

function StaticMD2Model(json, image) {
  var texture = new THREE.Texture(image);
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({ map: texture });

  var loader = new THREE.JSONLoader();
  var model = loader.parse(json);
  var geometry = model.geometry;
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  THREE.Mesh.call(this, geometry, material);
}

StaticMD2Model.prototype = Object.create(THREE.Mesh.prototype);

module.exports = StaticMD2Model;
