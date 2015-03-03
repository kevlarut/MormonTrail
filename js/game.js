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
				self.chooseCharacterNames();
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
		background.preLoadImages(['img/plains-background.gif'], callback);
	}
	
	var stopAllAudio = function() {
		for (var i = 0; i < audioAssets.length; i++) {
			var song = audioAssets[i];
			song.element.pause();
			song.element.currentTime = 0;
		}
	}
	
	this.gameLoop = function() {
		if (!isPaused) {
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
						var ENTER = 13;					  
						switch (event.keyCode) {
							case ENTER:			
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
			sprites['handcart'].render(context, 180, 43);
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
			{ name: 'Joseph', selected: false },
			{ name: 'Emma', selected: false }, 
			{ name: 'Brigham', selected: false }, 
			{ name: 'Lucy', selected: false }, 
			{ name: 'John', selected: false }, 
			{ name: 'Mary', selected: false }, 
			{ name: 'Alma', selected: false }, 
			{ name: 'Elizabeth', selected: false }
		];
		var party = [];
		var cursor = 0;
		var selectedCount = 0;
		drawCharacterMenu(cursor, names);
		
		window.document.onkeydown = function(event) {
			var ENTER = 13;
			var SPACE = 32;
			var LEFT = 37;
			var UP = 38;
			var RIGHT = 39;
			var DOWN = 40;	  
		  
			switch (event.keyCode) {
				case ENTER:
					if (selectedCount == partySize) {
						window.document.onkeydown = null;
						start();
					}
					break;
				case SPACE:
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
							context.fillText("Press ENTER to start the game", 20, 185);
						}
					}
					drawCharacterMenu(cursor, names);
					break;
				case LEFT:
					if (cursor % 2 == 1) {
						cursor--;
						drawCharacterMenu(cursor, names);
					}
					break;
				case UP:
					if (cursor > 1) {
						cursor -= 2;
						drawCharacterMenu(cursor, names);
					}
					break;
				case RIGHT:
					if (cursor % 2 == 0) {
						cursor++;
						drawCharacterMenu(cursor, names);
					}
					break;
				case DOWN:
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
			var ENTER = 13;
		  
			switch (event.keyCode) {
				case ENTER:
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