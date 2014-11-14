var crypto = require('crypto');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var numUsers = 0;

io.on('connection', function(socket) {

  socket.on('login', function(username) {
    if (socket.user) return;

    username = username.trim();
    if (username.length > 16) return;

    socket.user = {
      id: uid(),
      username: username
    };
    socket.emit('login', socket.user);

    numUsers++;
    io.emit('num users', numUsers);

    joinLobby(socket);
  });

  socket.on('disconnect', function() {
    if (socket.user) {
      delete socket.user;
      numUsers--;
      io.emit('num users', numUsers);
    }
  });
});

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});

function uid() {
  return crypto.randomBytes(16).toString('hex');
}

function rooms() {
  // TODO
  return [];
}

function joinLobby(socket) {
  socket.join('lobby', function(err) {
    if (err) return;

    socket.roomId = 'lobby';
    socket.emit('join lobby', rooms());
  });
}
