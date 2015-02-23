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
		for (var key in spriteAssets) {
			if (spriteAssets.hasOwnProperty(key)) {
				var spriteAsset = spriteAssets[key];
				var currentSprite = new sprite();				
				currentSprite.preLoadImages(spriteAsset);
				sprites[key] = currentSprite;
			}
		}
		
		background = new scrollingSprite();
		background.preLoadImages(['img/plains-background.gif']);		
	}
	
	this.start = function() {
		canvas = document.getElementById('game');		
		context = canvas.getContext('2d');		
		this.preLoadAudio();
		this.preLoadImages();
				
		this.gameLoop();
		setInterval(this.gameLoop, 1000 / frameRate);
	}

	this.gameLoop = function() {
	
		if (!isPaused) {
			var dayAdvancementSpeed = 1 / 10;
			date.setTime( date.getTime() + 1 * 86400000 * dayAdvancementSpeed );
		
			roadometer += Math.round(8.5 * dayAdvancementSpeed);
		
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			context.beginPath();
			context.rect(0, 123, 280, 59);
			context.fillStyle = 'white';
			context.fill();
			
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
}

window.onload = function() {
	game.start();
};