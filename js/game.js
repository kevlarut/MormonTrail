var game = new function() {

	var canvas = null;
	var context = null;
	var frameRate = 3;
	var sprites = {};
	var background = {};
	var self = this;
	var date = new Date(1847, 4, 5);
	var roadometer = 0;
	var isPaused = false;
	var nextLandmarkIndex = 0;
	var gameLoopInterval = null;
	var party = [];	
	var _lastDiseaseEventMile = 0;
	var _lastHuntingEventMile = 0;
	var _lastBuffaloEventMile = 0;
	
	this.togglePause = function() {
		isPaused = !isPaused;
	}
	
	this.ensureThatASongIsPlaying = function() {
		for (var i = 0; i < audioAssets.length; i++) {
			var song = audioAssets[i];			
			if (typeof song.element != 'undefined' && song.element.currentTime != 0 && song.element.currentTime < song.element.duration) {
				return;
			}
		}
		
		this.playTravelSong(); 
	}
	
	this.playTravelSong = function() {		
		var min = 1;
		var max = audioAssets.length - 1;
		var randomIndexExceptVictorySong = Math.floor(Math.random() * (max - min + 1) + min)
	
		var song = audioAssets[randomIndexExceptVictorySong];
		if (typeof song.element != 'undefined') {
			song.element.currentTime = 0;
			song.element.play();
		}
	}
	
	this.preLoadAudio = function() {
		for (var key in audioAssets) {		
			if (audioAssets.hasOwnProperty(key)) {
				var audioAsset = audioAssets[key];
				var element = document.createElement('audio');
				element.preload = 'auto';
				element.src = audioAsset.src;			
				audioAssets[key].element = element;
			}			
		}
	}
	
	this.preLoadImages = function() {
	
		var countOfImagesToLoad = Object.keys(spriteAssets).length + 1;
		var loaded = 0;
	
		var callback = function() { 
			if (++loaded > countOfImagesToLoad) {			
				splashScreen.start(canvas, context, sprites, function() {
					self.chooseCharacterNames();					
				});			
			}
		}
		
		for (var key in spriteAssets) {
			if (spriteAssets.hasOwnProperty(key)) {
				var spriteAsset = spriteAssets[key];
				var currentSprite = new sprite();				
				currentSprite.preLoadImages(spriteAsset, callback);
				sprites[key] = currentSprite;
			}
		}
		
		background = new scrollingSprite();
		background.preLoadImages(['img/clouds.gif', 'img/plains-background.gif', 'img/plains-foreground.gif'], callback);
	}
	
	var stopAllAudio = function() {
		for (var i = 0; i < audioAssets.length; i++) {
			var song = audioAssets[i];
			song.element.pause();
			song.element.currentTime = 0;
		}
	}
	
	var resumeAfterMiniGame = function() {
		stopAllAudio(); 
		isPaused = false;
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					game.togglePause();
					break;
			}
		}
	}
	
	var drawDialogBox = function(message) {				
		var horizontalCenter = canvas.width / 2;		
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText(message, horizontalCenter, 105);
		context.fillText('Press ENTER to continue.', horizontalCenter + 10, 115);
	}
	
	var giveSomeoneADiseaseAndShowADialogBoxAboutIt = function() {
		var min = 0;
		var max = party.length;
		var randomIndex = Math.floor(Math.random() * (max - min)) + min;
		var person = party[randomIndex];		
		if (typeof person.disease == 'undefined' || person.disease == null) {		
			sprites[person.name.toLowerCase()].render(context, 5, 97);
			person.disease = "mountain fever";
			drawDialogBox(person.name + ' has ' + person.disease + '.');
			
		}
		else {
			isPaused = false;
		}
	}
	
	var renderHandcartFamily = function() {
		var x = 225;
		var y = 43;
		
		x -= sprites['handcart'].width;
		sprites['handcart'].render(context, x, y);
		for (var i = 0; i < party.length; i++) {
			if (party[i].name == 'John') {
				x -= sprites['john-walking'].width + 2;
				sprites['john-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Joseph') {
				x -= sprites['joseph-walking'].width + 2;
				sprites['joseph-walking'].render(context, x, y);
			}
		}
	}
	
	this.gameLoop = function() {
		if (!isPaused) {
		
			var minimumMilesBetweenSameEvent = 10;
			if (Math.random() < 0.005 && roadometer - _lastBuffaloEventMile >= minimumMilesBetweenSameEvent) {
				_lastBuffaloEventMile = roadometer;
				isPaused = true;	
				stopAllAudio();			
				buffaloChipsMiniGame.start(canvas, context, sprites, audioAssets, function() { resumeAfterMiniGame(); });
				return;
			}
			else if (Math.random() < 0.01 && roadometer - _lastHuntingEventMile >= minimumMilesBetweenSameEvent) {
				_lastHuntingEventMile = roadometer;
				isPaused = true;	
				stopAllAudio();				
				huntingMiniGame.start(canvas, context, sprites, audioAssets, function() { resumeAfterMiniGame(); });
				return;			
			}
			else if (Math.random() < 0.02 && roadometer - _lastDiseaseEventMile >= minimumMilesBetweenSameEvent) {
				_lastDiseaseEventMile = roadometer;
				isPaused = true;
				giveSomeoneADiseaseAndShowADialogBoxAboutIt();
				return;
			}
		
			var dayAdvancementSpeed = 1 / 10;
			date.setTime( date.getTime() + 1 * 86400000 * dayAdvancementSpeed );
		
			var milesTraveled = Math.round(8.5 * dayAdvancementSpeed);
			
			var nextLandmark = landmarks[nextLandmarkIndex];
			var nextLandmarkMiles = nextLandmark.miles;
			if (roadometer + milesTraveled >= nextLandmarkMiles) {		
			
				roadometer = nextLandmarkMiles;
				nextLandmarkIndex++;			
				
				context.clearRect(0, 0, canvas.width, canvas.height);
				sprites[nextLandmark.sprite].render(context, 0, 0);
				
				var horizontalCenter = canvas.width / 2;
				
				context.beginPath();
				context.rect(horizontalCenter - 100, 162, 200, 20);
				context.fillStyle = 'white';
				context.fill();
				
				if (nextLandmarkIndex == landmarks.length) {
					context.textAlign = 'center';
					context.font = "8px 'Here Lies MECC'";
					context.fillStyle = 'black';
					context.fillText(nextLandmark.name, horizontalCenter, 170);
					context.fillText(date.toDateString(), horizontalCenter, 180);
														
					context.fillText('"The wilderness and the solitary', horizontalCenter, 10);
					context.fillText('place shall be glad for them; and', horizontalCenter, 20);
					context.fillText('the desert shall rejoice, and', horizontalCenter, 30);
					context.fillText('blossom as the rose." (Isaiah 35:1)', horizontalCenter, 40);
					
					stopAllAudio();
						
					context.fillStyle = 'white';
					context.fillText("Press ENTER to start a new game", horizontalCenter, 190);
					
					var song = audioAssets[0];
					if (typeof song.element != 'undefined') {
						song.element.currentTime = 0;
						song.element.play();
					}
					
					clearInterval(gameLoopInterval);
					window.document.onkeydown = null;
					window.document.onkeydown = function(event) {		  
						switch (event.keyCode) {
							case keyboard.ENTER:			
								window.document.onkeydown = null;
								date = new Date(1847, 4, 5);
								roadometer = 0;
								isPaused = false;
								nextLandmarkIndex = 0;
							
								self.chooseCharacterNames();
								break;
						}
					}			
					
				}
				else {				
					context.textAlign = 'center';
					context.font = "8px 'Here Lies MECC'";
					context.fillStyle = 'black';
					context.fillText(nextLandmark.name, horizontalCenter, 170);
					context.fillText(date.toDateString(), horizontalCenter, 180);
					context.fillStyle = 'white';
					context.fillText("Press ENTER to continue", horizontalCenter, 190);
				}
				
				isPaused = true;
				return;
			}
			else {
				roadometer += milesTraveled;
			}
		
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			context.beginPath();
			context.rect(0, 123, 280, 59);
			context.fillStyle = 'white';
			context.fill();
			
			context.textAlign = 'left';
			context.font = "8px 'Here Lies MECC'";
			context.fillStyle = 'black';
			context.fillText("Date: " + date.toDateString(), 10, 140);
			context.fillText("Roadometer: " + roadometer + " miles", 10, 150);
			
			background.render(context, 0, 10);
			renderHandcartFamily();
			sprites['grass'].render(context, 0, 70);
			
			for (var key in sprites) {
				if (sprites.hasOwnProperty(key)) {			
					sprites[key].update();
				}
			}
			background.update();			
		}
		
		self.ensureThatASongIsPlaying();
	}
	
	var drawBuySuppliesMenu = function(cursor, items, capacity) {
	
		context.clearRect(0, 15, canvas.width, 100);
		
		var food = capacity;
	
		var line = 0;
		for (line = 0; line < items.length; line++) {
			var item = items[line];
			
			if (item.isSelected) {
				food -= item.weight;
			}
			
			var y = 25 + 15 * line;
			
			if (line === cursor) {		
				context.beginPath();
				context.rect(0, y - 10, canvas.width, 12);
				context.fillStyle = 'white';
				context.fill();
				context.fillStyle = 'black';
			}
			else {			
				context.fillStyle = 'white';
			}
			
			context.textAlign = 'left';
			context.fillText('[' + (item.isSelected ? 'X' : ' ') + '] ' + item.name, 10, y);				
			context.textAlign = 'right';
			context.fillText(item.weight + '#', 275, y);
		}
		
		context.textAlign = 'left';
		context.fillText('You will carry ' + food + ' pounds of food.', 10, 40 + line * 15);
	}
	
	var buySupplies = function() {
		var capacity = 500;
		var clothingWeight = 0;
		for (var i = 0; i < party.length; i++) {
			if (party[i].isAdult) {
				clothingWeight += 17;
			}
			else {
				clothingWeight += 10;
			}
		}
	
		stopAllAudio();
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		context.textAlign = 'center';
		context.font = "8px 'Here Lies MECC'";
		context.fillStyle = 'black';
		
		context.beginPath();
		context.rect(0, 0, canvas.width, 13);
		context.fillStyle = '#93D6BF';
		context.fill();
		
		var horizontalCenter = canvas.width / 2;		
		context.textAlign = 'left';
		context.fillStyle = 'black';
		context.fillText("Pioneer Outfitter General Store", 10, 10);
		context.fillStyle = 'white';
		
		var items = [
			{
				name: 'Spiffy home decorations',
				weight: 60,
				isSelected: false,
				isRequired: false
			},
			{
				name: 'Guns and ammunition',
				weight: 10,
				isSelected: false,
				isRequired: false
			},
			{
				name: 'Clothing and suchlike',
				weight: clothingWeight,
				isSelected: true,
				isRequired: true
			},
		];
		
		var cursor = 0;	
		drawBuySuppliesMenu(cursor, items, capacity);
				
		context.beginPath();
		context.rect(17, 175, 240, 13);
		context.fillStyle = 'white';
		context.fill();

		context.fillStyle = 'black';
		context.fillText("Press ENTER to continue", 20, 185);
				
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					window.document.onkeydown = null;
					start();
					break;
				case keyboard.X:
				case keyboard.SPACE:
					items[cursor].isSelected = !items[cursor].isSelected;
					drawBuySuppliesMenu(cursor, items, capacity);
					break;
				case keyboard.UP:
					if (cursor > 0) {
						cursor--;
						drawBuySuppliesMenu(cursor, items, capacity);
					}
					break;
				case keyboard.DOWN:
					if (cursor < items.length - 2) {
						cursor++;
						drawBuySuppliesMenu(cursor, items, capacity);
					}
					break;
			}
		}
	}
			
	this.chooseCharacterNames = function() {
	
		stopAllAudio();
	
		var partySize = 4;
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		context.beginPath();
		context.rect(20, 10, 240, 25);
		context.fillStyle = 'white';
		context.fill();
			
		context.textAlign = 'center';
		context.font = "8px 'Here Lies MECC'";
		context.fillStyle = 'black';
		
		var horizontalCenter = canvas.width / 2;
		context.fillText("The Mormon Trail", horizontalCenter, 20);
		context.fillText("by Kevin Owens", horizontalCenter, 30);
		
		context.textAlign = 'left';
		context.fillStyle = 'white';
		context.fillText("Choose four family members:", 20, 50);
		context.fillText("Press SPACE to choose someone", 20, 172);
		
		var names = [
			{ name: 'Joseph', isAdult: true, selected: false },
			{ name: 'Emma', isAdult: true, selected: false }, 
			{ name: 'Brigham', isAdult: true, selected: false }, 
			{ name: 'Lucy', isAdult: true, selected: false }, 
			{ name: 'John', isAdult: false, selected: false }, 
			{ name: 'Mary', isAdult: false, selected: false }, 
			{ name: 'Alma', isAdult: false, selected: false }, 
			{ name: 'Eliza', isAdult: false, selected: false }
		];
		var cursor = 0;
		var selectedCount = 0;
		drawCharacterMenu(cursor, names);
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					if (selectedCount == partySize) {
						window.document.onkeydown = null;
						for (var i = 0; i < names.length; i++) {
							var name = names[i];
							if (name.selected) {
								party.push(name);
							}
						}
						buySupplies();
					}
					break;
				case keyboard.SPACE:
					if (names[cursor].selected) {
						names[cursor].selected = false;
						selectedCount--;
						context.clearRect(17, 175, 240, 13);
					}
					else if (selectedCount < partySize) {
						names[cursor].selected = true;
						selectedCount++;
						if (selectedCount == partySize) {
							context.beginPath();
							context.rect(17, 175, 240, 13);
							context.fillStyle = 'white';
							context.fill();
		
							context.fillStyle = 'black';
							context.fillText("Press ENTER to continue", 20, 185);
						}
					}
					drawCharacterMenu(cursor, names);
					break;
				case keyboard.LEFT:
					if (cursor % 2 == 1) {
						cursor--;
						drawCharacterMenu(cursor, names);
					}
					break;
				case keyboard.UP:
					if (cursor > 1) {
						cursor -= 2;
						drawCharacterMenu(cursor, names);
					}
					break;
				case keyboard.RIGHT:
					if (cursor % 2 == 0) {
						cursor++;
						drawCharacterMenu(cursor, names);
					}
					break;
				case keyboard.DOWN:
					if (cursor < names.length - 2) {
						cursor += 2;
						drawCharacterMenu(cursor, names);
					}
					break;
			}
		}
	}
	
	var drawCharacterMenu = function(cursor, names) {
		context.clearRect(0, 58, canvas.width, 100);
		var index = 0;
		for (var row = 0; row < 4; row++) {
			for (var col = 0; col < 2; col++) {
				
				var x = 20 + col * 100;
				var y = 60 + row * 25;
				if (index === cursor) {				
					context.beginPath();
					context.rect(x - 2, y - 2, 24, 24);
					context.fillStyle = 'white';
					context.fill();
				}
			
				var name = names[index];
				sprites[name.name.toLowerCase()].render(context, x, y);
				if (name.selected) {
					context.fillStyle = 'white';
				}
				else {
					context.fillStyle = 'gray';
				}
				context.fillText(name.name, x + 25, y + 12);
				index++;
			}
		}	
	}
	
	this.init = function() {
		canvas = document.getElementById('game');		
		context = canvas.getContext('2d');
		showLoadingScreen();				
		this.preLoadAudio();
		this.preLoadImages();
	}
	
	var start = function() {
	
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					game.togglePause();
					break;
			}
		}
		self.gameLoop();
		gameLoopInterval = setInterval(self.gameLoop, 1000 / frameRate);	
	}
	
	var showLoadingScreen = function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.textAlign = 'center';
		context.font = "8px 'Here Lies MECC'";
		context.fillStyle = 'white';		
		var horizontalCenter = canvas.width / 2;
		context.fillText("Loading...", horizontalCenter, 80);
	}
}

window.onload = function() {
	game.init();
};