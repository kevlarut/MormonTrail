window.addEventListener('keydown', function(event) {
	var ENTER = 13;
  
	switch (event.keyCode) {
		case ENTER:
			game.togglePause();
			break;
	}
}, false);