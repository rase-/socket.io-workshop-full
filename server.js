var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
});

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
