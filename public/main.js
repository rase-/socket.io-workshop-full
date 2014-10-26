$(function() {
  var socket = io();
  var $window = $(window);
  var $pages = $('.pages');

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
      if (!/[a-zA-Z1-9]+/.test(username)) return;

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
    $rooms.empty();
    rooms.forEach(function(room) {
      $rooms.prepend(createRoomNode(room.room, room.usernames));
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
      createMessageNode(username, message).appendTo($messages);
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

    socket.on('room added', function(room, usernames) {
      $rooms.prepend(createRoomNode(room, usernames));
    });

    socket.on('room removed', function(room) {
      $rooms.find('.room').each(function(i, r) {
        var $room = $(r);
        if ($room.attr('data-room') === room) {
          $room.remove();
          return false;
        }
      });
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
    $page.show();
    $input.focus();

    $users.empty();
    usernames.forEach(function(username) {
      $users.append(createUserNode(username));
    });

    // chat
    $form.off('submit');
    $form.submit(function(e) {
      e.preventDefault();
      var message = $input.val().trim();
      if (!message) return;

      socket.emit('message', room, message);
      $input.val('');
      addMessage(socket.username, message);
    });

    socket.on('message', addMessage);

    function addMessage(username, message) {
      createMessageNode(username, message).appendTo($messages);
    }

    // sidebar
    $leaveRoom.off('click');
    $leaveRoom.click(function() {
      socket.emit('leave room', room, function(rooms) {
        backToLobby(rooms);
      });
    });

    socket.on('user joined', function(username) {
      $users.append(createUserNode(username));
    });

    socket.on('user left', function(username) {
      $users.find('.user').each(function(i, user) {
        var $user = $(user);
        if ($user.text() === username) {
          $user.remove();
          return false;
        }
      });
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

  function createMessageNode(username, message) {
    return $('<li class="message"/>')
      .append($('<span class="username"/>').text(username))
      .append($('<span class="message"/>').text(message));
  }

  function createUserNode(username) {
    return $('<li class="user"/>')
      .append($('<span class="username"/>').text(username));
  }

  function createRoomNode(room, usernames) {
    var creator = usernames[0];
    var roomName = creator + '\'s game';
    return $('<li class="room"/>')
      .attr('data-room', room)
      .append($('<span class="room"/>').text(roomName));
  }
});
