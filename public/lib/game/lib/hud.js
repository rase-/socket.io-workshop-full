var $ = require('jquery');

function HUD(hero) {
  this.hero = hero;
  this.$health = $('.hud #health');
  this.$points = $('.hud #points');
  this.$hurtOverlay = $('.hud #hurtOverlay');
}

HUD.prototype.update = function(health, points) {
  this.$health.text('Health: ' + this.hero.health);
  this.$points.text('Points:  ' + this.hero.points);
};

HUD.prototype.flashRed = function() {
  this.$hurtOverlay.fadeIn(75);
  this.$hurtOverlay.fadeOut(320);
};

module.exports = HUD;
