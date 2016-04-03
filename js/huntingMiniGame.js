var huntingMiniGame = new function() {	

	var _canvas = null;
	var _context = null;
	var _sprites = null;
	
	var _self = this;
	var _timerInterval = null;
	var _callback = null;
	var _buffaloSprite = null
	var _capacity = 0;
	
	var x = 0, 
		y = 0, 
		animals = [], 
		score = 0;
	var _frameRate = 10;

	var DEFAULT_TIME_REMAINING = 10;
	var timeRemaining = DEFAULT_TIME_REMAINING;
	
	var render = function() {
	
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
		
		_context.beginPath();
		_context.rect(0, 0, _canvas.width, 13);
		_context.fillStyle = 'red';
		_context.fill();
		
		for (var i = 0; i < animals.length; i++) {
			var chip = animals[i];
			_buffaloSprite.render(_context, chip.x, chip.y);
		}
		
		_hunterSprite.render(_context, x, y);
		
		_context.textAlign = 'right';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'black';
		_context.fillText('Animals killed: ' + score, 278, 10);		
		_context.fillText(Math.floor(timeRemaining), 60, 10);
		_context.textAlign = 'left';	
		_context.fillText('Time: ', 10, 10);
	}
	
	var spawnAnimal = function() {
		var height = _buffaloSprite.height;
		var width = _buffaloSprite.width;
		
		var x = 0 - width;
		var y = Math.floor(Math.random() * (_canvas.height - height - 15)) + 15;
		var speed = Math.floor(Math.random() * 10) + 3;
		
		return {
			speed: speed,
			x: x,
			y: y
		};		
	}
	
	var handleCollision = function(animalIndex) {		
		if (animalIndex != null) {
			animals.splice(animalIndex, 1);
			score++;
		}
	}
	
	var detectCollision = function() {
		var animalHeight = _buffaloSprite.height;
		var animalWidth = _buffaloSprite.width;
		var hunterHeight = _hunterSprite.height;
		var hunterWidth = _hunterSprite.width;
		for (var i = 0; i < animals.length; i++) {
			var chip = animals[i];
			if (x + hunterWidth >= chip.x && x <= chip.x + animalWidth 
				&& y + hunterHeight >= chip.y && y <= chip.y + animalHeight) {
				handleCollision(i);
			}
		}
		return null;
	}
	
	var end = function(meat) {
		timeRemaining = DEFAULT_TIME_REMAINING;
		animals = [];
		score = 0;
		window.document.onkeydown = null;
		_callback(meat);
	}
	
	var showPostMortem = function() {
		var meat = 0;
		for (var i = 0; i < score; i++) {
			meat += Math.round(Math.random() * 200) + 200;
		}
		meat = Math.round(meat);
		
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
		
		var horizontalCenter = Math.round(_canvas.width / 2);
				
		_context.textAlign = 'center';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'red';
		
		if (meat == 0) {
			_context.fillText('You obtained no meat.', horizontalCenter, 100);
		}
		else {
			_context.fillText('You killed ' + meat + ' pounds of meat.', horizontalCenter, 80);
			_context.fillText('You can carry ' + _capacity + ' pounds of meat;', horizontalCenter, 90);
			_context.fillText('the rest is wasted.', horizontalCenter, 100);
		}
				
		_context.fillStyle = 'white';
		_context.fillText('Press ENTER to continue.', horizontalCenter, 120);
				
		if (meat > _capacity) {
			meat = _capacity;
		}
		
		clearInterval(_timerInterval);
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					end(meat);
					break;				
			}
		}
	}
	
	this.update = function() {
	
		if (Math.random() < 0.03) {
			animals.push(spawnAnimal());
		}
	
		for (var i = 0; i < animals.length; i++) {
			animals[i].x += animals[i].speed;
		}
		detectCollision();
	
		timeRemaining -= 1 / _frameRate;
		render();
		if (Math.floor(timeRemaining) <= 0) {
			showPostMortem();
		}
	}
	
	this.start = function(capacity, canvas, context, sprites, audioAssets, callback) {		
		_capacity = capacity;		
		_canvas = canvas;
		_context = context;
		_sprites = sprites;
		_callback = callback;
		_buffaloSprite = _sprites['buffalo'];
		_hunterSprite = _sprites['hunter'];
			
		var horizontalCenter = _canvas.width / 2;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		_context.textAlign = 'left';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'white';
		_context.fillText('Every moving thing that liveth', 10, 20);
		_context.fillText('shall be meat for you; even as', 10, 30);
		_context.fillText('the green herb have I given you', 10, 40);
		_context.fillText('all things.', 10, 50);
		_context.fillText('And surely blood shall not be', 10, 70);
		_context.fillText('shed, only for meat, to save your', 10, 80);
		_context.fillText('lives; and the blood of every', 10, 90);
		_context.fillText('beast will I require at your', 10, 100);
		_context.fillText('hands.', 10, 110);
		_context.fillText('-- Genesis 9,', 10, 130);
		
		_context.fillText('   Joseph Smith Translation', 10, 140);
							
		context.beginPath();
		context.rect(7, 175, 250, 13);
		context.fillStyle = 'white';
		context.fill();

		context.fillStyle = 'black';
		context.fillText('Press ENTER to play', 10, 185);
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					play();
					break;				
			}
		}
	}
	
	var play = function(canvas, context, sprites, audioAssets, callback) {		
		_timerInterval = setInterval(function() { 
			_self.update(); 
		}, 1000 / _frameRate);
		
		var horizontalCenter = _canvas.width / 2;
		var verticalCenter = _canvas.height / 2;
		
		var speed = 1;
		var hunterHeight = _hunterSprite.height;
		var hunterWidth = _hunterSprite.width;
		x = horizontalCenter - Math.floor(hunterWidth / 2);
		y = verticalCenter - Math.floor(hunterHeight / 2);
				
		render();
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.UP:
					if (y >= speed + 12) {
						y -= speed;
						detectCollision();
						render();
					}
					break;
				case keyboard.DOWN:
					if (y <= _canvas.height - hunterHeight - speed) {
						y += speed;
						detectCollision();
						render();
					}
					break;
				case keyboard.LEFT:
					if (x >= speed) {
						x -= speed;
						detectCollision();
						render();
					}
					break;
				case keyboard.RIGHT:
					if (x <= _canvas.width - hunterWidth - speed) {
						x += speed;
						detectCollision();
						render();
					}
					break;
			}
		}
	}
}