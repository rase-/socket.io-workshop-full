var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  socket.on('login', function(username, callback) {
    if (socket.username) return;

    console.log('add a user:', username);
    socket.username = username;
    callback && callback();
    socket.broadcast.emit('new user', { username: username });
  });

  socket.on('lobby message', function(message) {
    if (!socket.username) return;
    if (!message) return;

    console.log('message: ' + message);
    socket.broadcast.emit('lobby message', socket.username, message);
  });
});

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
