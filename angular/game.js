var artist = new function() {

	this.animationIndex = 0;
	this.context = null;
	this.wagonImage1 = null;
	this.wagonImage2 = null;
	this.canvasWidth = 0;
	
    this.drawTextAtLine = function (text, line) {
		var ctx = this.context;
		ctx	
			.clear()
			.bgIndex(0)
			.fillIndex(0)
			.font('c64')
			.textAlign('center')
			.penColor(255,255,255)
			.text(text, this.canvasWidth, 8*line);
    };
		
	this.drawWagon = function() {	
		if (this.animationIndex === 0) {
			this.context.drawImage(artist.wagonImage1, 170, 40);
		}
		else {
			this.context.drawImage(artist.wagonImage2, 170, 40);
		}
	}
	
	this.loadImages = function(onload) {
		artist.wagonImage1 = new Image;
		artist.wagonImage1.crossOrigin = '';
		//artist.wagonImage1.onload = onload;
		artist.wagonImage1.src = 'img/handcart1.gif';
		
		artist.wagonImage2 = new Image;
		artist.wagonImage2.crossOrigin = '';
		artist.wagonImage2.onload = onload;
		artist.wagonImage2.src = 'img/handcart2.gif';
	}
	
	this.init = function() {	
		var canvas = document.getElementById('game');
		var ctx = canvas.getContext('retro');
		
		this.context = ctx;
		
		var res = ctx.resolution(),
		w = res.width,
		h = res.height,
		canvasWidth = (w * 0.5)|0;
		this.canvasWidth = canvasWidth;
		
		this.loadImages(function() {
			ctx
				.palette('APPLEII')
				.addFonts([fontC64, fontRetroBig], startGame, function() { console.error('A font is missing...'); });
		});
	}
	
	this.renderWalkingScreen = function() {
		artist.drawTextAtLine('The Mormon Trail', 1);
		artist.drawWagon();		
	}
	
	this.gameLoop = function() {
		artist.renderWalkingScreen();
		if (this.animationIndex == 0) {
			this.animationIndex = 1;
		}
		else {
			this.animationIndex = 0;
		}
	}
}

artist.init();
	
function startGame() {
	artist.gameLoop();
	setInterval(artist.gameLoop, 1000);
}