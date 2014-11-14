var EventEmitter = require('events').EventEmitter;
var io = require('socket.io-client');

/**
 * Inherits from EventEmitter.
 */

Network.prototype.__proto__ = EventEmitter.prototype;

function Network() {
  this.socket = io('http://localhost:3000/game');
  this.socket.on('player:sync', function(motion) { this.emit('sync', motion); }.bind(this));
  this.socket.on('player:hit', function(data) { this.emit('hit', data); }.bind(this));
  this.socket.on('winner', function(player) { this.emit('winner', player); }.bind(this));
  this.socket.on('player:disconnected', function(id) { this.emit('disconnect', id); }.bind(this));
}

Network.prototype.join = function(userData, roomData) {
  this.socket.emit('join', { userData: userData, roomData: roomData });
};

Network.prototype.sendPlayerData = function(data) {
  this.socket.emit('player:sync', data);
};

Network.prototype.sendHit = function(playerID) {
  this.socket.emit('player:hit', playerID);
};

module.exports = Network;
