var EventEmitter = require('events').EventEmitter;
var io = require('socket.io-client');

/**
 * Inherits from EventEmitter.
 */

Network.prototype.__proto__ = EventEmitter.prototype;

function Network() {
  this.socket = io('http://localhost:3000/game');
}

Network.prototype.join = function(userData, roomData) {
  this.socket.emit('join', { userData: userData, roomData: roomData });
};

module.exports = Network;
