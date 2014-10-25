$(function() {
  var socket = io();
  var $window = $(window);
  var $pages = $('.pages');
  var $currentInput;

  $pages.on('login', function() {
    var $page = $pages.find('.page.login');
    var $form = $page.find('form');
    var $input = $page.find('input.username');

    $page.show();
    $currentInput = $input;

    $page.click(function(e){
      $input.focus();
    });

    $form.submit(function(e) {
      e.preventDefault();
      var username = $input.val().trim();
      if (!/[a-zA-Z1-9]+/.test(username)) return;

      socket.emit('login', username, function() {
        socket.username = username;
        $page.hide();
        $page.off('click');
        $currentInput = null;
        $pages.trigger('lobby');
      });
    });
  });

  $pages.on('lobby', function() {
    var $page = $pages.find('.page.lobby');
    var $form = $page.find('form');
    var $input = $page.find('input.message');
    var $messages = $page.find('.messages');

    $page.show();
    $currentInput = $input;

    $form.submit(function(e) {
      e.preventDefault();
      var message = $input.val().trim();
      if (!message) return;

      socket.emit('lobby message', message);
      $input.val('');
      addMessage(socket.username, message);
    });

    socket.on('lobby message', addMessage);

    function addMessage(username, message) {
      createMessageNode(username, message).appendTo($messages);
    }
  });

  // navigate to login
  $pages.trigger('login');

  function createMessageNode(username, message) {
    return $('<li class="message"/>')
      .append($('<span class="username"/>').text(username))
      .append($('<span class="message"/>').text(message));
  }
});
