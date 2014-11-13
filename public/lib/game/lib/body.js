function Body(object, height) {
  // 3d object representing our entity
  this.object = object;
  // its height above the platform
  this.height = height || 0;
}

module.exports = Body;
