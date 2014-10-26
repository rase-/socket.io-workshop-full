var crypto = require('crypto');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var rooms = {};

io.on('connection', function(socket) {
  socket.on('login', function(username, callback) {
    if (socket.username) return;

    socket.username = username;

    socket.join('lobby', function(err) {
      if (err) return;

      callback && callback(roomList());
      socket.broadcast.emit('add user', username);
    });
  });

  socket.on('message', function(room, message) {
    if ('undefined' === typeof message) {
      message = room;
      room = 'lobby';
    }

    if (!socket.username) return;
    if (!message) return;

    socket.broadcast.to(room).emit('message', socket.username, message);
  });

  socket.on('add room', function(callback) {
    if (!socket.username) return;

    var hash = crypto.createHash('sha1');
    hash.update(socket.id);

    var room = hash.digest('hex');
    if (rooms[room]) return;
    rooms[room] = [socket];

    socket.join(room, function(err) {
      if (err) return;
      callback && callback(room);
      socket.broadcast.emit('add room', room, [socket.username]);
    });
  });

  socket.on('join room', function(room, callback) {
    if (!rooms[room]) return;

    socket.leaveAll();
    socket.join(room, function(err) {
      if (err) return;

      var sockets = rooms[room];
      if (!sockets) return;
      if (!~sockets.indexOf(socket)) {
        sockets.push(socket);
      }

      callback && callback(room, sockets.map(function(socket) {
        return socket.username;
      }));
      socket.broadcast.to(room).emit('join room', socket.username);
    });
  });

  socket.on('leave room', function(room, callback) {
    if (!rooms[room]) return;

    var sockets = rooms[room];
    if (!sockets) return;
    var i = sockets.indexOf(socket);
    if (~i) {
      sockets.splice(i, 1);
      if (i === 0) {
        delete rooms[room];
        socket.broadcast.emit('remove room', room);
      }
    }

    socket.leaveAll();
    socket.broadcast.to(room).emit('leave room', socket.username);

    socket.join('lobby', function(err) {
      if (err) return;
      callback && callback(roomList());
    });
  });
});

function roomList() {
  return Object.keys(rooms).map(function(room) {
    return {
      room: room,
      usernames: rooms[room].map(function(socket) {
        return socket.username;
      })
    };
  });
}

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
