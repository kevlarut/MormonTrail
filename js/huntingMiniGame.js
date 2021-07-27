var huntingMiniGame = new function() {	

	var _canvas = null;
	var _context = null;
	var _sprites = null;
	
	var _self = this;
	var _timerInterval = null;
	var _callback = null;
	var _buffaloSprite = null;
	var _deadBuffaloSprite = null;
	var _capacity = 0;
	var _direction = "left";
	var _lastFireTime = 0;
	var _rateOfFire = 1000;
	var _rabbitSprite = null;
	var _deadRabbitSprite = null;

	var bullets = [];
	var _deadAnimals = [];
	
	var x = 0, 
		y = 0, 
		animals = [], 
		score = 0;
	var _frameRate = 10;

	var DEFAULT_TIME_REMAINING = 60;
	var timeRemaining = DEFAULT_TIME_REMAINING;
	
	var render = function() {	
		_context.clearRect(0, 0, _canvas.width, _canvas.height);		
		_sprites['hunting-background'].render(_context, 0, 13);
		
		_context.beginPath();
		_context.rect(0, 0, _canvas.width, 13);
		_context.fillStyle = 'red';
		_context.fill();		

		var spritesToRender = [];
		animals.forEach(animal => 
			spritesToRender.push({
				sprite: animal.sprite,
				x: animal.x, 
				y: animal.y,
				z: animal.y + animal.sprite.height,
			})
		);
		_deadAnimals.forEach(corpse => 
			spritesToRender.push({
				sprite: corpse.sprite,
				x: corpse.x, 
				y: corpse.y,
				z: corpse.y + corpse.sprite.height,
			})
		);
		spritesToRender.push({
			sprite: _hunterSprite,
			x: x, 
			y: y,
			z: y + _hunterSprite.height,
		});
		spritesToRender.sort(function(a, b) {
			return a.z - b.z;
		});

		spritesToRender.forEach(spriteToRender => 
			spriteToRender.sprite.render(_context, spriteToRender.x, spriteToRender.y)
		);
				
		for (var i = 0; i < bullets.length; i++) {
			var bullet = bullets[i];
				
			_context.beginPath();
			_context.rect(bullet.x, bullet.y, 2, 2);
			_context.fillStyle = 'white';
			_context.fill();
		}
				
		_context.textAlign = 'right';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'black';
		_context.fillText('Animals killed: ' + score, 278, 10);		
		_context.fillText(Math.floor(timeRemaining), 70, 10);
		_context.textAlign = 'left';	
		_context.fillText('Time: ', 10, 10);
		
		for (var key in _sprites) {
			if (_sprites.hasOwnProperty(key)) {			
				_sprites[key].update();
			}
		}
	}

	var spawnAnimal = function() {
		var randomNumber = Math.random();
		if (randomNumber < 0.25) {
			return spawnBuffalo();
		} else {
			return spawnRabbit();
		}
	}

	var spawnBuffalo = function() {
		return spawnAnimalWithSprite(_buffaloSprite, _deadBuffaloSprite, 200);
	}

	var spawnRabbit = function() {
		return spawnAnimalWithSprite(_rabbitSprite, _deadRabbitSprite, 3);
	}

	var spawnAnimalWithSprite = function(sprite, deadSprite, averageYield) {
		var height = sprite.height;
		var width = sprite.width;
		
		var x = 0 - width;
		var y = Math.floor(Math.random() * (_canvas.height - height - 15)) + 15;
		var speed = Math.floor(Math.random() * 10) + 5;
		
		return {
			averageYield: averageYield,
			deadSprite: deadSprite,
			speed: speed,
			sprite: sprite,
			x: x,
			y: y
		};	
	}
	
	var handleCollision = function(animalIndex) {		
		if (animalIndex != null) {
			var animal = animals[animalIndex];
			var meat = Math.round(Math.random() * animal.averageYield) + animal.averageYield;
			_deadAnimals.push({
				sprite: animal.deadSprite,
				x: animal.x,
				y: animal.y,
				meat: meat,
			});
			animals.splice(animalIndex, 1);
			score++;
		}
	}
	
	var detectCollision = function() {
		var animalHeight = _buffaloSprite.height;
		var animalWidth = _buffaloSprite.width;
		var bulletWidth = 2;
		var bulletHeight = 2;
		var animalHitBoxMargin = 3;
		for (var i = 0; i < animals.length; i++) {
			var animal = animals[i];
			for (var j = bullets.length - 1; j >= 0; j--) {
				var bullet = bullets[j];
				if (bullet.x + bulletWidth >= animal.x + animalHitBoxMargin && bullet.x <= animal.x + animalWidth - animalHitBoxMargin * 2
					&& bullet.y + bulletHeight >= animal.y + animalHitBoxMargin && bullet.y <= animal.y + animalHeight - animalHitBoxMargin * 2) {
					bullets.splice(j, 1);
					handleCollision(i);
					break;
				}
			}
		}
		return null;
	}
	
	var end = function(meat) {
		timeRemaining = DEFAULT_TIME_REMAINING;
		animals = [];
		_deadAnimals = [];
		score = 0;
		window.document.onkeydown = null;
		_callback(meat);
	}
	
	var showPostMortem = function() {
		var meat = 0;
		for (var i = 0; i < _deadAnimals.length; i++) {
			meat += _deadAnimals[i].meat;
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
		var bulletSpeed = 12;
		for (var i = bullets.length - 1; i >= 0; i--) {
			var bullet = bullets[i];
			switch (bullet.direction) {
				case "up":
					bullet.y -= bulletSpeed;
					break;
				case "down":
					bullet.y += bulletSpeed;
					break;
				case "right":
					bullet.x += bulletSpeed;
					break;
				default: 
					bullet.x -= bulletSpeed;
					break;
			}

			if (bullet.x < 0 || bullet.y < 0 || bullet.x > 280 || bullet.y > 180) {
				bullets.splice(i, 1);
			}
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
		_deadBuffaloSprite = _sprites['buffalo-dead'];
		_hunterSprite = _sprites['hunter-' + _direction];
		_rabbitSprite = sprites['rabbit'];
		_deadRabbitSprite = sprites['rabbit-dead'];
			
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
	
	var spawnBullet = function() {		
		var bulletX = x;
		var bulletY = y;
		switch (_direction) {
			case "up":
				bulletX += 14;
				break;
			case "down":
				bulletX += 14;
				bulletY += 30;
				break;
			case "right":
				bulletX += 29;
				bulletY += 6;
				break;
			default: 
				bulletY += 6;
				break;
		}

		bullets.push({
			x: bulletX,
			y: bulletY,
			direction: _direction,
		});
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
						updateDirection("up");
						y -= speed;
						detectCollision();
					}
					break;
				case keyboard.DOWN:
					if (y <= _canvas.height - hunterHeight - speed) {
						updateDirection("down");
						y += speed;
						detectCollision();
					}
					break;
				case keyboard.LEFT:
					if (x >= speed) {
						updateDirection("left");
						x -= speed;
						detectCollision();
					}
					break;
				case keyboard.RIGHT:
					if (x <= _canvas.width - hunterWidth - speed) {
						updateDirection("right");
						x += speed;
						detectCollision();
					}
					break;
				case keyboard.SPACE:
					var now = Date.now();
					if (now >= _lastFireTime + _rateOfFire) {
						spawnBullet();
						_lastFireTime = now;
						break;
					}
			}
		}
	}

	var updateDirection = function(direction) {		
		_direction = direction;
		_hunterSprite = _sprites['hunter-' + direction];
	}
}