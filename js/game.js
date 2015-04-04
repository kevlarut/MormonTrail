var game = new function() {

	var food = 0;
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
	var _lastStarvationEventMile = 0;
	var futureEvents = [];
	var HANDCART_CAPACITY = 500;
	var nonFoodInventory = [];
	
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
	
	var preLoadAudio = function() {
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
	
	var preLoadImages = function() {
	
		var countOfImagesToLoad = Object.keys(spriteAssets).length + 1;
		var loaded = 0;
	
		var callback = function() { 
			if (++loaded >= countOfImagesToLoad) {
				loadingScreen.end();
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
	
	var drawDialogBoxBesidePortrait = function(message) {
		var spaceTakenUpByPortrait = 25;
		var horizontalCenter = ((canvas.width - spaceTakenUpByPortrait) / 2) + spaceTakenUpByPortrait;
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText(message, horizontalCenter, 105);
		context.fillText('Press ENTER to continue.', horizontalCenter, 115);
	}
	
	var showMessageForPerson = function(personName, message) {
		context.clearRect(0, 95, canvas.width, 20);	
		sprites[personName.toLowerCase()].render(context, 5, 97);
		drawDialogBoxBesidePortrait(message);
	}
	
	var setFutureEvent = function(daysInFuture, delegate) {
		var futureDate = new Date();
		futureDate.setTime( date.getTime() + daysInFuture * 86400000 );
		
		futureEvents.push({
			date: futureDate, 
			action: delegate
		});
	}
	
	var gameOver = function() {	
		clearInterval(gameLoopInterval);
		window.document.onkeydown = null;
		date = new Date(1847, 4, 5);
		roadometer = 0;
		isPaused = false;
		nextLandmarkIndex = 0;
	
		self.chooseCharacterNames();
	}
	
	var killPerson = function(person) {	
		for (var i = 0; i < party.length; i++) {
			if (party[i] == person) {
				party.splice(i, 1);
			}
		}
		
		if (party.length == 0) {
			gameOver();
		}
	}
	
	var resolveDisease = function(person, disease) {
		if (Math.random() < disease.chanceOfDeath) {
			var personName = person.name;
			var message = personName + ' has died of disease.';
			showMessageForPerson(personName, message);
			isPaused = true;
			killPerson(person);
		}
		else {
			person.disease = null;
			var personName = person.name;
			var message = personName + ' is no longer sick.';
			showMessageForPerson(personName, message);
			isPaused = true;
		}
	}
	
	var resolveStarvation = function(person) {
		if (person.isStarving) {
			var personName = person.name;
			var message = personName + ' has died.';
			showMessageForPerson(personName, message);
			isPaused = true;
			killPerson(person);
		}
	}
	
	var giveSomeoneADiseaseAndShowADialogBoxAboutIt = function() {	
	
		var rockyMountainFever = {
			name: 'mountain fever',
			duration: 14,
			chanceOfDeath: 0.225
		};
	
		var min = 0;
		var max = party.length;
		var randomIndex = Math.floor(Math.random() * (max - min)) + min;
		var person = party[randomIndex];
		if (typeof person.disease == 'undefined' || person.disease == null) {
			person.disease = rockyMountainFever;
			setFutureEvent(rockyMountainFever.duration, function() {				
				resolveDisease(person, rockyMountainFever);
			});
			var personName = person.name;
			var message = personName + ' has ' + rockyMountainFever.name + '.';
			showMessageForPerson(personName, message);			
		}
		else {
			isPaused = false;
		}
	}
	
	var starveSomeone = function() {	
		var starvationDuration = 7;
		var min = 0;
		var max = party.length;
		var randomIndex = Math.floor(Math.random() * (max - min)) + min;
		var person = party[randomIndex];
		if (typeof person.isStarving === 'undefined' || !person.isStarving) {
			person.isStarving = true;
			setFutureEvent(starvationDuration, function() {				
				resolveStarvation(person);
			});
			var personName = person.name;
			var message = personName + ' is starving.';
			showMessageForPerson(personName, message);	
		}
		else {
			isPaused = false;
		}
	}
	
	var isAnyoneSick = function() {
		for (var i = 0; i < party.length; i++) {
			var person = party[i];
			if (typeof(person.disease) !== 'undefined' && person.disease !== null) {
				return true;
			}
		}
		return false;
	}
	
	var isAnyoneStarving = function() {
		for (var i = 0; i < party.length; i++) {
			var person = party[i];
			if (person.isStarving) {
				return true;
			}
		}
		return false;
	}
	
	var renderHandcartFamily = function() {
		var x = 270;
		var y = 43;
		
		for (var i = 0; i < party.length; i++) {
			if (party[i].name == 'Alma') {
				x -= sprites['alma-walking'].width + 2;
				sprites['alma-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Brigham') {
				x -= sprites['brigham-walking'].width + 2;
				sprites['brigham-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Eliza') {
				x -= sprites['eliza-walking'].width + 2;
				sprites['eliza-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Emma') {
				x -= sprites['emma-walking'].width + 2;
				sprites['emma-walking'].render(context, x, y);
			}
			else if (party[i].name == 'John') {
				x -= sprites['john-walking'].width + 2;
				sprites['john-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Joseph') {
				x -= sprites['joseph-walking'].width + 2;
				sprites['joseph-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Lucy') {
				x -= sprites['lucy-walking'].width + 2;
				sprites['lucy-walking'].render(context, x, y);
			}
			else if (party[i].name == 'Mary') {
				x -= sprites['mary-walking'].width + 2;
				sprites['mary-walking'].render(context, x, y);
			}
		}
	}
	
	this.gameLoop = function() {
		if (!isPaused) {
		
			for (var i = futureEvents.length - 1; i >= 0; i--) {
				var event = futureEvents[i];
				if (event.date <= date) {
					event.action();
					futureEvents.splice(i, 1);
					return;
				}
			}
			
			var minimumMilesBetweenStarvationEvent = 1;
			var minimumMilesBetweenSameRandomEvent = 10;
			var minimumMilesBetweenAnyEvent = 1;
			var milesSinceLastEvent = Math.min(_lastHuntingEventMile, _lastDiseaseEventMile, _lastBuffaloEventMile);
			
			if (roadometer - milesSinceLastEvent >= minimumMilesBetweenAnyEvent) {
				var randomNumber = Math.random();
				if (randomNumber < 0.005) {
					if (roadometer - _lastBuffaloEventMile >= minimumMilesBetweenSameRandomEvent) {
						_lastBuffaloEventMile = roadometer;
						isPaused = true;	
						stopAllAudio();			
						buffaloChipsMiniGame.start(canvas, context, sprites, audioAssets, function() { resumeAfterMiniGame(); });
						return;
					}
				}
				else if (randomNumber < 0.01) {
					if (roadometer - _lastHuntingEventMile >= minimumMilesBetweenSameRandomEvent) {
						_lastHuntingEventMile = roadometer;
						isPaused = true;	
						stopAllAudio();	

						var capacity = HANDCART_CAPACITY;
						for (var i = 0; i < nonFoodInventory.length; i++) {
							capacity -= nonFoodInventory[i].weight;
						}
						capacity -= food;
						capacity = Math.round(capacity);
						
						huntingMiniGame.start(capacity, canvas, context, sprites, audioAssets, function(meat) { 
							food += meat;
							resumeAfterMiniGame(); 
						});
						return;			
					}
				}
				else if (randomNumber < 0.02) {
					if (roadometer - _lastDiseaseEventMile >= minimumMilesBetweenSameRandomEvent) {
						_lastDiseaseEventMile = roadometer;
						isPaused = true;
						giveSomeoneADiseaseAndShowADialogBoxAboutIt();
						return;
					}
				}
			}
		
			var dayAdvancementSpeed = 1 / 10;
			date.setTime( date.getTime() + 1 * 86400000 * dayAdvancementSpeed );
				
			var poundsOfFoodPerAdultPerDay = 2;
			var poundsOfFoodPerChildPerDay = poundsOfFoodPerAdultPerDay / 2;
			var partyFoodEatenPerDay = 0;
			for (var i = 0; i < party.length; i++) {
				var person = party[i];
				if (person.isAdult) {
					partyFoodEatenPerDay += poundsOfFoodPerAdultPerDay;
				}
				else {
					partyFoodEatenPerDay += poundsOfFoodPerChildPerDay;
				}
			}
			food -= partyFoodEatenPerDay * dayAdvancementSpeed;
			if (food < 0) {
				food = 0;
				if (roadometer - _lastStarvationEventMile >= minimumMilesBetweenStarvationEvent) {
					_lastStarvationEventMile = roadometer;
					isPaused = true;
					starveSomeone();
					return;
				}
			}
		
			var milesTravelledPerDay = 8.5;
			if (isAnyoneSick()) {
				milesTravelledPerDay /= 3;
			}
			if (isAnyoneStarving()) {
				milesTravelledPerDay /= 2;
			}
		
			var milesTraveled = milesTravelledPerDay * dayAdvancementSpeed;
			
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
					
					window.document.onkeydown = null;
					window.document.onkeydown = function(event) {		  
						switch (event.keyCode) {
							case keyboard.ENTER:	
								gameOver();
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
			context.font = '8px "Here Lies MECC"';
			context.fillStyle = 'black';
			context.fillText('Date: ' + date.toDateString(), 10, 140);
			context.fillText('Roadometer: ' + Math.round(roadometer) + ' miles', 10, 150);
			context.fillText('Food: ' + Math.round(food) + ' pounds', 10, 160);
			
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
		
		food = capacity;
	
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
		var capacity = HANDCART_CAPACITY;
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
		
		var clothingAndSuchlike = {
			name: 'Clothing and suchlike',
			weight: clothingWeight,
			isSelected: true,
			isRequired: true
		};
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
			clothingAndSuchlike
		];
		
		nonFoodInventory.push(clothingAndSuchlike);
		
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
					if (items[cursor].isSelected) {
						for (var i = 0; i < nonFoodInventory.length; i++) {
							if (nonFoodInventory[i].name === items[cursor].name) {
								items.splice(i, 1);
								break;
							}
						}
					}
					else {
						nonFoodInventory.push(items[cursor]);						
					}
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
		window.document.onclick = null;
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
		isPaused = false;
		canvas = document.getElementById('game');		
		context = canvas.getContext('2d');		
		loadingScreen.start(canvas, context, sprites);	
		preLoadAudio();
		preLoadImages();
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
}

window.onload = function() {
	game.init();
};