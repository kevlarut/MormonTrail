var restScreen = new function() {
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
	
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				
		if (inventory.buffaloChips >= 1) {
			this.sprites["rest-fire"].render(this.context, 0, 0);
			inventory.buffaloChips -= 1;
			game.setLastRestDate();
		} else {
			this.sprites["rest-cold"].render(this.context, 0, 0);
		}

		this.context.textAlign = 'left';
		this.context.font = "8px 'Here Lies MECC'";					
		this.context.fillStyle = 'white';		
		
		context.beginPath();
		context.rect(40, 170, 200, 20);
		context.fillStyle = 'black';
		context.fill();

		context.fillStyle = 'white';
		this.context.textAlign = 'center';
		this.context.fillText("Buffalo chips remaining: " + inventory.buffaloChips, 140, 170);
		this.context.fillText("Press ENTER to continue", 140, 183);

		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					window.document.onkeydown = null;
					self.end();
					break;
			}
		}
	}
    
    this.end = function() {
        this.callback();
    }
}