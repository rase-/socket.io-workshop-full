var crypto = require('crypto');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var roomMap = {};
var numUsers = 0;

io.on('connection', function(socket) {
  socket.on('login', function(username, callback) {
    if (socket.user) return;

    username = username.trim();
    if (!/^[a-zA-Z1-9_\-]{1,16}$/.test(username)) return;

    socket.user = {
      id: crypto.createHash('sha1').update(socket.id).digest('hex'),
      username: username
    };

    numUsers++;
    io.emit('num users', numUsers);

    socket.join('lobby', function(err) {
      if (err) return;

      socket.roomId = 'lobby';
      callback && callback(socket.user, rooms());
    });
  });

  socket.on('message', function(message) {
    if (!socket.user) return;
    if (!socket.roomId) return;
    if (!message) return;

    var eventName = 'lobby' === socket.roomId ? 'lobby message' : 'message';
    socket.broadcast.to(socket.roomId).emit(eventName, socket.user, message);
  });

  socket.on('add room', function(callback) {
    if (!socket.user) return;

    var roomId = socket.user.id;
    if (roomMap[roomId]) return;

    var room = roomMap[roomId] = {
      id: roomId,
      name: socket.user.username + '\'s game',
      users: [socket.user]
    };

    socket.leaveAll();
    socket.roomId = null;
    socket.join(roomId, function(err) {
      if (err) return;

      socket.roomId = roomId;
      callback && callback(room);
      socket.broadcast.to('lobby').emit('room added', room);
    });
  });

  socket.on('join room', function(roomId, callback) {
    if (!roomMap[roomId]) return;

    socket.leaveAll();
    socket.roomId = null;
    socket.join(roomId, function(err) {
      if (err) return;

      var room = roomMap[roomId];
      if (!room) return;
      if (!~room.users.indexOf(socket.user)) {
        room.users.push(socket.user);
      }

      socket.roomId = roomId;
      callback && callback(room);
      socket.broadcast.to('lobby').emit('room changed', room);
      socket.broadcast.to(roomId).emit('user joined', socket.user);
    });
  });

  socket.on('leave room', function(callback) {
    if (!socket.user) return;
    if (!socket.roomId) return;

    leave();
    socket.join('lobby', function(err) {
      if (err) return;
      socket.roomId = 'lobby';
      callback && callback(rooms());
    });
  });

  socket.on('disconnect', function() {
    leave();

    if (socket.user) {
      delete socket.user;
      numUsers--;
      io.emit('num users', numUsers);
    }
  });

  function leave() {
    var roomId = socket.roomId;
    var room = roomMap[roomId];
    if (!room) return;

    var i = room.users.indexOf(socket.user);
    if (!~i) return;

    room.users.splice(i, 1);
    socket.leaveAll();
    socket.roomId = null;

    if (i === 0) {
      // remove the room when the user is the creator of it
      delete roomMap[roomId];
      socket.broadcast.to('lobby').emit('room removed', roomId);
      socket.broadcast.to(roomId).emit('room closed', rooms());
    } else {
      socket.broadcast.to('lobby').emit('room changed', room);
      socket.broadcast.to(roomId).emit('user left', socket.user);
    }
  }
});

function rooms() {
  return Object.keys(roomMap).map(function(roomId) {
    return roomMap[roomId];
  });
}

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
