var shoulderMiniGame = new function() {	
	var _canvas = null;
	var _context = null;
	var _sprites = null;	
	
	var _self = this;
	var _physicsTimer = null;
	var _timerInterval = null;
	var _callback = null;
	var _frame = 1;
	var _force = 0;
	
	var timeRemaining = 10;
	
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

		const meterWidth = 170;
		_context.beginPath();
		_context.rect(100, 3, meterWidth, 7);
		_context.fillStyle = 'black';
		_context.fill();
		
		var max = meterWidth;
		var scale = _force / 5 * max;
		if (scale > max) {
			scale = max;
		}
		_context.beginPath();
		_context.rect(100, 3, Math.floor(scale), 7);
		_context.fillStyle = 'red';
		_context.fill();

		_context.fillStyle = 'white';
		_context.fillText("Time: ", 10, 10);
		
		_context.beginPath();
		_context.rect(40, 170, 200, 20);
		_context.fillStyle = 'black';
		_context.fill();

		_context.textAlign = "center"
		_context.fillStyle = 'white';
		_context.fillText("Press P to push", 160, 183);
	}
			
	var end = function(wasSuccessful) {
		timeRemaining = 10;
		clearInterval(_physicsTimer);
		clearInterval(_timerInterval);
		window.document.onkeydown = null;

		if (wasSuccessful) {
			console.log("You dislodged your stuck wheel!");
		} else {
			console.log("Your wheel is still stuck.");
		}

		_callback();
	}
		
	this.reduceTime = function() {
		timeRemaining--;
		render();
		if (timeRemaining == 0) {
			end(false);
		}
	}

	this.updatePhysics = function() {
		var gravity = 1;
		if (_force > 0) {
			_force -= gravity;
			if (_force < 0) {
				_force = 0;
			}
		}
		if (_force > 4) {
			end(true);
			_force = 4;
		}
		_frame = Math.floor(_force + 1);

		render();
	}
	
	this.start = function(canvas, context, sprites, audioAssets, callback) {	
		_canvas = canvas;
		_context = context;
		_sprites = sprites;
		_callback = callback;
		_frame = 1;
		_froce = 0;
	
		var PUT_YOUR_SHOULDER_TO_THE_WHEEL = 8;
		var song = audioAssets[PUT_YOUR_SHOULDER_TO_THE_WHEEL];
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
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.P:
					var min = 0;
					var max = 0.5;
					var providence = Math.random() * (max - min) + min;
					_force += providence;
					if (_force < 1) {
						_force++;
					} else if (_force < 2) {
						_force += 0.75;
					} else if (_force < 3) {
						_force += 0.5;
					} else if (_force < 4) {
						_force += 0.25;
					}
					render();
					break;
			}
		}
	}
}