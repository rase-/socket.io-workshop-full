$(function() {
  var socket = io();
  var $document = $(document);
  var $header = $('.header');
  var $pages = $('.pages');
  var messageHtml = $('#template-message').html();
  var logHtml = $('#template-log').html();
  var roomHtml = $('#template-room').html();
  var userHtml = $('#template-user').html();

  socket.on('num users', function(num) {
    $header.find('.num-users').text(num);
  });

  $document.on('headerTitle', function(e, title) {
    $header.toggle(!!title);
    $header.find('.title').text(title);
  });

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
      socket.emit('login', username, function(user, rooms) {
        socket.user = user;
        $page.hide();
        $page.trigger('lobby', [rooms]);
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

    $page.trigger('headerTitle', 'Lobby');

    $messages.empty();
    $messages.append(logNode('Welcome to the game'));

    $rooms.empty();
    rooms.forEach(function(room) {
      $rooms.prepend(roomNode(room));
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
      addMessage(socket.user, message);
    });

    socket.on('message', addMessage);

    function addMessage(user, message) {
      messageNode(user, message).appendTo($messages);
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // sidebar
    $newRoom.off('click');
    $newRoom.click(function() {
      socket.emit('add room', function(room) {
        navigateToRoom(room);
      });
    });

    $rooms.off('click');
    $rooms.on('click', '.room', function() {
      var roomId = $(this).attr('data-id');
      socket.emit('join room', roomId, function(room) {
        navigateToRoom(room);
      });
    });

    socket.on('room added', function(room) {
      $rooms.prepend(roomNode(room));
    });

    socket.on('room removed', function(roomId) {
      $rooms.find('.room[data-id=' + roomId + ']').remove();
    });

    socket.on('room changed', function(room) {
      $rooms.find('.room[data-id=' + room.id + ']').find('.num-users').text(room.users.length);
    });

    function navigateToRoom(room) {
      socket.off('message');
      socket.off('room added');
      socket.off('room removed');
      $page.hide();
      $page.trigger('room', [room]);
    }
  });

  $pages.on('room', function(e, room) {
    var $page = $pages.find('.page.room');
    var $form = $page.find('form');
    var $input = $page.find('input.message');
    var $messages = $page.find('.messages');
    var $leaveRoom = $page.find('.leave-room');
    var $users = $page.find('.users');

    $page.trigger('headerTitle', room.name);

    $messages.empty();
    $messages.append(logNode('You have joined ' + room.name));

    $users.empty();
    room.users.forEach(function(user) {
      $users.append(userNode(user));
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
      addMessage(socket.user, message);
    });

    socket.on('message', addMessage);

    function addMessage(user, message) {
      messageNode(user, message).appendTo($messages);
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // sidebar
    $leaveRoom.off('click');
    $leaveRoom.click(function() {
      socket.emit('leave room', function(rooms) {
        backToLobby(rooms);
      });
    });

    socket.on('user joined', function(user) {
      $messages.append(logNode(user.username + ' joined'));
      $users.append(userNode(user));
    });

    socket.on('user left', function(user) {
      $messages.append(logNode(user.username + ' left'));
      $users.find('.user[data-id=' + user.id + ']').remove();
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
      $page.trigger('lobby', [rooms]);
    }
  });

  // navigate to login
  $pages.trigger('login');

  function messageNode(user, message) {
    var $message = $(messageHtml);
    $message.find('.username').text(user.username);
    $message.find('.body').text(message);
    return $message;
  }

  function logNode(text) {
    return $(logHtml).text(text);
  }

  function roomNode(room) {
    var $room = $(roomHtml).attr('data-id', room.id);
    $room.find('.roomname').text(room.name);
    $room.find('.num-users').text(room.users.length);
    return $room;
  }

  function userNode(user) {
    var $user = $(userHtml).attr('data-id', user.id);
    $user.find('.username').text(user.username);
    return $user;
  }
});
