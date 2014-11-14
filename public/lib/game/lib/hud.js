var $ = require('jquery');

function HUD(hero, players) {
  this.hero = hero;
  this.players = players;

  this.$health = $('.hud #health');
  this.$points = $('.hud #points');
  this.$hurtOverlay = $('.hud #hurt-overlay');
  this.$allPointsOverlay = $('.hud #all-points');
}

HUD.prototype.update = function() {
  // Update player HUD
  this.$health.text('Health: ' + this.hero.health);
  this.$points.text('Points:  ' + this.hero.points);

  // Update score HUD
  this.$allPointsOverlay.empty();

  // Add hero player
  var $playerInfo = this.$allPointsOverlay.append($('#template-all-points').html());
  $playerInfo.find('.username').text(this.hero.username);
  $playerInfo.find('.points').text(this.hero.points);

  var self = this;
  Object.keys(this.players).forEach(function(id) {
    var player = self.players[id];

    self.$allPointsOverlay.append($('#template-all-points').html());
    var $playerInfo = $('.hud #all-points .player:last');
    $playerInfo.find('.username').text(player.username);
    $playerInfo.find('.points').text(player.points);
  });
};

HUD.prototype.showAllPoints = function() {
  this.$allPointsOverlay.show();
};

HUD.prototype.hideAllPoints = function() {
  this.$allPointsOverlay.hide();
};

HUD.prototype.flashRed = function() {
  this.$hurtOverlay.fadeIn(75);
  this.$hurtOverlay.fadeOut(320);
};

module.exports = HUD;
