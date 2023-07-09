var buffaloChipsMiniGame = new function() {	
	var _canvas = null;
	var _context = null;
	var _sprites = null;	
	var _girl = null;
	
	var _self = this;
	var _animationInterval = null;
	var _timerInterval = null;
	var _callback = null;
	
	var x = 0, y = 0, chips = [], score = 0;

	var timeRemaining = 10;
	
	var drawHuntForBuffaloChips = function() {
		_context.beginPath();
		_context.rect(0, 0, _canvas.width, _canvas.height);
		_context.fillStyle = '#404b07';
		_context.fill();
		
		_context.beginPath();
		_context.rect(0, 0, _canvas.width, 13);
		_context.fillStyle = '#c69c6d';
		_context.fill();
		
		for (var i = 0; i < chips.length; i++) {
			var chip = chips[i];
			_sprites['buffalo-chip'].render(_context, chip.x, chip.y);
		}
		
		_girl.render(_context, x, y);
		
		_context.textAlign = 'right';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'black';
		_context.fillText("Buffalo Chips Collected: " + score, 278, 10);		
		_context.fillText(timeRemaining, 60, 10);
		_context.textAlign = 'left';	
		_context.fillText("Time: ", 10, 10);
	}
	
	var spawnRandomBuffaloChip = function() {
		var height = 6;
		var width = 6;

		var x = Math.floor(Math.random() * (_canvas.width - width));
		var y = Math.floor(Math.random() * (_canvas.height - height - 15)) + 15;
		
		return {
			x: x,
			y: y
		};		
	}
	
	var detectBuffaloChipCollision = function(girlX, girlY, chips) {
		var chipHeight = 6;
		var chipWidth = 6;
		var girlHeight = _girl.height;
		var girlWidth = _girl.width;
		for (var i = 0; i < chips.length; i++) {
			var chip = chips[i];
			if (girlX + girlWidth >= chip.x && girlX <= chip.x + chipWidth 
				&& girlY + girlHeight >= chip.y && girlY <= chip.y + chipHeight) {
				return i;
			}
		}
		return null;
	}
	
	var end = function() {
		inventory.buffaloChips += score;
		timeRemaining = 10;
		chips = [];
		score = 0;
		clearInterval(_animationInterval);
		clearInterval(_timerInterval);
		window.document.onkeydown = null;
		_callback();
	}
	
	this.updateAnimations = function() {
		_girl.update();
	}
	
	this.reduceTime = function() {
		timeRemaining--;
		drawHuntForBuffaloChips();
		if (timeRemaining == 0) {
			end();
		}
	}
	
	this.start = function(canvas, context, sprites, audioAssets, callback) {	
		_canvas = canvas;
		_context = context;
		_sprites = sprites;
		_callback = callback;
		_girl = _sprites['eliza-walking'];
	
		var WOAH_HAW_BUCK_AND_JERRY_BOY = 1;
		var song = audioAssets[WOAH_HAW_BUCK_AND_JERRY_BOY];
		if (typeof song.element != 'undefined') {
			song.element.currentTime = 0;
			song.element.play();
		}
		
		var horizontalCenter = _canvas.width / 2;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		_context.textAlign = 'left';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'white';
											
		_context.fillText('"Look at her now ', 10, 20);
		_context.fillText('     with a pout on her lips', 10, 30);
		_context.fillText('As daintily ', 10, 40);
		_context.fillText('     with her finger tips', 10, 50);
		_context.fillText('She picks for the fire ', 10, 60);
		_context.fillText('     some buffalo chips"', 10, 70);
		_context.fillText(' -- Woah Haw Buck and Jerry Boy,', 10, 90);
		_context.fillText('     a Mormon folk song', 10, 100);
					
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
		
		_animationInterval = setInterval(function() { _self.updateAnimations(); }, 100);
		_timerInterval = setInterval(function() { _self.reduceTime(); }, 1000);
		
		var horizontalCenter = _canvas.width / 2;
		var verticalCenter = _canvas.height / 2;
		
		var speed = 2;
		var girlHeight = sprites['eliza-walking'].height;
		var girlWidth = sprites['eliza-walking'].width;
		x = horizontalCenter - Math.floor(girlWidth / 2);
		y = verticalCenter - Math.floor(girlHeight / 2);
		
		for (var i = 0; i < 10; i++) {
			chips.push(spawnRandomBuffaloChip());
		}
		
		drawHuntForBuffaloChips();
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.UP:
					if (y >= speed + 12) {
						y -= speed;
						var collidingChipIndex = detectBuffaloChipCollision(x, y, chips);
						if (collidingChipIndex != null) {
							chips.splice(collidingChipIndex, 1);
							score++;
						}
						drawHuntForBuffaloChips();
					}
					break;
				case keyboard.DOWN:
					if (y <= _canvas.height - girlHeight - speed) {
						y += speed;
						var collidingChipIndex = detectBuffaloChipCollision(x, y, chips);
						if (collidingChipIndex != null) {
							chips.splice(collidingChipIndex, 1);
							score++;
						}
						drawHuntForBuffaloChips();
					}
					break;
				case keyboard.LEFT:
					if (x >= speed) {
						x -= speed;
						var collidingChipIndex = detectBuffaloChipCollision(x, y, chips);
						if (collidingChipIndex != null) {
							chips.splice(collidingChipIndex, 1);
							score++;
						}
						drawHuntForBuffaloChips();
					}
					break;
				case keyboard.RIGHT:
					if (x <= _canvas.width - girlWidth - speed) {
						x += speed;
						var collidingChipIndex = detectBuffaloChipCollision(x, y, chips);
						if (collidingChipIndex != null) {
							chips.splice(collidingChipIndex, 1);
							score++;
						}
						drawHuntForBuffaloChips();
					}
					break;
			}
		}
	}
}