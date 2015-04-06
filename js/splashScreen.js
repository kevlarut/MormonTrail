var splashScreen = new function() {	
	
	this.start = function(canvas, context, sprites, callback) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		sprites['splash'].render(context, 0, 0);
		
		context.beginPath();
		context.rect(10, 170, 260, 15);
		context.fillStyle = 'black';
		context.fill();
				
		var horizontalCenter = canvas.width / 2;
		context.font = "8px 'Here Lies MECC'";
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText("Press ENTER to start a new game", horizontalCenter, 180);
		
		var COME_ALL_YE_SAINTS_OF_ZION = 7;
		var song = audioAssets[COME_ALL_YE_SAINTS_OF_ZION];
		if (typeof song.element != 'undefined') {
			song.element.currentTime = 0;
			song.element.play();
		}
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
				case keyboard.SPACE:
					callback();
					break;
			}
		}
	}
}