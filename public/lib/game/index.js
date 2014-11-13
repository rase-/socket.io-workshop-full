var $ = require('jquery');
var THREE = require('three');

var SkyBox = require('./lib/skybox');
var AnimatedMD2Model = require('./lib/animated-md2');
var StaticMD2Model = require('./lib/static-md2');
var loaders = require('./lib/loaders');
var Game = require('./lib/game');
var Motion = require('./lib/motion');
var physics = require('./lib/physics');
var input = require('./lib/input');
var keys = require('./lib/keys');

// Game init function
function init(userData) {
  // load game assets
  // http://css-tricks.com/multiple-simultaneous-ajax-requests-one-callback-jquery/
  $.when(
    loaders.loadImage('lib/game/assets/skybox/Side1.jpg'),
    loaders.loadImage('lib/game/assets/skybox/Side2.jpg'),
    loaders.loadImage('lib/game/assets/skybox/Side3.jpg'),
    loaders.loadImage('lib/game/assets/skybox/Side4.jpg'),
    loaders.loadImage('lib/game/assets/skybox/Side5.jpg'),
    loaders.loadImage('lib/game/assets/skybox/Side6.jpg'),
    $.getJSON('lib/game/assets/arena/arena.json'),
    loaders.loadImage('lib/game/assets/arena/arena.jpg'),
    $.getJSON('lib/game/assets/shotgun/hud/Dreadus-Shotgun.json'),
    loaders.loadImage('lib/game/assets/shotgun/hud/Dreadus-Shotgun.jpg'),
    $.getJSON('lib/game/assets/player/spos_body.js'),
    $.getJSON('lib/game/assets/player/spos_weapon.js'),
    $.getJSON('lib/game/assets/player/spos_head.js'),
    loaders.loadImage('lib/game/assets/player/spos_body.png'),
    loaders.loadImage('lib/game/assets/player/spos_weapon.png'),
    loaders.loadImage('lib/game/assets/player/spos_head2.png')
  ).then(function(
    skyboxSide1,
    skyboxSide2,
    skyboxSide3,
    skyboxSide4,
    skyboxSide5,
    skyboxSide6,
    arenaModel,
    arenaTexture,
    shotgunModel,
    shotgunTexture,
    playerModel,
    playerWeaponModel,
    playerHeadModel,
    playerTexture,
    playerWeaponTexture,
    playerHeadTexture
  ) {
    // Create game object
    var game = new Game(userData);
    input.attach();

    // create various 3D stuff
    var skybox = new SkyBox([skyboxSide3, skyboxSide5, skyboxSide6, skyboxSide1, skyboxSide2, skyboxSide4], 1400);

    arenaModel = new StaticMD2Model(arenaModel[0], arenaTexture);
    arenaModel.material.map.anisotropy = game.renderer.maxAnisotropy;
    game.assets.arenaModel = arenaModel;

    game.renderer.renderMap(skybox, arenaModel);

    shotgunModel = new AnimatedMD2Model(shotgunModel[0], shotgunTexture);
    game.assets.shotgunModel = shotgunModel;
    game.renderer.renderWeapon(shotgunModel);

    var playerModel = new AnimatedMD2Model(playerModel[0], playerTexture);
    playerModel.add(new AnimatedMD2Model(playerWeaponModel[0], playerWeaponTexture));
    playerModel.add(new AnimatedMD2Model(playerHeadModel[0], playerHeadTexture));
    game.assets.playerModel = playerModel;

    // Audio
    game.assets.shootTrack = new Audio('lib/game/assets/shotgun.wav');

    // add 3D scene to the webpage
    $('#game').empty().append(game.renderer.domElement);
    var gameViewportSize = function() { return {
      width: window.innerWidth, height: window.innerHeight
    }};

    game.start(gameViewportSize, userData);
  }).fail(function(err, msg) {
    console.log(err, msg);
  });
}

module.exports = init;
