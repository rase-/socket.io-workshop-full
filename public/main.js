$(function() {
  var socket = io();
  var $pages = $('.pages');
  var messageHtml = $('#template-message').html();
  var logHtml = $('#template-log').html();
  var roomHtml = $('#template-room').html();
  var userHtml = $('#template-user').html();

  $pages.on('login', function() {
    var $page = $pages.find('.page.login');
    var $form = $page.find('form');
    var $input = $page.find('input.username');

    $page.show();
    $input.focus();

    $page.click(function(e){
      $input.focus();
    });

    $form.off('submit');
    $form.submit(function(e) {
      e.preventDefault();
      var username = $input.val().trim();
      socket.emit('login', username, function(rooms) {
        socket.username = username;
        $page.hide();
        $pages.trigger('lobby', [rooms]);
      });
    });
  });

  $pages.on('lobby', function(e, rooms) {
    var $page = $pages.find('.page.lobby');
    var $form = $page.find('form');
    var $input = $page.find('input.message');
    var $messages = $page.find('.messages');
    var $newRoom = $page.find('.new-room');
    var $rooms = $page.find('.rooms');

    $messages.empty();
    $messages.append(logNode('Welcome to the game'));

    $rooms.empty();
    rooms.forEach(function(room) {
      $rooms.prepend(roomNode(room.room, room.usernames));
    });

    $page.show();
    $input.focus();

    // chat
    $form.off('submit');
    $form.submit(function(e) {
      e.preventDefault();
      var message = $input.val().trim();
      if (!message) return;

      socket.emit('message', message);
      $input.val('');
      addMessage(socket.username, message);
    });

    socket.on('message', addMessage);

    function addMessage(username, message) {
      messageNode(username, message).appendTo($messages);
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // sidebar
    $newRoom.off('click');
    $newRoom.click(function() {
      socket.emit('add room', function(room) {
        navigateToRoom(room, [socket.username]);
      });
    });

    $rooms.off('click');
    $rooms.on('click', '.room', function() {
      var room = $(this).attr('data-room');
      socket.emit('join room', room, function(room, usernames) {
        navigateToRoom(room, usernames);
      });
    });

    socket.on('room added', function(room, username) {
      $rooms.prepend(roomNode(room, [username]));
    });

    socket.on('room removed', function(room) {
      $rooms.find('.room[data-room=' + room + ']').remove();
    });

    socket.on('room updated', function(room, userNum) {
      $rooms.find('.room[data-room=' + room + ']').find('.user-num').text(userNum);
    });

    function navigateToRoom(room, usernames) {
      socket.off('message');
      socket.off('room added');
      socket.off('room removed');
      $page.hide();
      $pages.trigger('room', [room, usernames]);
    }
  });

  $pages.on('room', function(e, room, usernames) {
    var $page = $pages.find('.page.room');
    var $form = $page.find('form');
    var $input = $page.find('input.message');
    var $messages = $page.find('.messages');
    var $leaveRoom = $page.find('.leave-room');
    var $users = $page.find('.users');

    $messages.empty();
    $messages.append(logNode('You have joined ' + usernames[0] + '\'s game'));

    $users.empty();
    usernames.forEach(function(username) {
      $users.append(userNode(username));
    });

    $page.show();
    $input.focus();

    // chat
    $form.off('submit');
    $form.submit(function(e) {
      e.preventDefault();
      var message = $input.val().trim();
      if (!message) return;

      socket.emit('message', message);
      $input.val('');
      addMessage(socket.username, message);
    });

    socket.on('message', addMessage);

    function addMessage(username, message) {
      messageNode(username, message).appendTo($messages);
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // sidebar
    $leaveRoom.off('click');
    $leaveRoom.click(function() {
      socket.emit('leave room', function(rooms) {
        backToLobby(rooms);
      });
    });

    socket.on('user joined', function(username) {
      $messages.append(logNode(username + ' joined'));
      $users.append(userNode(username));
    });

    socket.on('user left', function(username) {
      $messages.append(logNode(username + ' left'));
      $users.find('.user[data-username=' + username + ']:first').remove();
    });

    socket.on('room closed', function(rooms) {
      alert('The game was closed');
      backToLobby(rooms);
    });

    function backToLobby(rooms) {
      socket.off('message');
      socket.off('user joined');
      socket.off('user left');
      socket.off('room closed');
      $page.hide();
      $pages.trigger('lobby', [rooms]);
    }
  });

  // navigate to login
  $pages.trigger('login');

  function messageNode(username, message) {
    var $message = $(messageHtml);
    $message.find('.username').text(username);
    $message.find('.body').text(message);
    return $message;
  }

  function logNode(text) {
    return $(logHtml).text(text);
  }

  function roomNode(room, usernames) {
    var roomName = usernames[0] + '\'s game';
    var $room = $(roomHtml).attr('data-room', room);
    $room.find('.roomname').text(roomName);
    $room.find('.user-num').text(usernames.length);
    return $room;
  }

  function userNode(username) {
    var $user = $(userHtml).attr('data-username', username);
    $user.find('.username').text(username);
    return $user;
  }
});
