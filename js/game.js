var game = new function() {

	this.touchHandler = null;

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
	
	var continueAfterCharacterScreen = function(partyChosenFromCharacterScreen) {
		party = partyChosenFromCharacterScreen;
		buySuppliesScreen.start(canvas, context, party, function(nonFoodInventoryFromSuppliesScreen, foodFromSuppliesScreen) {
			nonFoodInventory = nonFoodInventoryFromSuppliesScreen;
			food = foodFromSuppliesScreen;
			start();
		});
	}

	var preLoadImages = function() {	
		var countOfImagesToLoad = Object.keys(spriteAssets).length + 1;
		var loaded = 0;
	
		var callback = function() { 
			if (++loaded >= countOfImagesToLoad) {
				loadingScreen.end();
				splashScreen.start(canvas, context, sprites, function() {
					self.touchHandler = null;
					characterScreen.start(canvas, context, sprites, continueAfterCharacterScreen);				
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
	
	var resume = function() {
		audioPlayer.stopAllAudio(); 
		isPaused = false;
		setEnterToPonder();
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
		setEnterToResume();
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
		var cholera = {
			name: 'cholera',
			duration: 14,
			chanceOfDeath: 0.5
		};
		var dysentery = {
			name: 'dysentery',
			duration: 7,
			chanceOfDeath: 0.1
		};
		var rockyMountainFever = {
			name: 'mountain fever',
			duration: 14,
			chanceOfDeath: 0.225
		};
		var typhus = {
			name: 'typhus',
			duration: 14,
			chanceOfDeath: 0.1
		};
		const diseases = [cholera, dysentery, rockyMountainFever, typhus];
		var randomDiseaseIndex = Math.floor(Math.random() * (diseases.length));
		const disease = diseases[randomDiseaseIndex];
	
		var min = 0;
		var max = party.length;
		var randomIndex = Math.floor(Math.random() * (max - min)) + min;
		var person = party[randomIndex];
		if (typeof person.disease == 'undefined' || person.disease == null) {
			person.disease = disease;
			setFutureEvent(disease.duration, function() {				
				resolveDisease(person, disease);
			});
			var personName = person.name;
			var message = personName + ' has ' + disease.name + '.';
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
						audioPlayer.stopAllAudio();			
						buffaloChipsMiniGame.start(canvas, context, sprites, audioAssets, resume);
						return;
					}
				}
				else if (randomNumber < 0.01) {
					if (roadometer - _lastHuntingEventMile >= minimumMilesBetweenSameRandomEvent) {
						_lastHuntingEventMile = roadometer;
						if (!nonFoodInventory.some(item => item.name === "Flintlock musket")) {							
							var person = party[0];
							message = "You have no gun to hunt with.";
							showMessageForPerson(person.name, message);
							isPaused = true;
							return;
						}
						isPaused = true;	
						audioPlayer.stopAllAudio();	

						var capacity = HANDCART_CAPACITY;
						for (var i = 0; i < nonFoodInventory.length; i++) {
							capacity -= nonFoodInventory[i].weight;
						}
						capacity -= food;
						capacity = Math.round(capacity);
						
						huntingMiniGame.start(capacity, canvas, context, sprites, audioAssets, function(meat) { 
							food += meat;
							resume();
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
				setEnterToResume();
				
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
					
					audioPlayer.stopAllAudio();
						
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
			context.fillText("Press ENTER to ponder the situation", 0, 110);

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
			
	var onMouseDown = function(event) {
        event.preventDefault();
		var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;
		handleTouchInput(x, y);
	}
	
	var onTouchStart = function(event) {
        event.preventDefault();
		var x = event.targetTouches[0].pageX - canvas.offsetLeft;
		var y = event.targetTouches[0].pageY - canvas.offsetTop;
		handleTouchInput(x, y);
	}
	
	var handleTouchInput = function(x, y) {
		if (self.touchHandler != null) {
			self.touchHandler(x, y);
		}
	}
	
	this.init = function() {
		isPaused = false;
		canvas = document.getElementById('game');		
		context = canvas.getContext('2d');		
		loadingScreen.start(canvas, context, sprites);	
		preLoadAudio();
		preLoadImages();
		
		canvas.addEventListener("touchstart", onTouchStart, false);
        canvas.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("mousedown", onMouseDown, false);
	}
	
	var start = function() {
		setEnterToPonder();
		this.touchHandler = null;
		
		self.gameLoop();
		gameLoopInterval = setInterval(self.gameLoop, 1000 / frameRate);	
	}

	var setEnterToPonder = function() {
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					game.togglePause();
					ponderScreen.start(canvas, context, resume);
					break;
			}
		}
	}

	var setEnterToResume = function() {		
		window.document.onkeydown = function(event) {		  
			switch (event.keyCode) {
				case keyboard.ENTER:	
					resume();
					break;
			}
		}
	}
}

window.onload = function() {
	game.init();
};