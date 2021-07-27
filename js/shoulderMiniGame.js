var shoulderMiniGame = new function() {	
	var _canvas = null;
	var _context = null;
	var _sprites = null;	
	
	var _self = this;
	var _physicsTimer = null;
	var _timerInterval = null;
	var _callback = null;
	var _frame = 2;
	var _velocity = 0;
	
	var timeRemaining = 1000; //TODO: 10
	
	var render = function() {
		_context.clearRect(0, 0, _canvas.width, _canvas.height);

		_sprites["shoulder-" + _frame].render(_context, 0, 0);
				
		_context.beginPath();
		_context.rect(0, 0, _canvas.width, 13);
		_context.fillStyle = '#453d3b';
		_context.fill();
				
		_context.textAlign = 'right';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'white';
		_context.fillText(timeRemaining, 70, 10);
		_context.textAlign = 'left';

		_context.fillText(_velocity, 120, 10);
		_context.fillText(_frame, 160, 10);

		_context.fillText("Time: ", 10, 10);
	}
			
	var end = function() {
		timeRemaining = 10;
		clearInterval(_physicsTimer);
		clearInterval(_timerInterval);
		window.document.onkeydown = null;
		_callback();
	}
		
	this.reduceTime = function() {
		timeRemaining--;
		render();
		if (timeRemaining == 0) {
			end();
		}
	}

	this.updatePhysics = function() {
		const gravity = 2;
		if (_velocity > 0) {
			_velocity -= gravity;
		} else if (_velocity < 0) {
			_velocity += gravity;
		}

		switch (_frame) {
			case 1:
				if (_velocity > -30) {
					_frame++;
				}
				break;
			case 2:
				if (_velocity <= -30) {
					_frame--;
				} else if (_velocity > -10) {
					_frame++;
				}
				break;
			case 3:
				if (_velocity >= 10) {
					_frame++;
				} else if (_velocity <= -10) {
					_frame--;
				}
				break;
			case 4: 
				if (_velocity >= 30) {
					_frame++;
				} else if (_velocity < 10) {
					_frame--;
				}
				break;
			case 5: 
				if (_velocity < 30) {
					_frame--;
				}
				break;
		}
	}
	
	this.start = function(canvas, context, sprites, audioAssets, callback) {	
		_canvas = canvas;
		_context = context;
		_sprites = sprites;
		_callback = callback;
		_frame = 2;
	
		//TODO: PUT_YOUR_SHOULDER_TO_THE_WHEEL
		var WOAH_HAW_BUCK_AND_JERRY_BOY = 1;
		var song = audioAssets[WOAH_HAW_BUCK_AND_JERRY_BOY];
		if (typeof song.element != 'undefined') {
			song.element.currentTime = 0;
			song.element.play();
		}
				
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		_context.textAlign = 'left';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'white';
								
		_context.fillText('"Put your shoulder to the wheel; ', 10, 20);
		_context.fillText('     push along,', 10, 30);
		_context.fillText('Do your duty with a heart ', 10, 40);
		_context.fillText('     full of song', 10, 50);
		_context.fillText('We all have work; ', 10, 60);
		_context.fillText('     let no one shirk.', 10, 70);
		_context.fillText('Put your shoulder to the wheel."', 10, 80);
		_context.fillText(' -- Put Your Shoulder to the Wheel,', 10, 100);
		_context.fillText('     Will L. Thompson', 10, 110);
					
		context.beginPath();
		context.rect(7, 175, 250, 13);
		context.fillStyle = 'white';
		context.fill();

		context.fillStyle = 'black';
		context.fillText("Press ENTER to play", 10, 185);
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					play(canvas, context, sprites, audioAssets, callback);
					break;				
			}
		}
	}
	
	var play = function(canvas, context, sprites, audioAssets, callback) {		
		_timerInterval = setInterval(function() { _self.reduceTime(); }, 1000);
		_physicsTimer = setInterval(function() { _self.updatePhysics(); }, 100);
				
		render();
		
		//TODO: Do onkeypress instead of onkeydown so you have to spam it instead of holding it down.
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.LEFT:
					_velocity--;
					render();
					break;
				case keyboard.RIGHT:
					_velocity++;
					render();
					break;
			}
		}
	}
}