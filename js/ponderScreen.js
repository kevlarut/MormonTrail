var ponderScreen = new function() {
    var canvas = null;
    var context = null;
    var callback = null;
	var sprites = null;
	var self = this;

    this.start = function(canvas, context, sprites, callback) {
        this.canvas = canvas;
        this.context = context;
        this.callback = callback;
		this.sprites = sprites;
		this.initialize();	
	}
    
	this.initialize = function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.context.textAlign = 'left';
		this.context.font = "8px 'Here Lies MECC'";					
		this.context.fillStyle = 'white';
		
		this.context.fillText("You may:", 10, 10);
		this.context.fillText("1. Continue on the trail", 20, 30);
		this.context.fillText("2. Check your supplies", 20, 40);
		this.context.fillText("3. Look at map", 20, 50);
		this.context.fillText("What is your choice?", 10, 180);

		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ONE:
					window.document.onkeydown = null;
					self.end();
					break;
				case keyboard.TWO:
					window.document.onkeydown = null;
					suppliesScreen.start(self.canvas, self.context, self.sprites, self.initialize);
					break;
				case keyboard.THREE:
					window.document.onkeydown = null;
					mapScreen.start(self.canvas, self.context, self.sprites, self.initialize);
					break;
			}
		}
	}

    this.end = function() {
        this.callback();
    }
}